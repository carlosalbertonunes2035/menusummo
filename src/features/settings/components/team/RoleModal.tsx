import React from 'react';
import { XCircle } from 'lucide-react';
import { PermissionBuilder } from '../PermissionBuilder';
import { RoleForm } from './types';

interface RoleModalProps {
    isRoleModalOpen: boolean;
    setIsRoleModalOpen: (val: boolean) => void;
    editingRole: any | null;
    roleForm: RoleForm;
    setRoleForm: (form: RoleForm) => void;
    handleSaveRole: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
    isRoleModalOpen, setIsRoleModalOpen, editingRole, roleForm, setRoleForm, handleSaveRole
}) => {
    if (!isRoleModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl p-0 relative animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900">{editingRole ? 'Editar Cargo' : 'Criar Novo Cargo'}</h3>
                    <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cargo</label>
                            <input type="text" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold focus:ring-2 focus:ring-summo-primary outline-none" placeholder="Ex: Supervisor de Loja" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                            <input type="text" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:ring-2 focus:ring-summo-primary outline-none" placeholder="Breve descrição das responsabilidades" />
                        </div>
                    </div>

                    <div>
                        <PermissionBuilder
                            selectedPermissions={roleForm.permissions || []}
                            onChange={(permissions) => setRoleForm({ ...roleForm, permissions })}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 transition">Cancelar</button>
                    <button onClick={handleSaveRole} disabled={!roleForm.name} className="px-8 py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all">Salvar Cargo</button>
                </div>
            </div>
        </div>
    );
};
