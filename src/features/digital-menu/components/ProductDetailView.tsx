import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, OptionGroup } from '@/types';
import { Plus, Minus, CheckCircle, ChevronLeft } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { getProductChannel } from '@/lib/utils';
import { getProductImage } from '../utils/imageMapper';

interface ProductDetailViewProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number, notes: string, selectedOptions: { groupTitle: string; optionName: string; price: number }[]) => void;
    onClose?: () => void; // Optional back/close handler
}

const OptionGroupAccordion: React.FC<{
    group: OptionGroup;
    selectedOptions: string[];
    onSelect: (optionId: string) => void;
    isUnmet: boolean;
}> = ({ group, selectedOptions, onSelect, isUnmet }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    return (
        <div className={`py-4 border-b border-gray-100 dark:border-gray-800 ${isUnmet ? 'bg-red-50/50 dark:bg-red-900/10 px-2 -mx-2 rounded-lg' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-start text-left">
                <div className="flex-1 pr-4">
                    <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">{group.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {group.type === 'SINGLE' ? 'Escolha 1 opção' : `Escolha até ${group.maxSelection || group.options.length}`}
                        {group.required && <span className="text-summo-primary font-bold ml-1">* Obrigatório</span>}
                    </p>
                </div>
                <div className="mt-1">
                    {group.required && <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${isUnmet ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>{isUnmet ? 'Obrigatório' : 'Concluído'}</span>}
                </div>
            </button>
            {isOpen && (
                <div className="space-y-4 mt-4 animate-fade-in">
                    {group.options.map(option => {
                        const isSelected = selectedOptions?.includes(option.id);
                        return (
                            <div key={option.id} onClick={() => onSelect(option.id)} className="flex justify-between items-center cursor-pointer group active:scale-[0.98] transition-transform">
                                <div className="flex-1 pr-4">
                                    <span className={`text-sm font-medium block ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{option.name}</span>
                                    {option.price > 0 && <span className="text-sm text-gray-500 font-normal">+ R$ {option.price.toFixed(2)}</span>}
                                </div>
                                <div className="flex items-center">
                                    {group.type === 'SINGLE' ? (
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-summo-primary' : 'border-gray-300'}`}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-summo-primary" />}
                                        </div>
                                    ) : (
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-summo-primary border-summo-primary' : 'border-gray-300'}`}>
                                            {isSelected && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// (Imports were added above if not already present - Assuming I need to add the import line)
import ComboProductDetailView from './ComboProductDetailView';

// ... (Existing OptionGroupAccordion)

const ProductDetailView: React.FC<ProductDetailViewProps> = (props) => {
    // Dispatcher Logic
    if (props.product.type === 'COMBO') {
        // Need to adapt onAddToCart signature or ensure Combo view matches
        // ComboView expects simplified logic, but parent Modal expects specific
        // We can pass a specific handler
        return <ComboProductDetailView {...props} />;
    }

    return <SingleProductDetailView {...props} />;
};

// Extracted Single Product View (Original Logic)
const SingleProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onAddToCart, onClose }) => {
    const { optionGroups: optionGroupLibrary } = useData();
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [notes, setNotes] = useState('');

    // ... (All original logic from ProductDetailView)
    const channelConfig = getProductChannel(product, 'digital-menu');
    const basePrice = channelConfig.promotionalPrice || channelConfig.price || 0;
    const originalPrice = channelConfig.price || 0;
    const hasPromo = channelConfig.promotionalPrice && channelConfig.promotionalPrice > 0 && channelConfig.promotionalPrice < originalPrice;

    const relevantOptionGroups = useMemo(() => {
        if (!product.optionGroupIds || !optionGroupLibrary) return [];
        return product.optionGroupIds
            .map(id => optionGroupLibrary.find(group => group.id === id))
            .filter((g): g is OptionGroup => !!g);
    }, [product.optionGroupIds, optionGroupLibrary]);

    const handleOptionSelect = useCallback((groupId: string, optionId: string) => {
        setSelectedOptions(prev => {
            const group = relevantOptionGroups.find(g => g.id === groupId);
            if (!group) return prev;

            const newSelection = { ...prev };
            const current = newSelection[groupId] || [];

            if (group.type === 'SINGLE') {
                newSelection[groupId] = [optionId];
            } else {
                if (current.includes(optionId)) {
                    newSelection[groupId] = current.filter(id => id !== optionId);
                } else {
                    if (!group.maxSelection || current.length < group.maxSelection) {
                        newSelection[groupId] = [...current, optionId];
                    }
                }
            }
            return newSelection;
        });
    }, [relevantOptionGroups]);

    const totalPrice = useMemo(() => {
        let optionsPrice = 0;
        for (const groupId in selectedOptions) {
            const group = relevantOptionGroups.find(g => g.id === groupId);
            if (group) {
                selectedOptions[groupId].forEach(optionId => {
                    const option = group.options.find(o => o.id === optionId);
                    if (option) optionsPrice += option.price;
                });
            }
        }
        return (basePrice + optionsPrice) * quantity;
    }, [basePrice, quantity, selectedOptions, relevantOptionGroups]);

    const { isAddToCartDisabled, unmetGroups } = useMemo(() => {
        const unmet = new Set<string>();
        let isDisabled = false;

        for (const group of relevantOptionGroups) {
            if (group.required) {
                const selection = selectedOptions[group.id];
                const minSelections = group.type === 'SINGLE' ? 1 : (group.minSelection ?? 1);

                if (minSelections > 0 && (!selection || selection.length < minSelections)) {
                    isDisabled = true;
                    unmet.add(group.id);
                }
            }
        }
        return { isAddToCartDisabled: isDisabled, unmetGroups: unmet };
    }, [relevantOptionGroups, selectedOptions]);

    const handleAddToCartClick = () => {
        if (isAddToCartDisabled) return;

        const finalOptions: { groupTitle: string; optionName: string; price: number }[] = [];
        for (const groupId in selectedOptions) {
            const group = relevantOptionGroups.find(g => g.id === groupId);
            if (group) {
                selectedOptions[groupId].forEach(optionId => {
                    const option = group.options.find(o => o.id === optionId);
                    if (option) finalOptions.push({ groupTitle: group.title, optionName: option.name, price: option.price });
                });
            }
        }
        onAddToCart(product, quantity, notes, finalOptions);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-36 overscroll-contain relative">
                {/* Back Button (Absolute) */}
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition">
                        <ChevronLeft size={24} />
                    </button>
                )}

                {/* Hero Image */}
                <div className="relative h-72 sm:h-96 w-full">
                    <img
                        src={getProductImage(product)}
                        className="w-full h-full object-cover"
                        alt={channelConfig.displayName}
                    />
                </div>

                <div className="px-5 py-6">
                    {/* Header Info */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">{channelConfig.displayName}</h2>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">R$ {basePrice.toFixed(2)}</span>
                            {hasPromo && <span className="text-sm text-gray-400 line-through mb-1">R$ {originalPrice.toFixed(2)}</span>}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{channelConfig.description}</p>
                    </div>

                    {/* Divider */}
                    <div className="h-2 bg-gray-50 dark:bg-gray-800 -mx-5 mb-6"></div>

                    {/* Options */}
                    <div className="space-y-2">
                        {relevantOptionGroups.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Escolha os complementos</h3>
                                <p className="text-xs text-gray-500">Selecione as opções para o seu pedido.</p>
                            </div>
                        )}

                        {relevantOptionGroups.map(group => (
                            <OptionGroupAccordion
                                key={group.id}
                                group={group}
                                selectedOptions={selectedOptions[group.id] || []}
                                onSelect={(optionId) => handleOptionSelect(group.id, optionId)}
                                isUnmet={unmetGroups.has(group.id)}
                            />
                        ))}
                    </div>

                    {/* Observations */}
                    <div className="mt-8">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                            Alguma observação? <span className="text-xs font-normal text-gray-400">(Opcional)</span>
                        </h4>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Tirar a cebola, maionese à parte..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none resize-none"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe z-20">
                <div className="flex flex-col gap-4 max-w-lg mx-auto">

                    {/* KIOSK STYLE COUNTER */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => {
                                if (quantity > 1) {
                                    setQuantity(q => q - 1);
                                    if (navigator.vibrate) navigator.vibrate(10);
                                }
                            }}
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 ${quantity > 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-300'}`}
                        >
                            <Minus size={28} />
                        </button>

                        <span className="text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
                            {quantity}
                        </span>

                        <button
                            onClick={() => {
                                setQuantity(q => q + 1);
                                if (navigator.vibrate) navigator.vibrate(10);
                            }}
                            className="w-14 h-14 rounded-xl bg-summo-primary text-white flex items-center justify-center shadow-lg shadow-summo-primary/30 active:scale-95 transition-all hover:bg-summo-dark"
                        >
                            <Plus size={28} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            handleAddToCartClick();
                            if (navigator.vibrate) navigator.vibrate(50);
                        }}
                        disabled={isAddToCartDisabled}
                        className="w-full h-14 bg-summo-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-summo-primary/20 active:scale-95 transition hover:bg-summo-dark disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex justify-between items-center px-6"
                    >
                        <span>Adicionar</span>
                        <span>R$ {totalPrice.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailView;
