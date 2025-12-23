import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { ShoppingListItem } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Hook to fetch shopping list items
 */
export const useShoppingList = (options?: {
    isPurchased?: boolean;
    limit?: number;
    enableCache?: boolean;
}) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId;

    const filters = options?.isPurchased !== undefined
        ? [{ field: 'isPurchased', op: '==', value: options.isPurchased }]
        : undefined;

    return useFirestoreCollection<ShoppingListItem>(
        'shopping_list',
        tenantId,
        filters,
        undefined,
        {
            enableCache: options?.enableCache ?? true,
            limit: options?.limit,
            orderBy: { field: 'createdAt', direction: 'desc' }
        }
    );
};
