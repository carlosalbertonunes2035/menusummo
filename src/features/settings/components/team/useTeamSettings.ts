import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from '@firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../lib/firebase/client';
import { useAuth } from '../../../auth/context/AuthContext';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Role, SystemUser } from '../../../../types/user';
import { SYSTEM_ROLES_LIST } from '../../../../constants/permissions';
import { TeamTab, InviteForm, EditForm, RoleForm } from './types';

export function useTeamSettings() {
    const { user, systemUser } = useAuth();
    const { showToast } = useToast();

    const [users, setUsers] = useState<SystemUser[]>([]);
    const [customRoles, setCustomRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TeamTab>('members');

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isMasterProfileOpen, setIsMasterProfileOpen] = useState(false);

    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

    const [inviteForm, setInviteForm] = useState<InviteForm>({ name: '', email: '', roleId: 'MANAGER' });
    const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', phone: '', roleId: '' });
    const [roleForm, setRoleForm] = useState<RoleForm>({ name: '', description: '', permissions: [] });

    const allRoles = [...SYSTEM_ROLES_LIST, ...customRoles];

    useEffect(() => {
        if (systemUser?.tenantId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [systemUser?.id, systemUser?.tenantId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (!systemUser?.tenantId) return;

            const systemUsersRef = collection(db, 'system_users');
            const systemUsersQuery = query(systemUsersRef, where('tenantId', '==', systemUser.tenantId));
            const systemUsersSnap = await getDocs(systemUsersQuery);

            const userMap = new Map();
            systemUsersSnap.docs.forEach(doc => {
                const data = doc.data();
                userMap.set(doc.id, { id: doc.id, ...data } as SystemUser);
            });
            const systemUsersData = Array.from(userMap.values());

            const rolesRef = collection(db, `tenants/${systemUser.tenantId}/roles`);
            const rolesSnap = await getDocs(rolesRef);
            const rolesData = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));

            setCustomRoles(rolesData);

            const fullRoleList = [...SYSTEM_ROLES_LIST, ...rolesData];
            const enrichedUsers = systemUsersData.map(u => ({
                ...u,
                role: fullRoleList.find(r => r.id === u.roleId) || SYSTEM_ROLES_LIST[0]
            }));

            setUsers(enrichedUsers);
        } catch (error) {
            console.error("Error fetching team data:", error);
            showToast('Erro ao carregar equipe', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRole = async () => {
        if (!systemUser?.tenantId || !roleForm.name) return;
        try {
            if (editingRole) {
                await updateDoc(doc(db, `tenants/${systemUser.tenantId}/roles`, editingRole.id), {
                    name: roleForm.name,
                    description: roleForm.description,
                    permissions: roleForm.permissions
                });
                showToast('Cargo atualizado', 'success');
            } else {
                const newRoleRef = doc(collection(db, `tenants/${systemUser.tenantId}/roles`));
                await setDoc(newRoleRef, {
                    id: newRoleRef.id,
                    tenantId: systemUser.tenantId,
                    name: roleForm.name,
                    description: roleForm.description,
                    permissions: roleForm.permissions || [],
                    isSystem: false
                });
                showToast('Cargo criado', 'success');
            }
            setIsRoleModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('Erro ao salvar cargo', 'error');
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!systemUser?.tenantId || !confirm('Excluir este cargo?')) return;
        try {
            await deleteDoc(doc(db, `tenants/${systemUser.tenantId}/roles`, roleId));
            showToast('Cargo excluído', 'success');
            fetchData();
        } catch (error) {
            showToast('Erro ao excluir cargo', 'error');
        }
    };

    const handleInviteUser = async () => {
        if (!inviteForm.email || !systemUser?.tenantId) return;
        try {
            const selectedRole = allRoles.find(r => r.id === inviteForm.roleId)!;
            const newUser: SystemUser = {
                id: uuidv4(),
                tenantId: systemUser.tenantId,
                name: inviteForm.name,
                email: inviteForm.email,
                role: selectedRole,
                roleId: selectedRole.id,
                permissions: selectedRole.permissions,
                active: true,
                profileImage: `https://ui-avatars.com/api/?name=${inviteForm.name}&background=random`
            };
            await setDoc(doc(db, 'system_users', newUser.id), { ...newUser, createdAt: new Date().toISOString() });
            setIsUserModalOpen(false);
            fetchData();
            showToast("Usuário adicionado!", 'success');
        } catch (error) {
            showToast("Erro ao adicionar usuário.", 'error');
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser || !systemUser?.tenantId) return;
        try {
            const selectedRole = allRoles.find(r => r.id === editForm.roleId);
            const updatedData = {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                roleId: editForm.roleId,
                permissions: selectedRole?.permissions || editingUser.permissions,
                updatedAt: new Date().toISOString()
            };
            await updateDoc(doc(db, 'system_users', editingUser.id), updatedData);
            if (editingUser.id === user?.uid) {
                await updateDoc(doc(db, 'users', editingUser.id), { name: editForm.name, roleId: editForm.roleId });
            }
            setIsEditUserModalOpen(false);
            fetchData();
            showToast('Membro atualizado!', 'success');
        } catch (error) {
            showToast('Erro ao atualizar membro', 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === user?.uid) {
            showToast('Você não pode se excluir!', 'error');
            return;
        }
        if (!confirm("Remover usuário?")) return;
        try {
            await deleteDoc(doc(db, 'system_users', userId));
            fetchData();
            showToast('Usuário removido', 'success');
        } catch (error) {
            showToast('Erro ao remover usuário', 'error');
        }
    };

    return {
        users, customRoles, allRoles, loading, activeTab, setActiveTab,
        isUserModalOpen, setIsUserModalOpen,
        isEditUserModalOpen, setIsEditUserModalOpen,
        isRoleModalOpen, setIsRoleModalOpen,
        isMasterProfileOpen, setIsMasterProfileOpen,
        editingRole, setEditingRole,
        editingUser, setEditingUser,
        inviteForm, setInviteForm,
        editForm, setEditForm,
        roleForm, setRoleForm,
        handleSaveRole, handleDeleteRole,
        handleInviteUser, handleUpdateUser, handleDeleteUser
    };
}
