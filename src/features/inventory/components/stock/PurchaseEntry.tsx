import React, { useState } from 'react';
import {
    Upload, FileText, Camera, Loader2,
    CheckCircle2, AlertCircle, ArrowRight, Trash2,
    Plus, Search, Save
} from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import { formatCurrency } from '../../../../lib/utils';

export const PurchaseEntry: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const {
        isAnalyzing, bulkItems, setBulkItems, processAiFile,
        ingredients, confirmBulkImport, openAddModal
    } = useStock();

    const [dragActive, setDragActive] = useState(false);
    const [step, setStep] = useState<'upload' | 'review'>('upload');

    const handleFile = async (file: File) => {
        setStep('review');
        await processAiFile(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeItem = (idx: number) => {
        const newItems = [...bulkItems];
        newItems.splice(idx, 1);
        setBulkItems(newItems);
    };

    const updateMatch = (idx: number, ingredientId: string) => {
        const newItems = [...bulkItems];
        newItems[idx].matchedIngredientId = ingredientId;
        setBulkItems(newItems);
    };

    const allMatched = bulkItems.length > 0 && bulkItems.every(i => i.matchedIngredientId !== "");

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-slide-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-summo-primary/20 p-2 rounded-xl">
                        <Camera className="text-summo-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-none">Entrada via IA</h2>
                        <p className="text-xs text-gray-400 mt-1">Extração inteligente de Notas Fiscais</p>
                    </div>
                </div>
                <button
                    onClick={onComplete}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                >
                    <Plus className="rotate-45" size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-8">
                {step === 'upload' ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
                            border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                            ${dragActive ? 'border-summo-primary bg-summo-primary/5 scale-[1.02]' : 'border-gray-100 hover:border-gray-200'}
                        `}
                    >
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Arraste sua nota aqui</h3>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                            Tire uma foto ou suba um PDF. Nossa IA vai identificar os itens e custos automaticamente.
                        </p>
                        <label className="bg-summo-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition cursor-pointer inline-flex items-center gap-2 active:scale-95">
                            <Camera size={20} /> Selecionar Arquivo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {isAnalyzing ? (
                            <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                                <Loader2 className="animate-spin text-summo-primary mb-4" size={48} />
                                <h4 className="text-lg font-bold text-gray-800">Processando Nota...</h4>
                                <p className="text-sm text-gray-400">Extraindo dados e cruzando com estoque</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-green-500" />
                                        {bulkItems.length} itens identificados
                                    </h4>
                                    <button
                                        onClick={() => setStep('upload')}
                                        className="text-xs font-bold text-summo-primary hover:underline"
                                    >
                                        Subir outro arquivo
                                    </button>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    {bulkItems.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl group transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-800 truncate">{item.rawName}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        Qtd: {item.quantity} {item.unit || 'un'} | Total: {formatCurrency(item.totalCost)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Search size={14} className="text-gray-400" />
                                                <select
                                                    value={item.matchedIngredientId}
                                                    onChange={(e) => updateMatch(idx, e.target.value)}
                                                    className={`
                                                        flex-1 bg-white border text-xs font-bold p-2.5 rounded-xl outline-none transition
                                                        ${item.matchedIngredientId ? 'border-green-200 text-green-700 bg-green-50/50' : 'border-gray-200 text-gray-500'}
                                                    `}
                                                >
                                                    <option value="">(Não vinculado - Ignorar)</option>
                                                    {ingredients.map(ing => (
                                                        <option key={ing.id} value={ing.id}>{ing.name}</option>
                                                    ))}
                                                </select>
                                                {!item.matchedIngredientId && (
                                                    <button
                                                        onClick={() => openAddModal(item.rawName)}
                                                        className="p-2.5 bg-white border border-gray-200 text-summo-primary rounded-xl hover:bg-summo-primary/5 transition"
                                                        title="Criar novo insumo"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={onComplete}
                                        className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={bulkItems.length === 0}
                                        onClick={confirmBulkImport}
                                        className={`
                                            flex-1 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition
                                            ${bulkItems.length > 0 ? 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <Save size={20} /> Confirmar Entrada
                                    </button>
                                </div>

                                {!allMatched && bulkItems.length > 0 && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center gap-2">
                                        <AlertCircle size={14} className="text-yellow-600" />
                                        <p className="text-[10px] font-bold text-yellow-700 uppercase">
                                            Alguns itens não foram vinculados e serão ignorados.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
