
import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Check, Link, Trash2, Circle, CheckCircle, GripVertical } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useOptionGroupsQuery } from '@/lib/react-query/queries/useOptionGroupsQuery';
import { Option, OptionGroup } from '../../../../types';

interface OptionGroupSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLinkGroup: (groupId: string) => void;
    existingGroupIds: string[];
}

const OptionGroupSelectorModal: React.FC<OptionGroupSelectorModalProps> = ({ isOpen, onClose, onLinkGroup, existingGroupIds }) => {
    const { tenantId, showToast } = useApp();
    const { optionGroups, saveOptionGroup } = useOptionGroupsQuery(tenantId);

    const [activeTab, setActiveTab] = useState<'EXISTING' | 'NEW'>('EXISTING');
    const [searchTerm, setSearchTerm] = useState('');

    // --- State for "Create New" Tab ---
    const [newGroup, setNewGroup] = useState<Partial<OptionGroup>>({
        title: '',
        type: 'SINGLE',
        required: false,
        minSelection: 0,
        maxSelection: 1,
        options: [{ id: 'opt-1', name: '', price: 0 }]
    });

    const filteredGroups = useMemo(() => {
        if (!optionGroups) return [];
        return optionGroups.filter(group =>
            !existingGroupIds.includes(group.id) &&
            String(group.title || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [optionGroups, existingGroupIds, searchTerm]);

    const handleAddOption = () => {
        setNewGroup(prev => ({
            ...prev,
            options: [...(prev.options || []), { id: `opt-${Date.now()}`, name: '', price: 0 }]
        }));
    };

    const handleRemoveOption = (index: number) => {
        if ((newGroup.options?.length || 0) <= 1) return;
        setNewGroup(prev => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== index)
        }));
    };

    const handleOptionChange = (index: number, field: 'name' | 'price', value: string | number) => {
        const updatedOptions = [...(newGroup.options || [])];
        // @ts-ignore
        updatedOptions[index][field] = field === 'price' ? Number(value) : value;
        setNewGroup(prev => ({ ...prev, options: updatedOptions }));
    };

    const handleCreateAndLink = async () => {
        if (!newGroup.title || !newGroup.options || newGroup.options.some(o => !o.name)) {
            showToast('Título do grupo e nome das opções são obrigatórios.', 'error');
            return;
        }

        // Validation logic for min/max
        if (newGroup.type === 'MULTIPLE') {
            if ((newGroup.maxSelection || 0) < (newGroup.minSelection || 0)) {
                showToast('O máximo não pode ser menor que o mínimo.', 'error');
                return;
            }
        }

        const newGroupId = `og-${Date.now()}`;
        const finalGroup = {
            ...newGroup,
            id: newGroupId,
            options: newGroup.options.map(o => ({ ...o, id: `opt-${Date.now()}-${Math.random()}` }))
        };

        await saveOptionGroup(finalGroup);
        onLinkGroup(newGroupId);
        showToast('Grupo criado e vinculado!', 'success');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" aria-hidden="false">
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-in-up" role="dialog" aria-modal="true" aria-labelledby="modal-title-og">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 id="modal-title-og" className="font-bold text-lg text-gray-800">Adicionar Grupo de Opções</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500" aria-label="Fechar"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="p-2 bg-gray-100 flex gap-2">
                    <button onClick={() => setActiveTab('EXISTING')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'EXISTING' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500'}`}>
                        Usar Existente
                    </button>
                    <button onClick={() => setActiveTab('NEW')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'NEW' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500'}`}>
                        Criar Novo
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'EXISTING' ? (
                    <div className="p-5 flex flex-col overflow-hidden h-full">
                        <div className="relative mb-4 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por nome (ex: Ponto da Carne, Bebidas...)"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 custom-scrollbar">
                            {filteredGroups.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>Nenhum grupo encontrado.</p>
                                    <button onClick={() => setActiveTab('NEW')} className="text-summo-primary font-bold text-sm mt-2 hover:underline">Criar um novo?</button>
                                </div>
                            ) : (
                                filteredGroups.map(group => (
                                    <div key={group.id} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center hover:border-summo-primary/50 transition bg-white group">
                                        <div>
                                            <p className="font-bold text-gray-800">{group.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {group.type === 'SINGLE' ? 'Escolha Única' : 'Múltipla'} • {group.options.length} opções
                                            </p>
                                        </div>
                                        <button onClick={() => { onLinkGroup(group.id); onClose(); }} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 group-hover:bg-summo-primary group-hover:text-white transition shadow-sm">
                                            <Link size={14} /> Vincular
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5">
                        {/* Group Settings */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título do Grupo</label>
                                <input value={newGroup.title} onChange={e => setNewGroup({ ...newGroup, title: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" placeholder="Ex: Escolha o Molho" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Escolha</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setNewGroup({ ...newGroup, type: 'SINGLE', minSelection: 1, maxSelection: 1 })} className={`flex-1 p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition ${newGroup.type === 'SINGLE' ? 'bg-white border-summo-primary text-summo-primary shadow-sm ring-1 ring-summo-primary' : 'bg-white text-gray-500'}`}>
                                            <Circle size={16} /> <span className="text-xs font-bold">Única</span>
                                        </button>
                                        <button onClick={() => setNewGroup({ ...newGroup, type: 'MULTIPLE' })} className={`flex-1 p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition ${newGroup.type === 'MULTIPLE' ? 'bg-white border-summo-primary text-summo-primary shadow-sm ring-1 ring-summo-primary' : 'bg-white text-gray-500'}`}>
                                            <CheckCircle size={16} /> <span className="text-xs font-bold">Múltipla</span>
                                        </button>
                                    </div>
                                </div>

                                {newGroup.type === 'MULTIPLE' ? (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mínimo</label>
                                            <input type="number" value={newGroup.minSelection} onChange={e => setNewGroup({ ...newGroup, minSelection: parseInt(e.target.value) })} className="w-full p-2 border rounded-lg text-center font-bold" min={0} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Máximo</label>
                                            <input type="number" value={newGroup.maxSelection} onChange={e => setNewGroup({ ...newGroup, maxSelection: parseInt(e.target.value) })} className="w-full p-2 border rounded-lg text-center font-bold" min={1} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 w-full justify-center h-full">
                                            <input type="checkbox" checked={newGroup.required} onChange={e => setNewGroup({ ...newGroup, required: e.target.checked })} className="w-5 h-5 text-summo-primary rounded" />
                                            <span className="text-sm font-bold text-gray-700">Obrigatório</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-800">Opções do Grupo</h4>
                                <span className="text-xs text-gray-400">{newGroup.options?.length} itens</span>
                            </div>
                            <div className="space-y-2">
                                {newGroup.options?.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center group animate-fade-in">
                                        <div className="text-gray-300 cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
                                        <input value={opt.name} onChange={e => handleOptionChange(idx, 'name', e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:border-summo-primary" placeholder={`Nome da Opção ${idx + 1}`} />
                                        <div className="relative w-28">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                                            <input value={opt.price} onChange={e => handleOptionChange(idx, 'price', e.target.value)} type="number" step="0.01" className="w-full p-3 pl-8 border border-gray-200 rounded-xl outline-none focus:border-summo-primary text-right font-mono" placeholder="0.00" />
                                        </div>
                                        <button onClick={() => handleRemoveOption(idx)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddOption} className="mt-3 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-summo-primary hover:text-summo-primary hover:bg-summo-bg transition flex items-center justify-center gap-2">
                                <Plus size={18} /> Adicionar Opção
                            </button>
                        </div>

                        <div className="pt-4 mt-auto">
                            <button onClick={handleCreateAndLink} className="w-full py-4 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-summo-dark transition active:scale-95">
                                Salvar e Vincular Grupo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OptionGroupSelectorModal;
