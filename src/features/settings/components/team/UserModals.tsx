import React from 'react';
import { XCircle, Mail, Smartphone } from 'lucide-react';
import { Role, SystemUser } from '../../../../types/user';
import { InviteForm, EditForm } from './types';

interface UserModalsProps {
    isUserModalOpen: boolean;
    setIsUserModalOpen: (val: boolean) => void;
    isEditUserModalOpen: boolean;
    setIsEditUserModalOpen: (val: boolean) => void;
    inviteForm: InviteForm;
    setInviteForm: (form: InviteForm) => void;
    editForm: EditForm;
    setEditForm: (form: EditForm) => void;
    allRoles: Role[];
    editingUser: SystemUser | null;
    handleInviteUser: () => void;
    handleUpdateUser: () => void;
}

export const UserModals: React.FC<UserModalsProps> = ({
    isUserModalOpen, setIsUserModalOpen, isEditUserModalOpen, setIsEditUserModalOpen,
    inviteForm, setInviteForm, editForm, setEditForm, allRoles, editingUser,
    handleInviteUser, handleUpdateUser
}) => {
    return (
        <>
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
                                    {allRoles.map((r) => (
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
                                <div className="relative">
                                    <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="(00) 00000-0000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo</label>
                                <select
                                    value={editForm.roleId}
                                    onChange={e => setEditForm({ ...editForm, roleId: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none"
                                    disabled={editingUser.roleId === 'OWNER'}
                                >
                                    {allRoles.map((r) => (
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
        </>
    );
};
