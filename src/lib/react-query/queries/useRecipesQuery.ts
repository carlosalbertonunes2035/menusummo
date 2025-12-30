import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from '@firebase/firestore';
import { Recipe } from '@/types';

export const RECIPES_QUERY_KEY = ['recipes'];

export const useRecipesQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryItems = useQuery({
        queryKey: [...RECIPES_QUERY_KEY, tenantId],
        queryFn: async (): Promise<Recipe[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'recipes'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Recipe));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10,
    });

    const saveRecipe = useMutation({
        mutationFn: async (item: Partial<Recipe>) => {
            const id = item.id || Date.now().toString();
            const docRef = doc(db, 'recipes', id);
            await setDoc(docRef, { ...item, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...item, id } as Recipe;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...RECIPES_QUERY_KEY, tenantId] });
        },
    });

    const deleteRecipe = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'recipes', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...RECIPES_QUERY_KEY, tenantId] });
        },
    });

    return {
        recipes: queryItems.data || [],
        isLoading: queryItems.isLoading,
        saveRecipe: saveRecipe.mutateAsync,
        deleteRecipe: deleteRecipe.mutateAsync,
    };
};
