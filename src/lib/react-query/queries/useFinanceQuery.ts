
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy } from '@firebase/firestore';
import { Expense } from '@/types';

export const REVENUES_QUERY_KEY = ['revenues'];

export const useFinanceQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryExpenses = useQuery({
        queryKey: [...EXPENSES_QUERY_KEY, tenantId],
        queryFn: async (): Promise<any[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'expenses'), where('tenantId', '==', tenantId), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });

    const queryRevenues = useQuery({
        queryKey: [...REVENUES_QUERY_KEY, tenantId],
        queryFn: async (): Promise<any[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'revenues'), where('tenantId', '==', tenantId), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });

    const saveExpense = useMutation({
        mutationFn: async (expense: any) => {
            const id = expense.id || Date.now().toString();
            const docRef = doc(db, 'expenses', id);
            await setDoc(docRef, { ...expense, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...expense, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...EXPENSES_QUERY_KEY, tenantId] });
        }
    });

    const saveRevenue = useMutation({
        mutationFn: async (revenue: any) => {
            const id = revenue.id || Date.now().toString();
            const docRef = doc(db, 'revenues', id);
            await setDoc(docRef, { ...revenue, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...revenue, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...REVENUES_QUERY_KEY, tenantId] });
        }
    });

    return {
        expenses: queryExpenses.data || [],
        revenues: queryRevenues.data || [],
        isLoading: queryExpenses.isLoading || queryRevenues.isLoading,
        saveExpense: saveExpense.mutateAsync,
        saveRevenue: saveRevenue.mutateAsync,
        deleteExpense: async (id: string) => {
            await deleteDoc(doc(db, 'expenses', id));
            queryClient.invalidateQueries({ queryKey: [...EXPENSES_QUERY_KEY, tenantId] });
        }
    };
};
