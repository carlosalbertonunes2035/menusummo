import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from '@firebase/firestore';
import { Product } from '@/types';

export const PRODUCTS_QUERY_KEY = ['products'];

export const useProductsQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryProducts = useQuery({
        queryKey: [...PRODUCTS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<Product[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'products'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const saveProduct = useMutation({
        mutationFn: async (product: Partial<Product>) => {
            const id = product.id || Date.now().toString();
            const docRef = doc(db, 'products', id);
            await setDoc(docRef, { ...product, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...product, id } as Product;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, tenantId] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: async (productId: string) => {
            await deleteDoc(doc(db, 'products', productId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, tenantId] });
        },
    });

    return {
        products: queryProducts.data || [],
        isLoading: queryProducts.isLoading,
        saveProduct: saveProduct.mutateAsync,
        deleteProduct: deleteProduct.mutateAsync,
        isSaving: saveProduct.isPending,
    };
};
