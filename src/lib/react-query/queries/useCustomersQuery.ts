import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from '@firebase/firestore';
import { Customer } from '@/types';

export const CUSTOMERS_QUERY_KEY = ['customers'];

export const useCustomersQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryItems = useQuery({
        queryKey: [...CUSTOMERS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<Customer[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'customers'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 15, // 15 minutos (dados de clientes mudam pouco)
    });

    const saveCustomer = useMutation({
        mutationFn: async (customer: Partial<Customer>) => {
            const id = customer.id || customer.phone || Date.now().toString();
            const docRef = doc(db, 'customers', id);
            await setDoc(docRef, { ...customer, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...customer, id } as Customer;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CUSTOMERS_QUERY_KEY, tenantId] });
        },
    });

    const deleteCustomer = useMutation({
        mutationFn: async (customerId: string) => {
            await deleteDoc(doc(db, 'customers', customerId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CUSTOMERS_QUERY_KEY, tenantId] });
        },
    });

    return {
        customers: queryItems.data || [],
        isLoading: queryItems.isLoading,
        saveCustomer: saveCustomer.mutateAsync,
        deleteCustomer: deleteCustomer.mutateAsync,
    };
};
