
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy, limit } from '@firebase/firestore';

export const STOCK_QUERY_KEY = ['stock'];
export const SHOPPING_LIST_QUERY_KEY = ['shopping_list'];

export const useStockQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    // 1. Stock Movements
    const queryMovements = useQuery({
        queryKey: [...STOCK_QUERY_KEY, 'movements', tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(
                collection(db, 'stock_movements'),
                where('tenantId', '==', tenantId),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });

    const addMovement = useMutation({
        mutationFn: async (movement: any) => {
            const id = Date.now().toString();
            const docRef = doc(db, 'stock_movements', id);
            await setDoc(docRef, { ...movement, tenantId, timestamp: new Date() });
            return { ...movement, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...STOCK_QUERY_KEY, 'movements', tenantId] });
        }
    });

    // 2. Shopping List
    const queryShoppingList = useQuery({
        queryKey: [...SHOPPING_LIST_QUERY_KEY, tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(
                collection(db, 'shopping_list'),
                where('tenantId', '==', tenantId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });

    const saveShoppingItem = useMutation({
        mutationFn: async (item: any) => {
            const id = item.id || Date.now().toString();
            const docRef = doc(db, 'shopping_list', id);
            await setDoc(docRef, { ...item, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...item, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, tenantId] });
        }
    });

    const deleteShoppingItem = useMutation({
        mutationFn: async (itemId: string) => {
            await deleteDoc(doc(db, 'shopping_list', itemId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, tenantId] });
        }
    });

    return {
        movements: queryMovements.data || [],
        shoppingList: queryShoppingList.data || [],
        addMovement: addMovement.mutateAsync,
        saveShoppingItem: saveShoppingItem.mutateAsync,
        deleteShoppingItem: deleteShoppingItem.mutateAsync
    };
};
