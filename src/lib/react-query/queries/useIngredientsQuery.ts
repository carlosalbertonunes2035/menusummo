import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from '@firebase/firestore';
import { Ingredient } from '@/types';

export const INGREDIENTS_QUERY_KEY = ['ingredients'];

export const useIngredientsQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryIngredients = useQuery({
        queryKey: [...INGREDIENTS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<Ingredient[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'ingredients'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ingredient));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10, // 10 minutos
    });

    const saveIngredient = useMutation({
        mutationFn: async (ingredient: Partial<Ingredient>) => {
            const id = ingredient.id || Date.now().toString();
            const docRef = doc(db, 'ingredients', id);
            await setDoc(docRef, { ...ingredient, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...ingredient, id } as Ingredient;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...INGREDIENTS_QUERY_KEY, tenantId] });
        },
    });

    const deleteIngredient = useMutation({
        mutationFn: async (ingredientId: string) => {
            await deleteDoc(doc(db, 'ingredients', ingredientId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...INGREDIENTS_QUERY_KEY, tenantId] });
        },
    });

    return {
        ingredients: queryIngredients.data || [],
        isLoading: queryIngredients.isLoading,
        saveIngredient: saveIngredient.mutateAsync,
        deleteIngredient: deleteIngredient.mutateAsync,
    };
};
