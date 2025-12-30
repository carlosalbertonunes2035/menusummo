
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from '@firebase/firestore';
import { Driver } from '@/types';

export const DRIVERS_QUERY_KEY = ['drivers'];

export const useDriversQuery = (tenantId: string | undefined) => {
    const queryClient = useQueryClient();

    const { data: drivers = [], isLoading } = useQuery({
        queryKey: [...DRIVERS_QUERY_KEY, tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(
                collection(db, 'drivers'),
                where('tenantId', '==', tenantId),
                orderBy('name', 'asc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
        },
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const updateDriverStatus = useMutation({
        mutationFn: async ({ driverId, status }: { driverId: string; status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' }) => {
            const driverRef = doc(db, 'drivers', driverId);
            await setDoc(driverRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
        }
    });

    return {
        drivers,
        isLoading,
        updateStatus: updateDriverStatus.mutateAsync,
        isUpdating: updateDriverStatus.isPending
    };
};
