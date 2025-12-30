import React from 'react';
import { Users, Plus, Shield, Edit, Trash2, Lock } from 'lucide-react';
import { SystemUser } from '../../../../types/user';

interface MembersTableProps {
    users: SystemUser[];
    loading: boolean;
    currentUserId?: string;
    onAddMember: () => void;
    onEditMember: (user: SystemUser) => void;
    onDeleteMember: (userId: string) => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
    users, loading, currentUserId, onAddMember, onEditMember, onDeleteMember
}) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Users size={20} /> Colaboradores ({users.length})</h3>
                <button onClick={onAddMember} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-200">
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
                                                    onClick={() => onEditMember(u)}
                                                    className="absolute -bottom-1 -right-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-summo-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit size={10} />
                                                </button>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 flex items-center gap-2">
                                                    {u.name}
                                                    {u.id === currentUserId && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 rounded uppercase font-bold">Você</span>}
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
                                                onClick={() => onEditMember(u)}
                                                className="p-2 text-gray-400 hover:text-summo-primary hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                                                title="Editar membro"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {u.role?.id !== 'OWNER' && !u.isMasterUser && (
                                                <button
                                                    onClick={() => onDeleteMember(u.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Remover da equipe"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
    );
};
