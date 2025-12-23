import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Driver } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Hook to fetch drivers with optional filters
 */
export const useDrivers = (options?: {
    isActive?: boolean;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = options?.isActive !== undefined
        ? [{ field: 'isActive', op: '==', value: options.isActive }]
        : undefined;

    return useFirestoreCollection<Driver>(
        'drivers',
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
