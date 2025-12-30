import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit3, Trash2, CheckSquare, Square, Save, X } from 'lucide-react';
import { writeBatch, doc, where } from '@firebase/firestore';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useTeamQuery } from '@/lib/react-query/queries/useTeamQuery';
import { SystemUser, Role } from '@/types';
import { ALL_MODULES } from '@/components/layouts/Sidebar';
import { db } from '@/lib/firebase/client';
import { inputClass, labelClass, cardClass } from './shared';
import { useAuth } from '@/features/auth/context/AuthContext';

// --- TEAM & PERMISSIONS MANAGEMENT ---
export const TeamAndPermissionsForm: React.FC = () => {
    const { tenantId: appTenantId } = useApp();
    const { showToast } = useToast();
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || appTenantId;

    const { users, roles, saveUser, deleteUser, saveRole, deleteRole } = useTeamQuery(tenantId || '');
    const usersLoading = false; // TanStack handles this via status
    const rolesLoading = false;

    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    // User Management State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<SystemUser> | null>(null);

    // Role Management State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    // Find a default role to show initially
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Type alias for role object (excluding string type)
    type RoleObject = Exclude<Role, string>;
    const [editingRole, setEditingRole] = useState<Partial<RoleObject> | null>(null);
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);

    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            const initialRole = roles.find(r => typeof r !== 'string' && r.id === 'role-manager') || roles[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedRole(initialRole);
        }
    }, [roles, selectedRole]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (selectedRole && typeof selectedRole !== 'string') setRolePermissions(selectedRole.permissions);
    }, [selectedRole]);

    const formatCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

    const openUserModal = (user: Partial<SystemUser> | null = null) => {
        setEditingUser(user || { name: '', email: '', roleId: 'role-cashier', active: true, pin: '', cpf: '', password: '' });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser || !editingUser.name || !editingUser.email || !editingUser.roleId) return showToast('Preencha os campos obrigatórios.', 'error');
        const isUpdate = !!editingUser.id;

        try {
            await saveUser(editingUser);
            setIsUserModalOpen(false);
            setEditingUser(null);
            showToast(`Colaborador ${isUpdate ? 'atualizado' : 'adicionado'}!`, 'success');
        } catch (error) {
            console.error("User save failed:", error);
            showToast("Falha ao salvar colaborador. Tente novamente.", "error");
        }
    };

    const handleDeleteUser = (id: string) => { if (confirm('Remover?')) deleteUser(id); };

    const openRoleModal = (role: Role | null = null) => {
        if (role && typeof role !== 'string') {
            setEditingRole(role);
        } else {
            setEditingRole({ name: '', description: '', permissions: [] });
        }
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = async () => {
        if (!editingRole || typeof editingRole === 'string' || !editingRole.name) return showToast('Nome do cargo obrigatório.', 'error');
        const id = editingRole.id;
        await saveRole(editingRole);
        setIsRoleModalOpen(false);
        setEditingRole(null);
        showToast(`Cargo ${id ? 'atualizado' : 'criado'}!`, 'success');
    };

    const handleDeleteRole = (id: string) => { if (confirm('Excluir cargo?')) deleteRole(id); };

    const handlePermissionToggle = (permissionId: string) => {
        setRolePermissions(prev => prev.includes(permissionId) ? prev.filter(p => p !== permissionId) : [...prev, permissionId]);
    };

    const savePermissions = async () => {
        if (!selectedRole || typeof selectedRole === 'string') return;
        await saveRole({ ...selectedRole, id: selectedRole.id, permissions: rolePermissions });
        showToast('Permissões salvas!', 'success');
    };

    const hasPermissionChanges = selectedRole && typeof selectedRole !== 'string' ? JSON.stringify(rolePermissions) !== JSON.stringify(selectedRole.permissions) : false;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cardClass}>
                <div className="flex gap-2 border-b border-slate-100 mb-4">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'users' ? 'text-summo-primary border-summo-primary' : 'text-slate-400 border-transparent'}`}><Users size={16} /> Colaboradores</button>
                    <button onClick={() => setActiveTab('roles')} className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'roles' ? 'text-summo-primary border-summo-primary' : 'text-slate-400 border-transparent'}`}><Shield size={16} /> Cargos e Permissões</button>
                </div>

                {activeTab === 'users' ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs text-slate-500">Gerencie quem tem acesso ao sistema.</p>
                            <button onClick={() => openUserModal()} className="bg-summo-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-summo-dark transition flex items-center gap-2"><Plus size={16} /> Novo</button>
                        </div>
                        <div className="space-y-3">
                            {(usersLoading || rolesLoading) ? <p className="text-center py-4 text-slate-400">Carregando...</p> : users.map(user => {
                                const role = roles.find(r => typeof r !== 'string' && r.id === user.roleId);
                                const roleName = role && typeof role !== 'string' ? role.name : 'Cargo não encontrado';
                                return (
                                    <div key={user.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-summo-primary/30 transition">
                                        <div><p className="font-bold text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{roleName}</p></div>
                                        <div className="flex items-center gap-2"><button onClick={() => openUserModal(user)} className="p-2 text-slate-400 hover:text-summo-primary hover:bg-slate-100:bg-slate-700 rounded-lg transition"><Edit3 size={16} /></button><button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50:bg-red-900/20 rounded-lg transition"><Trash2 size={16} /></button></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-3">
                            <button onClick={() => openRoleModal()} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-3 rounded-xl text-slate-500 font-bold hover:border-summo-primary hover:text-summo-primary transition text-sm flex items-center justify-center gap-2"><Plus size={16} /> Novo Cargo</button>
                            {roles.filter(r => typeof r !== 'string').map(role => {
                                const roleObj = role as Exclude<Role, string>;
                                return (
                                    <div key={roleObj.id} onClick={() => setSelectedRole(role)} className={`p-4 rounded-xl border-2 transition cursor-pointer ${selectedRole && typeof selectedRole !== 'string' && selectedRole.id === roleObj.id ? 'bg-summo-bg border-summo-primary' : 'bg-white border-slate-100 hover:border-summo-primary/50'}`}>
                                        <div className="flex justify-between items-start"><p className="font-bold text-slate-800">{roleObj.name}</p> {roleObj.id !== 'OWNER' && <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(roleObj.id) }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>}</div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{roleObj.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="col-span-8 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {selectedRole && typeof selectedRole !== 'string' ? (<>
                                <h4 className="font-bold text-slate-800 mb-1">{selectedRole.name}</h4>
                                <p className="text-xs text-slate-500 mb-4">Selecione os módulos que este cargo pode acessar.</p>
                                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                    {ALL_MODULES.map((module: any) => {
                                        const hasPermission = rolePermissions.includes(module.id);
                                        const isDisabled = selectedRole.id === 'OWNER';
                                        return (
                                            <div key={module.id} onClick={() => !isDisabled && handlePermissionToggle(module.id)} className={`flex items-center gap-3 p-3 rounded-lg border transition ${isDisabled ? 'cursor-not-allowed bg-slate-100 border-slate-200' : 'cursor-pointer bg-white border-slate-200 hover:border-summo-primary/50'}`}>
                                                {hasPermission ? <CheckSquare size={18} className="text-summo-primary" /> : <Square size={18} className="text-slate-300" />}
                                                <div><p className="font-bold text-sm text-slate-700">{module.label}</p><p className="text-[10px] text-slate-400">{module.description}</p></div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {hasPermissionChanges && <button onClick={savePermissions} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition"><Save size={16} /> Salvar Permissões</button>}
                            </>) : <p className="text-slate-500 text-center py-10">Selecione um cargo para editar.</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* NEW COLLABORATOR MODAL */}
            {isUserModalOpen && editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsUserModalOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-lg text-slate-800">{editingUser.id ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600:text-slate-200"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar max-h-[80vh]">
                            <div>
                                <label className={labelClass}>Nome Completo</label>
                                <input autoFocus type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className={inputClass} placeholder="Ex: Maria Silva" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className={labelClass}>CPF</label><input type="text" value={editingUser.cpf} onChange={e => setEditingUser({ ...editingUser, cpf: formatCPF(e.target.value) })} maxLength={14} className={inputClass} placeholder="000.000.000-00" /></div>
                                <div><label className={labelClass}>PIN (Acesso Rápido)</label><input type="text" maxLength={4} value={editingUser.pin} onChange={e => setEditingUser({ ...editingUser, pin: e.target.value.replace(/\D/g, '') })} className={inputClass} placeholder="1234" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Email de Acesso</label>
                                <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className={inputClass} placeholder="maria@loja.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Cargo / Função</label>
                                <select value={editingUser.roleId} onChange={e => setEditingUser({ ...editingUser, roleId: e.target.value })} className={inputClass}>
                                    {roles.filter(r => typeof r !== 'string').map(r => {
                                        const roleObj = r as Exclude<Role, string>;
                                        return <option key={roleObj.id} value={roleObj.id}>{roleObj.name}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Senha</label>
                                <input type="password" value={editingUser.password} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} className={inputClass} placeholder={editingUser.id ? 'Deixe em branco para não alterar' : '********'} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ROLE MODAL */}
            {isRoleModalOpen && editingRole && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsRoleModalOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{editingRole?.id ? 'Editar Cargo' : 'Novo Cargo'}</h3>
                            <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600:text-slate-200"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className={labelClass}>Nome do Cargo</label><input autoFocus type="text" value={editingRole?.name || ''} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })} className={inputClass} placeholder="Ex: Gerente Noturno" /></div>
                            <div><label className={labelClass}>Descrição</label><input type="text" value={editingRole?.description || ''} onChange={e => setEditingRole({ ...editingRole, description: e.target.value })} className={inputClass} placeholder="Breve descrição da função" /></div>
                        </div>
                        <div className="p-6 pt-4 flex gap-3 border-t border-slate-100">
                            <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100:bg-slate-800 rounded-xl transition">Cancelar</button>
                            <button onClick={handleSaveRole} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 transition">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
