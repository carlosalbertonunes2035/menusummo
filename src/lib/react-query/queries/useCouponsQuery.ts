import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from '@firebase/firestore';
import { Coupon } from '@/types';

export const COUPONS_QUERY_KEY = ['coupons'];

export const useCouponsQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryItems = useQuery({
        queryKey: [...COUPONS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<Coupon[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'coupons'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5,
    });

    const saveCoupon = useMutation({
        mutationFn: async (item: Partial<Coupon>) => {
            const id = item.id || Date.now().toString();
            const docRef = doc(db, 'coupons', id);
            await setDoc(docRef, { ...item, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...item, id } as Coupon;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...COUPONS_QUERY_KEY, tenantId] });
        },
    });

    const deleteCoupon = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'coupons', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...COUPONS_QUERY_KEY, tenantId] });
        },
    });

    return {
        coupons: queryItems.data || [],
        isLoading: queryItems.isLoading,
        saveCoupon: saveCoupon.mutateAsync,
        deleteCoupon: deleteCoupon.mutateAsync,
    };
};
