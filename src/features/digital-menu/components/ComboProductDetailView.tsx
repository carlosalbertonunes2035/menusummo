import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/types';
import { Plus, Minus, Check, AlertCircle, ChevronLeft } from 'lucide-react';
import { getProductChannel } from '@/lib/utils';
import { getProductImage } from '../utils/imageMapper';
import { useData } from '@/contexts/DataContext';

interface ComboProductDetailViewProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number, notes: string, internalSelections: any[]) => void;
    onClose?: () => void;
}

const ComboProductDetailView: React.FC<ComboProductDetailViewProps> = ({ product, onAddToCart, onClose }) => {
    const { products } = useData();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    // State to track selections for each step: { stepIndex: { productId: qty } }
    const [selections, setSelections] = useState<Record<number, Record<string, number>>>({});

    const channelConfig = getProductChannel(product, 'digital-menu');
    const price = channelConfig.promotionalPrice || channelConfig.price || 0;
    const originalPrice = channelConfig.price || 0;
    const hasPromo = channelConfig.promotionalPrice && channelConfig.promotionalPrice > 0;

    // Helper to get product details
    const getProduct = (id: string) => products.find(p => p.id === id);

    // Initial Selections Setup
    useEffect(() => {
        const initialSelections: Record<number, Record<string, number>> = {};
        (product.comboSteps || []).forEach((_, idx) => {
            initialSelections[idx] = {};
        });
        setSelections(initialSelections);
    }, [product.comboSteps]);

    const handleStepSelection = (stepIndex: number, productId: string, delta: number) => {
        setSelections(prev => {
            const stepSelections = { ...(prev[stepIndex] || {}) };
            const currentQty = stepSelections[productId] || 0;
            const step = product.comboSteps![stepIndex];

            // Calculate total selected in this step
            const totalSelected = Object.values(stepSelections).reduce((a, b) => a + b, 0);

            // Validation logic
            if (delta > 0) {
                // Adding
                if (totalSelected >= step.max) return prev; // Max reached
            } else {
                // Removing
                if (currentQty <= 0) return prev; // Cannot go below 0
            }

            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0) {
                delete stepSelections[productId];
            } else {
                stepSelections[productId] = newQty;
            }

            return {
                ...prev,
                [stepIndex]: stepSelections
            };
        });
    };

    // Validation: Check if all steps have min requirements met
    const isReadyToAdd = useMemo(() => {
        if (!product.comboSteps) return true;
        return product.comboSteps.every((step, idx) => {
            const stepSelections = selections[idx] || {};
            const totalSelected = Object.values(stepSelections).reduce((a, b) => a + b, 0);
            return totalSelected >= step.min;
        });
    }, [product.comboSteps, selections]);

    const handleAddToCart = () => {
        if (!isReadyToAdd) return;

        // Simplify selections for cart: just a flat list of text or specific object structure
        // For now, we'll pass a structured object that the Cart can interpret or simple notes
        // Ideally, CartItem should support 'comboSelections'.
        // For MVP, we allow onAddToCart to accept any payload, but type says 'selectedOptions'.
        // We might need to map this to the expected format or update the type.
        // Assuming strict type, we'll map to 'selectedOptions' format:

        const finalOptions: { groupTitle: string; optionName: string; price: number }[] = [];

        // Add Fixed Items to "options" (visual only)
        if (product.comboItems) {
            product.comboItems.forEach(item => {
                const p = getProduct(item.productId);
                if (p) {
                    finalOptions.push({
                        groupTitle: 'Itens Fixos',
                        optionName: `${item.quantity}x ${p.name}`,
                        price: 0
                    });
                }
            });
        }

        // Add Step Selections
        Object.entries(selections).forEach(([stepIdxStr, stepSels]) => {
            const stepIdx = parseInt(stepIdxStr);
            const step = product.comboSteps![stepIdx];
            Object.entries(stepSels).forEach(([pid, qty]) => {
                const p = getProduct(pid);
                if (p) {
                    finalOptions.push({
                        groupTitle: step.name,
                        optionName: `${qty}x ${p.name}`,
                        price: 0 // Usually combos don't add price per item unless specified
                    });
                }
            });
        });

        onAddToCart(product, quantity, notes, finalOptions);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-40 overscroll-contain relative">
                {/* Back Button */}
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition">
                        <ChevronLeft size={24} />
                    </button>
                )}

                {/* Hero Image */}
                <div className="relative h-64 sm:h-80 w-full">
                    <img
                        src={getProductImage(product)}
                        className="w-full h-full object-cover"
                        alt={channelConfig.displayName}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <h2 className="text-2xl font-bold text-white leading-tight">{channelConfig.displayName}</h2>
                        <div className="flex items-end gap-3 mt-1">
                            <span className="text-2xl font-bold text-white">R$ {price.toFixed(2)}</span>
                            {hasPromo && (
                                <span className="text-sm text-white/70 line-through mb-1 bg-white/10 px-2 rounded">
                                    De R$ {originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-6 space-y-8">
                    <div className="text-sm text-gray-600 leading-relaxed">
                        {channelConfig.description}
                    </div>

                    {/* FIXED ITEMS SECTION */}
                    {product.comboItems && product.comboItems.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Check size={14} /> Incluso no Combo
                            </h3>
                            <div className="space-y-3">
                                {product.comboItems.map((item, idx) => {
                                    const p = getProduct(item.productId);
                                    if (!p) return null;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100">
                                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                                <img src={getProductImage(p)} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800">{item.quantity}x {p.name}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEPS SECTION */}
                    {(product.comboSteps || []).map((step, stepIdx) => {
                        // Filter available items for this step
                        const availableItems = step.items.filter((stepItem: any) => {
                            const p = getProduct(stepItem.productId);
                            if (!p) return false;
                            const config = getProductChannel(p, 'digital-menu');
                            return config.isAvailable;
                        });

                        if (availableItems.length === 0) return null; // Hide step if no items available (Or handle error?)

                        const stepSelections = selections[stepIdx] || {};
                        const totalSelected = Object.values(stepSelections).reduce((a, b) => a + b, 0);
                        const isComplete = totalSelected >= step.min;

                        return (
                            <div key={stepIdx} className={`border-b border-gray-100 pb-6 ${!isComplete ? 'bg-red-50/30 -mx-4 px-4 py-4 rounded-xl' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{step.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Escolha {step.min === step.max ? step.min : `${step.min} a ${step.max}`} itens
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {totalSelected}/{step.max}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {availableItems.map((stepItem: any, itemIdx: number) => {
                                        const p = getProduct(stepItem.productId);
                                        const qty = stepSelections[stepItem.productId] || 0;
                                        if (!p) return null;

                                        return (
                                            <div key={itemIdx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                        <img src={getProductImage(p)} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                                        {stepItem.overridePrice > 0 && <p className="text-xs text-gray-500">+ R$ {stepItem.overridePrice.toFixed(2)}</p>}
                                                    </div>
                                                </div>

                                                {/* Stepper */}
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                    <button
                                                        onClick={() => handleStepSelection(stepIdx, stepItem.productId, -1)}
                                                        disabled={qty === 0}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-md disabled:opacity-30 transition"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                    <button
                                                        onClick={() => handleStepSelection(stepIdx, stepItem.productId, 1)}
                                                        disabled={totalSelected >= step.max}
                                                        className="w-8 h-8 flex items-center justify-center text-summo-primary font-bold hover:bg-white rounded-md disabled:opacity-30 disabled:text-gray-400 transition"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Observations */}
                    <div className="mt-4">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            Observações <span className="text-xs font-normal text-gray-400">(Opcional)</span>
                        </h4>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Ponto da carne, sem sal..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none resize-none"
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 z-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col gap-4 max-w-lg mx-auto">
                    {/* Quantity Control */}
                    <div className="flex items-center justify-center gap-6 mb-2">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Minus size={20} /></button>
                        <span className="text-xl font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Plus size={20} /></button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!isReadyToAdd}
                        className="w-full h-14 bg-summo-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-summo-primary/20 active:scale-95 transition hover:bg-summo-dark disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center gap-3"
                    >
                        {!isReadyToAdd ? (
                            <>
                                <AlertCircle size={20} />
                                <span className="text-sm">Complete as escolhas</span>
                            </>
                        ) : (
                            <>
                                <span>Adicionar Combo</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">R$ {(price * quantity).toFixed(2)}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComboProductDetailView;
