import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Expense } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMemo } from 'react';

/**
 * Hook to fetch expenses with optional filters
 */
export const useExpenses = (options?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = useMemo(() => {
        const f: any[] = [];
        if (options?.category) {
            f.push({ field: 'category', op: '==', value: options.category });
        }
        if (options?.startDate) {
            f.push({ field: 'date', op: '>=', value: options.startDate });
        }
        if (options?.endDate) {
            f.push({ field: 'date', op: '<=', value: options.endDate });
        }
        return f;
    }, [options?.category, options?.startDate, options?.endDate]);

    return useFirestoreCollection<Expense>(
        'expenses',
        tenantId,
        filters,
        undefined,
        {
            enableCache: options?.enableCache ?? true,
            limit: options?.limit,
            orderBy: { field: 'date', direction: 'desc' }
        }
    );
};
