
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, writeBatch } from '@firebase/firestore';
import { getFunctions, httpsCallable } from '@firebase/functions';

export const TEAM_QUERY_KEY = ['team'];
export const ROLES_QUERY_KEY = ['roles'];

export const useTeamQuery = (tenantId: string) => {
    const queryClient = useQueryClient();

    // 1. System Users
    const queryUsers = useQuery({
        queryKey: [...TEAM_QUERY_KEY, tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(
                collection(db, 'system_users'),
                where('tenantId', '==', tenantId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });


    const saveUser = useMutation({
        mutationFn: async (user: any) => {
            const functions = getFunctions(undefined, 'southamerica-east1');
            const manageTeamMemberFn = httpsCallable(functions, 'manageTeamMember');

            // Determine action
            const action = user.id ? 'update' : 'create';

            // Call Cloud Function
            const response = await manageTeamMemberFn({
                action,
                data: user
            }) as any;

            if (!response.data.success) {
                throw new Error('Falha ao salvar colaborador');
            }

            return { ...user, id: response.data.uid };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TEAM_QUERY_KEY, tenantId] });
        }
    });

    const deleteUser = useMutation({
        mutationFn: async (userId: string) => {
            const functions = getFunctions(undefined, 'southamerica-east1');
            const manageTeamMemberFn = httpsCallable(functions, 'manageTeamMember');

            await manageTeamMemberFn({
                action: 'delete',
                data: { id: userId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TEAM_QUERY_KEY, tenantId] });
        }
    });

    // 2. Roles (Keep Client-Side for now, low risk compared to Auth)
    const queryRoles = useQuery({
        queryKey: [...ROLES_QUERY_KEY, tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const q = query(
                collection(db, 'roles'),
                where('tenantId', '==', tenantId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        },
        enabled: !!tenantId
    });

    const saveRole = useMutation({
        mutationFn: async (role: any) => {
            const id = role.id || Date.now().toString();
            const docRef = doc(db, 'roles', id);
            await setDoc(docRef, { ...role, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { ...role, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...ROLES_QUERY_KEY, tenantId] });
        }
    });

    const deleteRole = useMutation({
        mutationFn: async (roleId: string) => {
            await deleteDoc(doc(db, 'roles', roleId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...ROLES_QUERY_KEY, tenantId] });
        }
    });

    return {
        users: queryUsers.data || [],
        roles: queryRoles.data || [],
        saveUser: saveUser.mutateAsync,
        deleteUser: deleteUser.mutateAsync,
        saveRole: saveRole.mutateAsync,
        deleteRole: deleteRole.mutateAsync
    };
};
