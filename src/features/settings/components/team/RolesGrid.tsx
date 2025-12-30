import React from 'react';
import { Shield, Plus, Edit, Trash2, Lock } from 'lucide-react';
import { Role } from '../../../../types/user';

interface RolesGridProps {
    roles: Role[];
    onAddRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
}

export const RolesGrid: React.FC<RolesGridProps> = ({
    roles, onAddRole, onEditRole, onDeleteRole
}) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Shield size={20} /> Cargos Personalizados ({roles.filter(r => !r.isSystem).length})</h3>
                <button onClick={onAddRole} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-200">
                    <Plus size={16} /> Criar Cargo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {roles.map((role) => (
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
                                        <button onClick={() => onEditRole(role)} className="p-2 text-gray-400 hover:text-summo-primary hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"><Edit size={16} /></button>
                                        <button onClick={() => onDeleteRole(role.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"><Trash2 size={16} /></button>
                                    </>
                                )}
                                {role.isSystem && role.id !== 'OWNER' && (
                                    <button onClick={() => alert("Cargos padrão não podem ser editados.")} className="p-2 text-gray-300 cursor-not-allowed"><Lock size={16} /></button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {role.permissions.slice(0, 5).map((p) => (
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
    );
};
