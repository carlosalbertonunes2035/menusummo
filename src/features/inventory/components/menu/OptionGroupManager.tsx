import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save, Library, Link, Check, Circle, CheckCircle, Link2Off, Search, ListPlus } from 'lucide-react';
import { useData } from '../../../../contexts/DataContext';
import { useApp } from '../../../../contexts/AppContext';
import { Option, OptionGroup } from '../../../../types';

interface OptionGroupManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onLinkGroup: (groupId: string) => void;
    existingGroupIds: string[];
}

const OptionGroupManager: React.FC<OptionGroupManagerProps> = ({ isOpen, onClose, onLinkGroup, existingGroupIds }) => {
    const { optionGroups } = useData();
    const { handleAction, showToast } = useApp();

    const [isEditing, setIsEditing] = useState<Partial<OptionGroup> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = useMemo(() =>
        (optionGroups || []).filter(g => String(g.title || '').toLowerCase().includes(searchTerm.toLowerCase())),
        [optionGroups, searchTerm]);

    const handleEdit = (group: OptionGroup) => setIsEditing(group);
    const handleAddNew = () => setIsEditing({ title: '', type: 'SINGLE', required: false, options: [{ id: 'new-1', name: '', price: 0 }] });

    const handleSave = async () => {
        if (!isEditing || !isEditing.title || !isEditing.options || isEditing.options.some(o => !o.name)) {
            return showToast('Título e nome das opções são obrigatórios.', 'error');
        }

        const action = isEditing.id ? 'update' : 'add';
        const id = isEditing.id || `og-${Date.now()}`;
        const finalGroup = { ...isEditing, id };

        await handleAction('option_groups', action, id, finalGroup);
        showToast(`Grupo ${action === 'add' ? 'criado' : 'salvo'}!`, 'success');
        setIsEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir este grupo da biblioteca? Isso não o removerá de produtos que já o usam.')) {
            await handleAction('option_groups', 'delete', id);
            showToast('Grupo removido da biblioteca.', 'success');
        }
    };

    const handleOptionChange = (index: number, field: 'name' | 'price', value: string | number) => {
        if (!isEditing || !isEditing.options) return;
        const newOptions = [...isEditing.options];
        const val = field === 'price' ? Number(value) : value;
        // @ts-ignore
        newOptions[index] = { ...newOptions[index], [field]: val };
        setIsEditing({ ...isEditing, options: newOptions });
    };

    const addOption = () => {
        if (!isEditing) return;
        const newOptions = [...(isEditing.options || []), { id: `new-${Date.now()}`, name: '', price: 0 }];
        setIsEditing({ ...isEditing, options: newOptions });
    };

    const removeOption = (index: number) => {
        if (!isEditing || !isEditing.options || isEditing.options.length <= 1) return;
        setIsEditing({ ...isEditing, options: isEditing.options.filter((_, i) => i !== index) });
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Library size={20} className="text-summo-primary" />
                        Biblioteca de Complementos
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition"><X size={20} /></button>
                </div>

                {isEditing ? (
                    // EDIT / CREATE VIEW
                    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in-right">
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título do Grupo</label>
                                    <input
                                        value={isEditing.title}
                                        onChange={e => setIsEditing({ ...isEditing, title: e.target.value })}
                                        className="w-full text-lg font-bold text-gray-800 border-b-2 border-gray-200 focus:border-summo-primary outline-none py-2 transition placeholder:text-gray-300"
                                        placeholder="Ex: Escolha o Molho"
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Escolha</label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsEditing({ ...isEditing, type: 'SINGLE' })}
                                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition active:scale-95 ${isEditing.type === 'SINGLE' ? 'bg-summo-bg border-summo-primary text-summo-primary' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                            >
                                                <Circle size={20} className={isEditing.type === 'SINGLE' ? "fill-current" : ""} />
                                                <span className="text-xs font-bold">Única</span>
                                            </button>
                                            <button
                                                onClick={() => setIsEditing({ ...isEditing, type: 'MULTIPLE' })}
                                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition active:scale-95 ${isEditing.type === 'MULTIPLE' ? 'bg-summo-bg border-summo-primary text-summo-primary' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                            >
                                                <CheckCircle size={20} className={isEditing.type === 'MULTIPLE' ? "fill-current" : ""} />
                                                <span className="text-xs font-bold">Múltipla</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end pb-2">
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition select-none ${isEditing.required ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-transparent'}`}>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${isEditing.required ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                                                {isEditing.required && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${isEditing.required ? 'text-red-700' : 'text-gray-600'}`}>Obrigatório</span>
                                                <span className="text-[10px] text-gray-400 font-medium">O cliente deve selecionar?</span>
                                            </div>
                                            <input type="checkbox" checked={isEditing.required} onChange={e => setIsEditing({ ...isEditing, required: e.target.checked })} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <ListPlus size={18} className="text-gray-400" />
                                        Opções Disponíveis
                                    </h4>
                                    <span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">
                                        {isEditing.options?.length || 0} Itens
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {isEditing.options?.map((opt, idx) => (
                                        <div key={idx} className="flex gap-3 items-center group animate-in slide-in-from-bottom-2 fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-summo-primary/50 transition shadow-sm">
                                                <div className="w-10 h-full bg-gray-50 flex items-center justify-center border-r border-gray-100 text-gray-400 text-xs font-bold">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    value={opt.name}
                                                    onChange={e => handleOptionChange(idx, 'name', e.target.value)}
                                                    className="flex-1 p-3 outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300 bg-transparent"
                                                    placeholder="Nome da opção (ex: Bacon Extra)"
                                                />
                                            </div>

                                            <div className="relative w-32 group/price">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 group-focus-within/price:text-green-600 transition-colors">R$</div>
                                                <input
                                                    value={opt.price}
                                                    onChange={e => handleOptionChange(idx, 'price', e.target.value)}
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-3 pl-8 text-right bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition shadow-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <button
                                                onClick={() => removeOption(idx)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                                                title="Remover opção"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addOption}
                                    className="mt-4 w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-summo-primary hover:text-summo-primary hover:bg-summo-bg/10 transition flex items-center justify-center gap-2 group"
                                >
                                    <div className="p-1 bg-gray-100 rounded-full group-hover:bg-summo-primary group-hover:text-white transition">
                                        <Plus size={16} />
                                    </div>
                                    Adicionar Nova Opção
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
                            <button
                                onClick={() => setIsEditing(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-2.5 rounded-xl font-bold bg-summo-primary text-white shadow-lg shadow-summo-primary/20 hover:bg-summo-dark active:scale-95 transition text-sm flex items-center gap-2"
                            >
                                <Save size={18} />
                                {isEditing.id ? 'Salvar Alterações' : 'Criar Grupo'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // LIST VIEW
                    <div className="p-6 flex flex-col overflow-hidden h-full bg-gray-50/50">
                        <div className="flex justify-between items-center mb-6 flex-shrink-0 gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition" size={18} />
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar grupo de complementos..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary transition shadow-sm text-sm"
                                />
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="bg-summo-primary text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-summo-primary/20 hover:bg-summo-dark active:scale-95 transition whitespace-nowrap"
                            >
                                <Plus size={18} />
                                Novo Grupo
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-2">
                            {filteredGroups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                                    <Library size={48} className="mb-4 text-gray-300" />
                                    <p className="font-bold text-gray-600">Nenhum grupo encontrado.</p>
                                    <p className="text-sm text-gray-400">Crie um novo grupo para começar.</p>
                                </div>
                            ) : (
                                filteredGroups.map(group => {
                                    const isLinked = existingGroupIds.includes(group.id);
                                    return (
                                        <div
                                            key={group.id}
                                            className={`p-4 rounded-xl flex justify-between items-center transition border hover:shadow-md group ${isLinked
                                                ? 'bg-green-50/50 border-green-200 hover:border-green-300'
                                                : 'bg-white border-gray-200 hover:border-summo-primary/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${isLinked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-summo-bg group-hover:text-summo-primary transition-colors'}`}>
                                                    {isLinked ? <Check size={20} strokeWidth={3} /> : <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">{group.type === 'SINGLE' ? '1' : 'N'}</div>}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-base ${isLinked ? 'text-green-800' : 'text-gray-800'}`}>{group.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                                        <span className={`px-2 py-0.5 rounded font-bold ${group.type === 'SINGLE' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {group.type === 'SINGLE' ? 'Única' : 'Múltipla'}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500 font-medium">{group.options?.length || 0} opções</span>
                                                        {group.required && (
                                                            <>
                                                                <span className="text-gray-400">•</span>
                                                                <span className="text-red-500 font-bold flex items-center gap-0.5"><Circle size={6} fill="currentColor" /> Obrigatório</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
                                                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100 mr-2">
                                                    <button onClick={() => handleEdit(group)} className="p-2 hover:bg-white hover:text-summo-primary rounded-md transition hover:shadow-sm" title="Editar">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <div className="w-px bg-gray-200 my-1 mx-0.5"></div>
                                                    <button onClick={() => handleDelete(group.id)} className="p-2 hover:bg-white hover:text-red-500 rounded-md transition hover:shadow-sm" title="Excluir">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {isLinked ? (
                                                    <button
                                                        onClick={() => onLinkGroup(group.id)}
                                                        className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-xl font-bold shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center gap-2 group/btn min-w-[130px] justify-center"
                                                    >
                                                        <Check size={16} className="group-hover/btn:hidden" strokeWidth={3} />
                                                        <span className="group-hover/btn:hidden">Vinculado</span>

                                                        <Link2Off size={16} className="hidden group-hover/btn:inline" />
                                                        <span className="hidden group-hover/btn:inline">Desvincular</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onLinkGroup(group.id)}
                                                        className="px-4 py-2 bg-summo-bg text-summo-primary border-2 border-transparent hover:border-summo-primary/20 rounded-xl font-bold transition-all flex items-center gap-2 hover:shadow-md min-w-[110px] justify-center"
                                                    >
                                                        <Link size={16} />
                                                        Vincular
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OptionGroupManager;
