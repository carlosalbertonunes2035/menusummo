import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Order } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { OrderSchema } from '@/lib/schemas';
import { useMemo } from 'react';

/**
 * Hook to fetch orders with optional filters and pagination
 */
export const useOrders = (options?: {
    status?: string;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = useMemo(() => {
        const f: any[] = [];
        if (options?.status) {
            f.push({ field: 'status', op: '==', value: options.status });
        }
        return f;
    }, [options?.status]);

    return useFirestoreCollection<Order>(
        'orders',
        tenantId,
        filters,
        OrderSchema,
        {
            enableCache: options?.enableCache ?? true,
            limit: options?.limit,
            orderBy: { field: 'createdAt', direction: 'desc' }
        }
    );
};
