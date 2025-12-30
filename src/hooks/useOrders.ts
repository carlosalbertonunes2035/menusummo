import { useOrdersQuery } from '@/lib/react-query/queries/useOrdersQuery';
import { useAuth } from '@/features/auth/context/AuthContext';
import { OrderStatus } from '@/types';

/**
 * Hook to fetch orders with optional filters and pagination
 * Updated to use TanStack Query for Phase 2.
 */
export const useOrders = (options?: {
    status?: OrderStatus;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || '';

    const { orders, isLoading, updateStatus, assignDriver } = useOrdersQuery(tenantId, {
        status: options?.status,
        limit: options?.limit
    });

    return {
        data: orders,
        loading: isLoading,
        error: null,
        updateStatus,
        assignDriver
    };
};
