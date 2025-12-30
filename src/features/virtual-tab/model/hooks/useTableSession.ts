import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    Timestamp
} from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { TableSession, QuickRegistrationData, TableSessionStatus } from '../types';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage table sessions (customer's virtual tab)
 */
export function useTableSession(tableId: string) {
    const { currentUser } = useAuth();
    const [session, setSession] = useState<TableSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get active session for this table
    useEffect(() => {
        if (!currentUser?.tenantId || !tableId) {
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const sessionsRef = collection(db, 'tableSessions');
                const q = query(
                    sessionsRef,
                    where('tenantId', '==', currentUser.tenantId),
                    where('tableId', '==', tableId),
                    where('status', '==', 'ACTIVE')
                );

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const data = doc.data();
                    setSession({
                        id: doc.id,
                        ...data,
                        openedAt: data.openedAt?.toDate(),
                        closedAt: data.closedAt?.toDate(),
                        firstOrderAt: data.firstOrderAt?.toDate(),
                        lastOrderAt: data.lastOrderAt?.toDate(),
                        createdAt: data.createdAt?.toDate(),
                        updatedAt: data.updatedAt?.toDate(),
                    } as TableSession);
                } else {
                    setSession(null);
                }
            } catch (err) {
                console.error('Error fetching table session:', err);
                setError('Erro ao carregar sessão da mesa');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [currentUser?.tenantId, tableId]);

    /**
     * Create a new table session
     */
    const createSession = async (data: QuickRegistrationData): Promise<TableSession> => {
        if (!currentUser?.tenantId) {
            throw new Error('Tenant ID not found');
        }

        try {
            const sessionRef = doc(collection(db, 'tableSessions'));
            const now = new Date();

            const newSession: Omit<TableSession, 'id'> = {
                tenantId: currentUser.tenantId,
                tableId,
                tableNumber: `Mesa ${tableId.replace('table-', '')}`,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                status: 'ACTIVE',
                openedAt: now,
                orderIds: [],
                totalAmount: 0,
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(sessionRef, {
                ...newSession,
                openedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            const createdSession: TableSession = {
                id: sessionRef.id,
                ...newSession,
            };

            setSession(createdSession);
            return createdSession;
        } catch (err) {
            console.error('Error creating table session:', err);
            throw new Error('Erro ao criar sessão da mesa');
        }
    };

    /**
     * Add order to session
     */
    const addOrderToSession = async (orderId: string, orderTotal: number) => {
        if (!session) {
            throw new Error('No active session');
        }

        try {
            const sessionRef = doc(db, 'tableSessions', session.id);
            const now = new Date();

            const updates: Partial<TableSession> = {
                orderIds: [...session.orderIds, orderId],
                totalAmount: session.totalAmount + orderTotal,
                lastOrderAt: now,
                updatedAt: now,
            };

            // Set firstOrderAt if this is the first order
            if (session.orderIds.length === 0) {
                updates.firstOrderAt = now;
            }

            await updateDoc(sessionRef, {
                ...updates,
                lastOrderAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                firstOrderAt: session.orderIds.length === 0 ? serverTimestamp() : session.firstOrderAt,
            });

            setSession({
                ...session,
                ...updates,
            });
        } catch (err) {
            console.error('Error adding order to session:', err);
            throw new Error('Erro ao adicionar pedido à sessão');
        }
    };

    /**
     * Request bill
     */
    const requestBill = async () => {
        if (!session) {
            throw new Error('No active session');
        }

        try {
            const sessionRef = doc(db, 'tableSessions', session.id);

            await updateDoc(sessionRef, {
                status: 'BILL_REQUESTED',
                updatedAt: serverTimestamp(),
            });

            setSession({
                ...session,
                status: 'BILL_REQUESTED',
                updatedAt: new Date(),
            });
        } catch (err) {
            console.error('Error requesting bill:', err);
            throw new Error('Erro ao solicitar conta');
        }
    };

    /**
     * Close session
     */
    const closeSession = async () => {
        if (!session) {
            throw new Error('No active session');
        }

        try {
            const sessionRef = doc(db, 'tableSessions', session.id);
            const now = new Date();

            await updateDoc(sessionRef, {
                status: 'CLOSED',
                closedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setSession({
                ...session,
                status: 'CLOSED',
                closedAt: now,
                updatedAt: now,
            });
        } catch (err) {
            console.error('Error closing session:', err);
            throw new Error('Erro ao fechar sessão');
        }
    };

    return {
        session,
        loading,
        error,
        createSession,
        addOrderToSession,
        requestBill,
        closeSession,
    };
}
