import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Role, SystemUser } from '../../../types/user';
import { SYSTEM_ROLES_LIST } from '../../../constants/permissions';
import { useApp } from '../../../contexts/AppContext';
import {
    Users, Shield, Plus, MoreVertical, Trash2, Mail,
    CheckCircle, XCircle, Search, Save, AlertCircle, Edit, Lock
} from 'lucide-react';
import {
    collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, addDoc
} from '@firebase/firestore';
import { db } from '../../../lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';
import { PermissionBuilder } from './PermissionBuilder';
import { MasterUserProfile } from './MasterUserProfile';

// --- COMPONENTS ---

const PermissionCheckbox = ({
    checked,
    onChange,
    label
}: { checked: boolean; onChange: () => void; label: string }) => (
    <label className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${checked ? 'bg-summo-primary/5 border-summo-primary/30' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-summo-primary border-summo-primary text-white' : 'bg-white border-gray-300'}`}>
            {checked && <CheckCircle size={12} />}
        </div>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        <span className={`text-sm font-medium ${checked ? 'text-summo-primary' : 'text-gray-600'}`}>{label}</span>
    </label>
);

// Helper to check if a role name is unique
const isRoleNameUnique = (name: string, roles: Role[]) => {
    return !roles.some(r => r.name.toLowerCase() === name.toLowerCase());
};

export const TeamSettings: React.FC = () => {
    const { user, systemUser } = useAuth();
    const { showToast } = useApp();

    // Data State
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [customRoles, setCustomRoles] = useState<Role[]>([]);

    // Combined Roles (System + Custom)
    const allRoles = [...SYSTEM_ROLES_LIST, ...customRoles];

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');

    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isMasterProfileOpen, setIsMasterProfileOpen] = useState(false);

    // Editing State
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

    // Forms
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', roleId: 'MANAGER' });
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', roleId: '' });
    const [roleForm, setRoleForm] = useState<Partial<Role>>({
        name: '', description: '', permissions: []
    });

    // STABILIZE FETCHING: Dependency on ID, not object
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
            if (!systemUser?.tenantId) {
                console.warn('[TeamSettings] Attempted fetchData without tenantId');
                return;
            }

            console.log('[TeamSettings] Fetching team for tenant:', systemUser.tenantId);

            // Fetch Team Members from system_users collection
            const systemUsersRef = collection(db, 'system_users');
            const systemUsersQuery = query(systemUsersRef, where('tenantId', '==', systemUser.tenantId));
            const systemUsersSnap = await getDocs(systemUsersQuery);

            // USE A MAP TO AVOID DUPLICATES IN STATE (Fixes warning)
            const userMap = new Map();
            systemUsersSnap.docs.forEach(doc => {
                const data = doc.data();
                userMap.set(doc.id, { id: doc.id, ...data } as SystemUser);
            });
            const systemUsersData = Array.from(userMap.values());

            // Fetch Custom Roles
            const rolesRef = collection(db, `tenants/${systemUser.tenantId}/roles`);
            const rolesSnap = await getDocs(rolesRef);
            const rolesData = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));

            setCustomRoles(rolesData);

            // Re-map users with the complete role list
            const fullRoleList = [...SYSTEM_ROLES_LIST, ...rolesData];

            const enrichedUsers = systemUsersData.map(u => ({
                ...u,
                role: fullRoleList.find(r => r.id === u.roleId) || SYSTEM_ROLES_LIST[0]
            }));

            setUsers(enrichedUsers);
            console.log(`[TeamSettings] Loaded ${enrichedUsers.length} users`);

        } catch (error: any) {
            console.error("Error fetching team details:", error);
            if (error.code === 'permission-denied') {
                console.warn('[TeamSettings] Permission denied. Possible propagation delay or rule issue.');
            }
            showToast('Erro ao carregar equipe. Verifique permissões.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS: ROLES ---

    const handleSaveRole = async () => {
        if (!systemUser?.tenantId) return;
        if (!roleForm.name) return;

        try {
            if (editingRole) {
                // Update
                const roleRef = doc(db, `tenants/${systemUser.tenantId}/roles`, editingRole.id);
                await updateDoc(roleRef, {
                    name: roleForm.name,
                    description: roleForm.description,
                    permissions: roleForm.permissions
                });
                showToast('Cargo atualizado', 'success');
            } else {
                // Create
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
            setRoleForm({ name: '', description: '', permissions: [] });
            setEditingRole(null);
            fetchData();
        } catch (error) {
            console.error("Error saving role:", error);
            showToast('Erro ao salvar cargo', 'error');
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!systemUser?.tenantId) return;
        if (!confirm('Excluir este cargo permanentemente?')) return;

        try {
            await deleteDoc(doc(db, `tenants/${systemUser.tenantId}/roles`, roleId));
            showToast('Cargo excluído', 'success');
            fetchData();
        } catch (error) {
            showToast('Erro ao excluir cargo', 'error');
        }
    };

    const togglePermission = (permId: string) => {
        setRoleForm(prev => {
            const current = prev.permissions || [];
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    const handleOpenRoleModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                name: role.name,
                description: role.description,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setRoleForm({ name: '', description: '', permissions: [] });
        }
        setIsRoleModalOpen(true);
    };

    const handleInviteUser = async () => {
        if (!inviteForm.email || !inviteForm.roleId || !systemUser?.tenantId) return;

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

            await setDoc(doc(db, 'system_users', newUser.id), {
                ...newUser,
                createdAt: new Date().toISOString()
            });
            setUsers(prev => [...prev, newUser]);
            setIsUserModalOpen(false);
            setInviteForm({ name: '', email: '', roleId: '' });
            showToast("Usuário adicionado com sucesso!", 'success');

        } catch (error) {
            console.error("Error inviting user:", error);
            showToast("Erro ao adicionar usuário.", 'error');
        }
    };

    const handleOpenEditUserModal = (user: SystemUser) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            roleId: user.roleId || ''
        });
        setIsEditUserModalOpen(true);
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

            const userRef = doc(db, 'system_users', editingUser.id);
            await updateDoc(userRef, updatedData);

            // Also update core users collection if editing self
            if (editingUser.id === user?.uid) {
                await updateDoc(doc(db, 'users', editingUser.id), {
                    name: editForm.name,
                    roleId: editForm.roleId
                });
            }

            showToast('Dados do membro atualizados!', 'success');
            setIsEditUserModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error updating user:", error);
            showToast('Erro ao atualizar membro', 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === user?.uid) {
            showToast('Você não pode excluir seu próprio perfil!', 'error');
            return;
        }
        if (!window.confirm("Remover este usuário da equipe?")) return;
        try {
            await deleteDoc(doc(db, 'system_users', userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
            showToast('Usuário removido', 'success');
        } catch (error) {
            console.error("Error deleting user:", error);
            showToast('Erro ao remover usuário', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gestão de Equipe</h2>
                    <p className="text-gray-500">Controle quem acessa sua loja e o que podem fazer.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-white shadow text-summo-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Membros
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white shadow text-summo-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Cargos & Permissões
                    </button>
                </div>
            </div>

            {/* Verificar se usuário tem tenantId */}
            {!systemUser?.tenantId ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800 font-medium">
                        ⚠️ Aguardando informações do usuário...
                    </p>
                    <p className="text-yellow-600 text-sm mt-2">
                        Se esta mensagem persistir, faça logout e login novamente.
                    </p>
                </div>
            ) : (
                <>
                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Users size={20} /> Colaboradores ({users.length})</h3>
                                <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-200">
                                    <Plus size={16} /> Adicionar Membro
                                </button>
                            </div>

                            {users.length === 0 && !loading ? (
                                <div className="p-10 text-center text-gray-400">Nenhum membro encontrado.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Nome / Email</th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Cargo</th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.map((u, index) => (
                                                <tr key={`${u.id}-${index}`} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <img src={u.profileImage || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                                                <button
                                                                    onClick={() => handleOpenEditUserModal(u)}
                                                                    className="absolute -bottom-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-summo-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Edit size={10} />
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-800 flex items-center gap-2">
                                                                    {u.name}
                                                                    {u.id === user?.uid && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 rounded uppercase font-bold">Você</span>}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.role?.id === 'OWNER' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                {u.role?.id === 'OWNER' && <Shield size={10} />}
                                                                {u.role?.name || 'Sem cargo'}
                                                            </span>
                                                            {u.isMasterUser && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-amber-300 shadow-sm">
                                                                    ⭐ Loja Master
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ativo
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenEditUserModal(u)}
                                                                className="p-2 text-gray-400 hover:text-summo-primary hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                                                title="Editar membro"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            {u.role?.id !== 'OWNER' && !u.isMasterUser && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                    title="Remover da equipe"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                            {(u.role?.id === 'OWNER' || u.isMasterUser) && !u.isMasterUser && u.id !== user?.uid && (
                                                                <span className="p-2 text-xs text-gray-400 italic flex items-center"><Lock size={14} className="mr-1" /> Protegido</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ROLES TAB */}
                    {activeTab === 'roles' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Shield size={20} /> Cargos Personalizados ({customRoles.length})</h3>
                                <button onClick={() => handleOpenRoleModal()} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-200">
                                    <Plus size={16} /> Criar Cargo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                {allRoles.map((role: Role) => (
                                    <div key={role.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50/30">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-800 text-lg">{role.name}</h4>
                                                    {role.id === 'OWNER' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-200">Sistema</span>}
                                                    {role.isSystem && role.id !== 'OWNER' && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">Padrão</span>}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {!role.isSystem && (
                                                    <>
                                                        <button onClick={() => handleOpenRoleModal(role)} className="p-2 text-gray-400 hover:text-summo-primary hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                                {role.isSystem && role.id !== 'OWNER' && (
                                                    <button onClick={() => alert("Cargos padrão não podem ser editados. Crie um novo cargo baseado neste se necessário.")} className="p-2 text-gray-300 cursor-not-allowed"><Lock size={16} /></button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {role.permissions.slice(0, 5).map((p: string) => (
                                                <span key={p} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                                                    {p.replace('view:', 'Ver ').replace('manage:', 'Gerir ')}
                                                </span>
                                            ))}
                                            {role.permissions.length > 5 && (
                                                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">+{role.permissions.length - 5}</span>
                                            )}
                                            {role.permissions.includes('*') && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 border border-orange-200 px-2 py-1 rounded text-orange-600">Acesso Total</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- MODAL: CREATE/EDIT USER --- */}
                    {isUserModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-scale-in">
                                <button onClick={() => setIsUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Adicionar Membro</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                        <input type="text" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="Ex: Maria Oliveira" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="email@exemplo.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo</label>
                                        <select value={inviteForm.roleId} onChange={e => setInviteForm({ ...inviteForm, roleId: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none">
                                            <option value="">Selecione um cargo...</option>
                                            {allRoles.map((r: Role) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleInviteUser}
                                        disabled={!inviteForm.name || !inviteForm.email || !inviteForm.roleId}
                                        className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg mt-4 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Adicionar à Equipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODAL: EDIT USER --- */}
                    {isEditUserModalOpen && editingUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-scale-in">
                                <button onClick={() => setIsEditUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Editar Membro</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                        <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                        <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                                        <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="(00) 00000-0000" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo</label>
                                        <select
                                            value={editForm.roleId}
                                            onChange={e => setEditForm({ ...editForm, roleId: e.target.value })}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none"
                                            disabled={editingUser.roleId === 'OWNER'}
                                        >
                                            {allRoles.map((r: Role) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                        {editingUser.roleId === 'OWNER' && <p className="text-[10px] text-gray-400 mt-1 italic">* Cargos de Proprietário não podem ser alterados.</p>}
                                    </div>

                                    <button
                                        onClick={handleUpdateUser}
                                        className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg mt-4 hover:bg-orange-700 transition-all"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODAL: CREATE/EDIT ROLE --- */}
                    {isRoleModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl p-0 relative animate-scale-in flex flex-col max-h-[90vh]">
                                <div className="p-6 border-b border-gray-100800 flex justify-between items-center bg-gray-50900/50">
                                    <h3 className="text-xl font-bold text-gray-900">{editingRole ? 'Editar Cargo' : 'Criar Novo Cargo'}</h3>
                                    <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cargo</label>
                                            <input type="text" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full p-3 bg-gray-50900 rounded-xl border border-gray-200700 font-bold focus:ring-2 focus:ring-summo-primary outline-none" placeholder="Ex: Supervisor de Loja" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                                            <input type="text" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full p-3 bg-gray-50900 rounded-xl border border-gray-200700 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="Breve descrição das responsabilidades" />
                                        </div>
                                    </div>

                                    <div>
                                        <PermissionBuilder
                                            selectedPermissions={roleForm.permissions || []}
                                            onChange={(permissions) => setRoleForm({ ...roleForm, permissions })}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100800 bg-gray-50900/50 flex justify-end gap-3 rounded-b-2xl">
                                    <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800:text-gray-300 transition">Cancelar</button>
                                    <button onClick={handleSaveRole} disabled={!roleForm.name} className="px-8 py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all">Salvar Cargo</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODAL: MASTER USER PROFILE --- */}
                    <MasterUserProfile
                        isOpen={isMasterProfileOpen}
                        onClose={() => setIsMasterProfileOpen(false)}
                    />
                </>
            )}
        </div>
    );
};
