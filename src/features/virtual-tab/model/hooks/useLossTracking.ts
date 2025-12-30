import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { LossIncident, LossType, TableSessionTracking } from '../types/lossTracking';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to manage loss incidents and tracking
 */
export function useLossTracking() {
    const { currentUser } = useAuth();
    const [incidents, setIncidents] = useState<LossIncident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to loss incidents
    useEffect(() => {
        if (!currentUser?.tenantId) {
            setLoading(false);
            return;
        }

        const incidentsRef = collection(db, 'lossIncidents');
        const q = query(
            incidentsRef,
            where('tenantId', '==', currentUser.tenantId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
                details: {
                    ...doc.data().details,
                    reportedAt: doc.data().details?.reportedAt?.toDate(),
                    reviewedAt: doc.data().details?.reviewedAt?.toDate(),
                },
                timeline: doc.data().timeline?.map((event: any) => ({
                    ...event,
                    timestamp: event.timestamp?.toDate(),
                })),
            })) as LossIncident[];

            setIncidents(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.tenantId]);

    /**
     * Report a loss incident (walkout, cancellation, etc.)
     */
    const reportLoss = async (
        type: LossType,
        sessionTracking: TableSessionTracking,
        description: string,
        evidence?: string[]
    ): Promise<string> => {
        if (!currentUser?.uid || !currentUser?.tenantId) {
            throw new Error('User not authenticated');
        }

        try {
            const incidentId = uuidv4();
            const incidentRef = doc(db, 'lossIncidents', incidentId);
            const now = new Date();

            // Calculate totals
            const amount = sessionTracking.totalOrdered - sessionTracking.totalPaid;
            const cost = sessionTracking.orders.reduce((sum, order) => {
                // TODO: Get actual cost from products
                return sum + (order.total * 0.3); // Estimativa: custo = 30% do preço
            }, 0);

            const incident: Omit<LossIncident, 'id'> = {
                tenantId: currentUser.tenantId,
                type,
                amount,
                cost,

                tableId: sessionTracking.tableId,
                tableNumber: sessionTracking.tableNumber,
                sessionId: sessionTracking.sessionId,
                orderId: sessionTracking.orders[0]?.orderId,

                tracking: {
                    openedBy: sessionTracking.openedByUserId,
                    openedByName: sessionTracking.openedByName,
                    attendedBy: sessionTracking.waitersInvolved.find(w => w.role === 'ATTENDANT')?.waiterId,
                    attendedByName: sessionTracking.waitersInvolved.find(w => w.role === 'ATTENDANT')?.waiterName,
                    deliveredBy: sessionTracking.deliveries.map(d => d.deliveredBy),
                    deliveredByNames: sessionTracking.deliveries.map(d => d.deliveredByName),
                    lastWaiterId: sessionTracking.waitersInvolved[sessionTracking.waitersInvolved.length - 1]?.waiterId,
                    lastWaiterName: sessionTracking.waitersInvolved[sessionTracking.waitersInvolved.length - 1]?.waiterName,
                },

                details: {
                    customerName: sessionTracking.customerName,
                    customerPhone: sessionTracking.customerPhone,
                    items: sessionTracking.orders.flatMap(order =>
                        // TODO: Get actual items from order
                        []
                    ),
                    description,
                    evidence,
                    reportedBy: currentUser.uid,
                    reportedByName: currentUser.displayName || 'Unknown',
                    reportedAt: now,
                    approved: false,
                },

                timeline: [
                    {
                        timestamp: now,
                        actor: currentUser.uid,
                        actorName: currentUser.displayName || 'Unknown',
                        action: 'INCIDENT_REPORTED',
                        details: description,
                    },
                ],

                status: 'PENDING',

                actions: {
                    notifiedManager: true,
                    notifiedOwner: false,
                    customerBlacklisted: false,
                    waiterWarned: false,
                    processImproved: false,
                },

                createdAt: now,
                updatedAt: now,
            };

            await setDoc(incidentRef, {
                ...incident,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                details: {
                    ...incident.details,
                    reportedAt: serverTimestamp(),
                },
                timeline: incident.timeline.map(event => ({
                    ...event,
                    timestamp: serverTimestamp(),
                })),
            });

            // Notify manager
            await notifyManager(incidentId, type, amount);

            // Auto-blacklist if walkout and high value
            if (type === 'WALKOUT' && amount > 100) {
                await addToBlacklist(sessionTracking.customerPhone, sessionTracking.customerName, incidentId, amount);
            }

            return incidentId;
        } catch (err) {
            console.error('Error reporting loss:', err);
            throw new Error('Erro ao reportar perda');
        }
    };

    /**
     * Approve or reject a loss incident
     */
    const reviewIncident = async (
        incidentId: string,
        approved: boolean,
        notes?: string
    ) => {
        if (!currentUser?.uid) {
            throw new Error('User not authenticated');
        }

        try {
            const incidentRef = doc(db, 'lossIncidents', incidentId);
            const now = new Date();

            await updateDoc(incidentRef, {
                status: approved ? 'APPROVED' : 'REJECTED',
                'details.approved': approved,
                'details.reviewedBy': currentUser.uid,
                'details.reviewedByName': currentUser.displayName,
                'details.reviewedAt': serverTimestamp(),
                'details.approvalNotes': notes,
                timeline: [
                    ...incidents.find(i => i.id === incidentId)!.timeline,
                    {
                        timestamp: now,
                        actor: currentUser.uid,
                        actorName: currentUser.displayName || 'Unknown',
                        action: approved ? 'APPROVED' : 'REJECTED',
                        details: notes,
                    },
                ],
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error('Error reviewing incident:', err);
            throw new Error('Erro ao revisar incidente');
        }
    };

    /**
     * Get loss statistics
     */
    const getLossStats = (period?: { start: Date; end: Date }) => {
        let filtered = incidents;

        if (period) {
            filtered = incidents.filter(i =>
                i.createdAt >= period.start && i.createdAt <= period.end
            );
        }

        const totalIncidents = filtered.length;
        const totalAmount = filtered.reduce((sum, i) => sum + i.amount, 0);
        const totalCost = filtered.reduce((sum, i) => sum + i.cost, 0);

        const byType = filtered.reduce((acc, incident) => {
            if (!acc[incident.type]) {
                acc[incident.type] = { count: 0, amount: 0, cost: 0 };
            }
            acc[incident.type].count++;
            acc[incident.type].amount += incident.amount;
            acc[incident.type].cost += incident.cost;
            return acc;
        }, {} as Record<LossType, { count: number; amount: number; cost: number }>);

        return {
            totalIncidents,
            totalAmount,
            totalCost,
            byType,
            averageLoss: totalIncidents > 0 ? totalAmount / totalIncidents : 0,
        };
    };

    return {
        incidents,
        loading,
        error,
        reportLoss,
        reviewIncident,
        getLossStats,
    };
}

// Helper functions
async function notifyManager(incidentId: string, type: LossType, amount: number) {
    // TODO: Implement notification system
    console.log(`Manager notified: ${type} - R$ ${amount}`);
}

async function addToBlacklist(phone: string, name: string, incidentId: string, amount: number) {
    // TODO: Implement blacklist system
    console.log(`Customer blacklisted: ${name} (${phone}) - R$ ${amount}`);
}
