
import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save, Library, Link, Check, Circle, CheckCircle } from 'lucide-react';
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
        (optionGroups || []).filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase())),
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
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Library size={20} className="text-summo-primary" /> Biblioteca de Complementos</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><X size={20} /></button>
                </div>

                {isEditing ? (
                    // EDIT / CREATE VIEW
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título do Grupo</label><input value={isEditing.title} onChange={e => setIsEditing({ ...isEditing, title: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" placeholder="Ex: Escolha o Molho" autoFocus /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo</label><div className="flex gap-2"><button onClick={() => setIsEditing({ ...isEditing, type: 'SINGLE' })} className={`flex-1 p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition ${isEditing.type === 'SINGLE' && 'bg-summo-bg border-summo-primary'}`}><Circle size={16} /> <span className="text-xs font-bold">Única</span></button><button onClick={() => setIsEditing({ ...isEditing, type: 'MULTIPLE' })} className={`flex-1 p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition ${isEditing.type === 'MULTIPLE' && 'bg-summo-bg border-summo-primary'}`}><CheckCircle size={16} /> <span className="text-xs font-bold">Múltipla</span></button></div></div>
                                    <div className="flex items-center justify-center"><label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100"><input type="checkbox" checked={isEditing.required} onChange={e => setIsEditing({ ...isEditing, required: e.target.checked })} className="w-5 h-5 text-summo-primary rounded" /><span className="text-sm font-bold text-gray-700">Obrigatório</span></label></div>
                                </div>
                            </div>
                            <div><h4 className="font-bold text-gray-800">Opções do Grupo</h4><div className="space-y-2 mt-2">{isEditing.options?.map((opt, idx) => (<div key={idx} className="flex gap-2 items-center group"><input value={opt.name} onChange={e => handleOptionChange(idx, 'name', e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-xl outline-none" placeholder={`Opção ${idx + 1}`} /><div className="relative w-28"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span><input value={opt.price} onChange={e => handleOptionChange(idx, 'price', e.target.value)} type="number" step="0.01" className="w-full p-3 pl-8 border border-gray-200 rounded-xl outline-none text-right font-mono" /></div><button onClick={() => removeOption(idx)} className="p-3 text-gray-300 hover:text-red-500 rounded-xl"><Trash2 size={18} /></button></div>))}<button onClick={addOption} className="mt-3 w-full py-3 border-2 border-dashed rounded-xl text-gray-500 font-bold hover:border-summo-primary hover:text-summo-primary transition flex items-center justify-center gap-2"><Plus size={18} /> Adicionar Opção</button></div></div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 flex-shrink-0">
                            <button onClick={() => setIsEditing(null)} className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-200">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-lg font-bold bg-summo-primary text-white shadow-lg flex items-center gap-2"><Save size={16} /> Salvar Grupo</button>
                        </div>
                    </div>
                ) : (
                    // LIST VIEW
                    <div className="p-5 flex flex-col overflow-hidden h-full">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar na biblioteca..." className="p-3 bg-gray-50 border rounded-lg outline-none text-sm w-64" />
                            <button onClick={handleAddNew} className="bg-summo-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Novo Grupo</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar -mr-3 pr-3">
                            {filteredGroups.map(group => {
                                const isLinked = existingGroupIds.includes(group.id);
                                return (
                                    <div key={group.id} className={`p-4 border rounded-xl flex justify-between items-center transition ${isLinked ? 'bg-green-50 border-green-200' : 'bg-white hover:border-gray-300'}`}>
                                        <div><p className="font-bold text-gray-800">{group.title}</p><p className="text-xs text-gray-500 mt-1">{group.options.length} opções</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(group)} className="p-2 bg-white text-gray-500 rounded-lg border shadow-sm hover:text-summo-primary"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(group.id)} className="p-2 bg-white text-gray-500 rounded-lg border shadow-sm hover:text-red-500"><Trash2 size={14} /></button>
                                            {isLinked ? (<span className="px-3 py-2 text-xs font-bold rounded-lg bg-white text-green-700 flex items-center gap-1 shadow-sm border"><Check size={14} /> Vinculado</span>) :
                                                (<button onClick={() => onLinkGroup(group.id)} className="px-3 py-2 text-xs font-bold rounded-lg bg-summo-bg text-summo-primary hover:bg-summo-primary hover:text-white transition shadow-sm border border-summo-primary/20 flex items-center gap-1"><Link size={14} /> Vincular</button>)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OptionGroupManager;
