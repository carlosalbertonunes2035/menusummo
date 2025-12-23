import React from 'react';
import { Product } from '../../../types';
import { X, Wand2, Loader2 } from 'lucide-react';

interface POSModalsProps {
    isAiModalOpen: boolean;
    setIsAiModalOpen: (open: boolean) => void;
    aiInputText: string;
    setAiInputText: (text: string) => void;
    handleAiOrder: () => void;
    isProcessingAi: boolean;

    customizingProduct: Product | null;
    setCustomizingProduct: (p: Product | null) => void;
    customQty: number;
    setCustomQty: (cb: (prev: number) => number) => void; // Aceita callback ou valor direto se ajustado
    customNotes: string;
    setCustomNotes: (s: string) => void;
    handleAddToCartFromModal: () => void;
    noteInputRef: React.RefObject<HTMLTextAreaElement>;
}

const POSModals: React.FC<POSModalsProps> = ({
    isAiModalOpen, setIsAiModalOpen, aiInputText, setAiInputText, handleAiOrder, isProcessingAi,
    customizingProduct, setCustomizingProduct, customQty, setCustomQty, customNotes, setCustomNotes, handleAddToCartFromModal, noteInputRef
}) => {
    return (
        <>
            {/* AI Order Modal */}
            {isAiModalOpen && (
                <div onClick={() => setIsAiModalOpen(false)} className="fixed inset-0 bg-summo-dark/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
                        <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-summo-dark"><Wand2 size={24} className="text-summo-primary" /> IA Mágica</h3>
                        <textarea
                            className="w-full h-32 border p-3 rounded-2xl text-lg outline-none focus:ring-2 focus:ring-summo-primary transition resize-none bg-gray-50"
                            value={aiInputText}
                            onChange={e => setAiInputText(e.target.value)}
                            placeholder="Ex: Quero um açaí completo sem banana e uma coca zero..."
                            autoFocus
                        />
                        <button onClick={handleAiOrder} disabled={isProcessingAi} className="mt-4 bg-summo-primary text-white px-4 py-3 rounded-xl w-full font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95 transition">
                            {isProcessingAi ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} Processar Pedido
                        </button>
                    </div>
                </div>
            )}

            {/* Customization Modal */}
            {customizingProduct && (
                <div onClick={() => setCustomizingProduct(null)} className="fixed inset-0 bg-summo-dark/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
                        <button onClick={() => setCustomizingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h3 className="font-bold text-xl mb-1 pr-6 text-gray-800">{customizingProduct.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">Adicionar detalhes ao item</p>

                        <div className="flex gap-4 mb-6 items-center justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <button onClick={() => setCustomQty((q: number) => Math.max(1, q - 1))} className="w-12 h-12 bg-white border border-gray-200 rounded-xl text-xl font-bold flex items-center justify-center active:scale-95 transition shadow-sm text-gray-600">-</button>
                            <span className="font-bold text-3xl text-summo-dark w-12 text-center">{customQty}</span>
                            <button onClick={() => setCustomQty((q: number) => q + 1)} className="w-12 h-12 bg-white border border-gray-200 rounded-xl text-xl font-bold flex items-center justify-center active:scale-95 transition shadow-sm text-gray-600">+</button>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Observações</label>
                            <textarea
                                ref={noteInputRef}
                                value={customNotes}
                                onChange={e => setCustomNotes(e.target.value)}
                                className="border border-gray-200 bg-gray-50 p-3 w-full rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none transition"
                                placeholder="Ex: Sem cebola, Capricha no leite condensado..."
                                rows={3}
                                autoFocus
                            />
                        </div>

                        <button onClick={handleAddToCartFromModal} className="bg-summo-primary text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition hover:bg-summo-dark">
                            {/* @FIX: Access price from channel configuration */}
                            Adicionar R$ {(((customizingProduct.channels.find(c => c.channel === 'pos')?.price || 0)) * customQty).toFixed(2)}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default POSModals;
