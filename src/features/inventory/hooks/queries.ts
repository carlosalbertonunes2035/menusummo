import { useInfiniteFirestoreCollection } from '@/lib/firebase/paginatedHooks';
import { Product, Ingredient } from '@/types';
import { where, QueryConstraint, collection, query, getDocs } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';

/**
 * Hook for paginated products with optional category filtering.
 */
export const useInfiniteProducts = (
    tenantId: string | undefined,
    category?: string,
    searchQuery?: string
) => {
    const constraints: QueryConstraint[] = [];

    // Category filtering (Server-side)
    if (category && category !== 'Todos') {
        constraints.push(where('category', '==', category));
    }

    // NOTE: Simple search is better handled in client for small/medium datasets,
    // but for enterprise, we'd use a dedicated search service (Algolia/Typesense)
    // or a specialized Cloud Function. For now, we rely on TanStack Query cache 
    // and manual client filtering if needed or server-side prefix matching.

    return useInfiniteFirestoreCollection<Product>(
        'products',
        tenantId,
        20,
        'name',
        'asc',
        constraints
    );
};

/**
 * Hook for paginated ingredients.
 */
export const useInfiniteIngredients = (tenantId: string | undefined) => {
    return useInfiniteFirestoreCollection<Ingredient>(
        'ingredients',
        tenantId,
        50,
        'name',
        'asc'
    );
};

/**
 * Standard hook to fetch ALL products (cached).
 * Use only when you really need the full list (e.g., POS, Reports).
 */
export const useProducts = (tenantId: string | undefined) => {
    return useQuery({
        queryKey: ['products', 'all', tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(collection(db, 'products'), where('tenantId', '==', tenantId));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        },
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

/**
 * Standard hook to fetch ALL ingredients (cached).
 */
export const useIngredients = (tenantId: string | undefined) => {
    return useQuery({
        queryKey: ['ingredients', 'all', tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(collection(db, 'ingredients'), where('tenantId', '==', tenantId));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        },
        enabled: !!tenantId,
        staleTime: 10 * 60 * 1000 // 10 minutes
    });
};
