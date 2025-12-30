import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { StoreSettings } from '@/types';
import { GET_DEFAULT_SETTINGS } from '@/constants';

export const SETTINGS_QUERY_KEY = ['settings'];

export const useSettingsQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    // 1. Fetcher
    const query = useQuery({
        queryKey: [...SETTINGS_QUERY_KEY, tenantId],
        queryFn: async (): Promise<StoreSettings> => {
            if (!tenantId) return GET_DEFAULT_SETTINGS('global');

            const settingsDoc = await getDoc(doc(db, 'settings', tenantId));
            if (settingsDoc.exists()) {
                return settingsDoc.data() as StoreSettings;
            }
            return GET_DEFAULT_SETTINGS(tenantId);
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10, // 10 minutos
    });

    // 2. Mutation
    const mutation = useMutation({
        mutationFn: async (newSettings: StoreSettings) => {
            if (!tenantId) throw new Error('Tenant ID missing');
            await setDoc(doc(db, 'settings', tenantId), newSettings, { merge: true });
            return newSettings;
        },
        onSuccess: (data) => {
            // Invalida e atualiza o cache local imediatamente
            queryClient.setQueryData([...SETTINGS_QUERY_KEY, tenantId], data);
        },
    });

    return {
        settings: query.data || GET_DEFAULT_SETTINGS(tenantId || 'global'),
        isLoading: query.isLoading,
        isUpdating: mutation.isPending,
        updateSettings: mutation.mutateAsync,
    };
};
