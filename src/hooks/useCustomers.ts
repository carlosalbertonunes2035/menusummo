import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Customer } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMemo } from 'react';

/**
 * Hook to fetch customers with optional search and pagination
 */
export const useCustomers = (options?: {
    searchPhone?: string;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = useMemo(() => {
        const f: any[] = [];
        if (options?.searchPhone) {
            f.push({ field: 'phone', op: '==', value: options.searchPhone });
        }
        return f;
    }, [options?.searchPhone]);

    return useFirestoreCollection<Customer>(
        'customers',
        tenantId,
        filters,
        undefined,
        {
            enableCache: options?.enableCache ?? true,
            limit: options?.limit,
            orderBy: { field: 'name', direction: 'asc' }
        }
    );
};
