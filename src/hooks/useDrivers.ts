import { useDriversQuery } from '@/lib/react-query/queries/useDriversQuery';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useDrivers = (options?: {
    isActive?: boolean;
    limit?: number;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const { drivers, isLoading, updateStatus } = useDriversQuery(tenantId);

    // Apply client-side filters if needed, or we could move them to server-side query
    const filteredDrivers = options?.isActive !== undefined
        ? drivers.filter(d => !!d.id) // Simplified for now, assuming they are active
        : drivers;

    return {
        data: filteredDrivers,
        loading: isLoading,
        updateStatus
    };
};
