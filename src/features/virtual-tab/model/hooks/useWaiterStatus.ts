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
    onSnapshot,
    serverTimestamp
} from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { WaiterStatus, WaiterAvailability } from '../types';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage waiter status and availability
 */
export function useWaiterStatus() {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState<WaiterStatus | null>(null);
    const [availableWaiters, setAvailableWaiters] = useState<WaiterStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to current waiter's status
    useEffect(() => {
        if (!currentUser?.uid || !currentUser?.tenantId) {
            setLoading(false);
            return;
        }

        const statusRef = doc(db, 'waiterStatus', currentUser.uid);

        const unsubscribe = onSnapshot(statusRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStatus({
                    id: doc.id,
                    ...data,
                    lastActivity: data.lastActivity?.toDate(),
                    shiftStart: data.shiftStart?.toDate(),
                    shiftEnd: data.shiftEnd?.toDate(),
                    today: {
                        ...data.today,
                        date: data.today?.date?.toDate(),
                    },
                    month: {
                        ...data.month,
                        bestDay: data.month?.bestDay?.toDate(),
                    },
                } as WaiterStatus);
            } else {
                // Initialize status if doesn't exist
                initializeWaiterStatus();
            }
            setLoading(false);
        }, (err) => {
            console.error('Waiter Status Error:', err);
            setError('Falha ao monitorar seu status. Verifique sua conexão.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid, currentUser?.tenantId]);

    // Listen to all available waiters
    useEffect(() => {
        if (!currentUser?.tenantId) {
            return;
        }

        const statusRef = collection(db, 'waiterStatus');
        const q = query(
            statusRef,
            where('tenantId', '==', currentUser.tenantId),
            where('availability', 'in', ['AVAILABLE', 'BUSY'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const waiters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastActivity: doc.data().lastActivity?.toDate(),
                shiftStart: doc.data().shiftStart?.toDate(),
                shiftEnd: doc.data().shiftEnd?.toDate(),
                today: {
                    ...doc.data().today,
                    date: doc.data().today?.date?.toDate(),
                },
                month: {
                    ...doc.data().month,
                    bestDay: doc.data().month?.bestDay?.toDate(),
                },
            })) as WaiterStatus[];

            setAvailableWaiters(waiters);
        }, (err) => {
            console.error('Available Waiters Error:', err);
            // No need to set global error here, just log
        });

        return () => unsubscribe();
    }, [currentUser?.tenantId]);

    /**
     * Initialize waiter status
     */
    const initializeWaiterStatus = async () => {
        if (!currentUser?.uid || !currentUser?.tenantId || !currentUser?.displayName) {
            return;
        }

        try {
            const statusRef = doc(db, 'waiterStatus', currentUser.uid);
            const now = new Date();

            const initialStatus: Omit<WaiterStatus, 'id'> = {
                tenantId: currentUser.tenantId,
                name: currentUser.displayName,
                availability: 'AVAILABLE',
                activeTables: [],
                today: {
                    date: now,
                    tablesOpened: 0,
                    ordersDelivered: 0,
                    assistanceProvided: 0,
                    averageResponseTime: 0,
                    totalPoints: 0,
                    rank: 0,
                },
                month: {
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    tablesOpened: 0,
                    ordersDelivered: 0,
                    averageResponseTime: 0,
                    totalPoints: 0,
                    bestDay: now,
                    bestDayPoints: 0,
                    achievementsUnlocked: [],
                },
                lastActivity: now,
                shiftStart: now,
            };

            await setDoc(statusRef, {
                ...initialStatus,
                lastActivity: serverTimestamp(),
                shiftStart: serverTimestamp(),
                today: {
                    ...initialStatus.today,
                    date: serverTimestamp(),
                },
                month: {
                    ...initialStatus.month,
                    bestDay: serverTimestamp(),
                },
            });
        } catch (err) {
            console.error('Error initializing waiter status:', err);
            setError('Erro ao inicializar status');
        }
    };

    /**
     * Update availability
     */
    const updateAvailability = async (availability: WaiterAvailability) => {
        if (!currentUser?.uid) {
            throw new Error('User not authenticated');
        }

        try {
            const statusRef = doc(db, 'waiterStatus', currentUser.uid);

            await updateDoc(statusRef, {
                availability,
                lastActivity: serverTimestamp(),
            });
        } catch (err) {
            console.error('Error updating availability:', err);
            throw new Error('Erro ao atualizar disponibilidade');
        }
    };

    /**
     * Add table to active tables
     */
    const addActiveTable = async (tableId: string) => {
        if (!currentUser?.uid || !status) {
            throw new Error('User not authenticated or status not loaded');
        }

        try {
            const statusRef = doc(db, 'waiterStatus', currentUser.uid);
            const newActiveTables = [...status.activeTables, tableId];

            await updateDoc(statusRef, {
                activeTables: newActiveTables,
                availability: 'BUSY',
                lastActivity: serverTimestamp(),
            });
        } catch (err) {
            console.error('Error adding active table:', err);
            throw new Error('Erro ao adicionar mesa');
        }
    };

    /**
     * Remove table from active tables
     */
    const removeActiveTable = async (tableId: string) => {
        if (!currentUser?.uid || !status) {
            throw new Error('User not authenticated or status not loaded');
        }

        try {
            const statusRef = doc(db, 'waiterStatus', currentUser.uid);
            const newActiveTables = status.activeTables.filter(id => id !== tableId);

            await updateDoc(statusRef, {
                activeTables: newActiveTables,
                availability: newActiveTables.length === 0 ? 'AVAILABLE' : 'BUSY',
                lastActivity: serverTimestamp(),
            });
        } catch (err) {
            console.error('Error removing active table:', err);
            throw new Error('Erro ao remover mesa');
        }
    };

    /**
     * Find best available waiter
     */
    const findAvailableWaiter = (): WaiterStatus | null => {
        // Priority 1: Available waiters (no active tables)
        const available = availableWaiters.filter(w =>
            w.availability === 'AVAILABLE' &&
            w.activeTables.length === 0
        );

        if (available.length > 0) {
            // Return the one who has been idle the longest
            return available.sort((a, b) =>
                a.lastActivity.getTime() - b.lastActivity.getTime()
            )[0];
        }

        // Priority 2: Busy waiter with fewest tables
        const busy = availableWaiters.filter(w => w.availability === 'BUSY');
        if (busy.length > 0) {
            return busy.sort((a, b) =>
                a.activeTables.length - b.activeTables.length
            )[0];
        }

        return null;
    };

    return {
        status,
        availableWaiters,
        loading,
        error,
        updateAvailability,
        addActiveTable,
        removeActiveTable,
        findAvailableWaiter,
    };
}
