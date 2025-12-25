import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Sparkles, Check, ShoppingBag, Loader2 } from 'lucide-react';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { getProductChannel } from '@/lib/utils';

interface UpsellModalProps {
    isOpen: boolean;
    onClose: (suggestedProduct: Product | null) => void;
    addedProduct: Product;
    allProducts: Product[];
    roboticSuggestion?: Product | null;
}

const UpsellModal: React.FC<UpsellModalProps> = ({ isOpen, onClose, addedProduct, allProducts, roboticSuggestion }) => {
    const [suggestedProduct, setSuggestedProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (roboticSuggestion) {
                setSuggestedProduct(roboticSuggestion);
                setIsLoading(false);
            } else if (addedProduct) {
                const fetchSuggestion = async () => {
                    setIsLoading(true);
                    try {
                        const suggestUpsellFn = httpsCallable(functions, 'suggestUpsellFn');
                        const { data } = await suggestUpsellFn({ addedProduct, allProducts });
                        const result = data as any;
                        const suggestedId = result.suggestedProductId;
                        if (suggestedId) {
                            const product = allProducts.find(p => p.id === suggestedId);
                            setSuggestedProduct(product || null);
                        }
                    } catch (error) {
                        console.error("Failed to fetch upsell", error);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchSuggestion();
            }
        }
    }, [isOpen, addedProduct, allProducts, roboticSuggestion]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="p-6 pb-2 flex justify-between items-start">
                    <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                        <Sparkles size={20} />
                    </div>
                    <button onClick={() => onClose(null)} className="p-2 hover:bg-gray-100:bg-gray-800 rounded-full transition text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-2 text-center">
                    <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">Boa escolha!</h3>
                    <p className="text-sm text-gray-500 px-4">
                        Você adicionou <span className="font-bold text-gray-900">{addedProduct.name}</span> ao carrinho.
                    </p>

                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <Loader2 size={32} className="animate-spin text-summo-primary" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IA Analisando Cardápio...</p>
                        </div>
                    ) : suggestedProduct ? (
                        <div className="mt-8 space-y-6">
                            <div className="relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-summo-primary text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                    QUE TAL ACOMPANHAR COM?
                                </div>
                                <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                        <img
                                            src={getProductChannel(suggestedProduct, 'digital-menu').image || 'https://placehold.co/200x200'}
                                            className="w-full h-full object-cover"
                                            alt={suggestedProduct.name}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{suggestedProduct.name}</h4>
                                        <p className="text-summo-primary font-black">
                                            + R$ {(getProductChannel(suggestedProduct, 'digital-menu').price || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => onClose(suggestedProduct)}
                                    className="w-full bg-summo-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-summo-dark transition shadow-xl shadow-summo-primary/20 active:scale-95"
                                >
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <Check size={16} />
                                    </div>
                                    Sim, adicionar também!
                                </button>
                                <button
                                    onClick={() => onClose(null)}
                                    className="w-full text-gray-400 hover:text-gray-600:text-gray-200 py-2 text-sm font-bold transition"
                                >
                                    Não, obrigado
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12">
                            <button
                                onClick={() => onClose(null)}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Ver Carrinho
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpsellModal;
