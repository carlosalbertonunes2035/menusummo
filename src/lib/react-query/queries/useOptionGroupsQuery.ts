import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from '@firebase/firestore';
import { OptionGroupLibraryItem } from '@/types';

export const OPTION_GROUPS_QUERY_KEY = ['option_groups'];

export const useOptionGroupsQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    const queryItems = useQuery({
        queryKey: [...OPTION_GROUPS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<OptionGroupLibraryItem[]> => {
            if (!tenantId) return [];
            const q = query(collection(db, 'option_groups'), where('tenantId', '==', tenantId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OptionGroupLibraryItem));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10,
    });

    const saveOptionGroup = useMutation({
        mutationFn: async (item: Partial<OptionGroupLibraryItem>) => {
            const id = item.id || Date.now().toString();
            const docRef = doc(db, 'option_groups', id);
            await setDoc(docRef, { ...item, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...item, id } as OptionGroupLibraryItem;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...OPTION_GROUPS_QUERY_KEY, tenantId] });
        },
    });

    const deleteOptionGroup = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'option_groups', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...OPTION_GROUPS_QUERY_KEY, tenantId] });
        },
    });

    return {
        optionGroups: queryItems.data || [],
        isLoading: queryItems.isLoading,
        saveOptionGroup: saveOptionGroup.mutateAsync,
        deleteOptionGroup: deleteOptionGroup.mutateAsync,
    };
};
