import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { StockMovement } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMemo } from 'react';

/**
 * Hook to fetch stock movements with optional filters and pagination
 */
export const useStockMovements = (options?: {
    ingredientId?: string;
    type?: 'IN' | 'OUT' | 'ADJUSTMENT';
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = useMemo(() => {
        const f: any[] = [];
        if (options?.ingredientId) {
            f.push({ field: 'ingredientId', op: '==', value: options.ingredientId });
        }
        if (options?.type) {
            f.push({ field: 'type', op: '==', value: options.type });
        }
        return f;
    }, [options?.ingredientId, options?.type]);

    return useFirestoreCollection<StockMovement>(
        'stock_movements',
        tenantId,
        filters,
        undefined,
        {
            enableCache: options?.enableCache ?? true,
            limit: options?.limit ?? 100, // Default limit for stock movements
            orderBy: { field: 'timestamp', direction: 'desc' }
        }
    );
};
