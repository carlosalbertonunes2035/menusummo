
import React, { useState, useMemo } from 'react';
import {
    Search, Plus, Image as ImageIcon, Power, Edit3, TrendingUp,
    LayoutTemplate, AlertCircle, Check, Loader2, Wand2, Import
} from 'lucide-react';
import { searchMatch } from '../../../lib/utils';
import { useData } from '../../../contexts/DataContext';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useMenuEditor } from '../hooks/useMenuEditor';
import { storageService } from '../../../lib/firebase/storageService';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';
import ProductEditor from '../components/menu/ProductEditor';
import MenuImportModal from '../components/menu/MenuImportModal';
import { Product } from '../../../types';

// --- SUB-COMPONENT: PRODUCT CARD ---
const MenuProductCard: React.FC<{
    product: Product & { marginPercent: number },
    onOpenEditor: (p: Product) => void,
    onToggleAvailability: (e: React.MouseEvent, p: Product) => void,
    isEditorOpen: boolean
}> = ({ product, onOpenEditor, onToggleAvailability, isEditorOpen }) => {
    const { handleAction, showToast } = useApp();
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || 'global';

    const posChannel = product.channels.find(c => c.channel === 'pos') || product.channels[0] || { price: 0, isAvailable: false, description: '', image: '' };
    const isAvailable = posChannel.isAvailable;
    const price = posChannel.price;

    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(price.toString());
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Profit Indicators
    const isLowMargin = product.marginPercent < 30;
    const isHighMargin = product.marginPercent >= 50;

    // Quick Edit Handlers
    const handlePriceSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        const newPrice = parseFloat(tempPrice);
        if (!isNaN(newPrice) && newPrice >= 0) {
            const newChannels = product.channels.map(c =>
                c.channel === 'pos' ? { ...c, price: newPrice } : c
            );
            handleAction('products', 'update', product.id, { channels: newChannels });
        } else {
            setTempPrice(price.toString());
        }
        setIsEditingPrice(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handlePriceSave();
        if (e.key === 'Escape') {
            setTempPrice(price.toString());
            setIsEditingPrice(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        let file: File | Blob | null = null;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            file = e.dataTransfer.files[0];
        } else {
            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            if (url && url.startsWith('http')) {
                setIsUploading(true);
                try {
                    const res = await fetch(url);
                    file = await res.blob();
                } catch (err) {
                    showToast("Link preservado. Use o editor para URLs bloqueadas.", "error");
                    setIsUploading(false); return;
                }
            }
        }

        if (file) {
            setIsUploading(true);
            try {
                const url = await storageService.uploadProductImage(file, tenantId, product.id);
                // Sync across all main channels
                const newChannels = product.channels.map(c =>
                    ['pos', 'digital-menu', 'ifood'].includes(c.channel) ? { ...c, image: url } : c
                );
                await handleAction('products', 'update', product.id, { image: url, channels: newChannels });
                showToast("Imagem atualizada com sucesso!", "success");
            } catch (err) {
                showToast("Erro ao atualizar imagem.", "error");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div
            onClick={() => onOpenEditor(product)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${isAvailable ? 'border-gray-100' : 'border-gray-200 opacity-60 grayscale-[0.5]'} ${isEditorOpen ? 'ring-2 ring-summo-primary border-summo-primary' : ''} ${isDragging ? 'ring-4 ring-summo-primary/50 scale-[1.02] z-20' : ''}`}
        >

            {/* Image Header */}
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {/* Combo Badge */}
                {product.type === 'COMBO' && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        🎁 COMBO
                    </div>
                )}
                {posChannel.image ? (
                    <div className="w-full h-full relative overflow-hidden">
                        {/* Blurred background filling for portrait/wide icons */}
                        <img
                            src={posChannel.image}
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110"
                            aria-hidden="true"
                        />
                        {/* Main Image contained properly */}
                        <img
                            src={posChannel.image}
                            alt={product.name}
                            className="relative w-full h-full object-contain z-10 group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        {isUploading ? <Loader2 size={40} className="animate-spin text-summo-primary" /> : <ImageIcon size={40} />}
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 size={32} className="animate-spin text-summo-primary mb-2" />
                        <span className="text-[10px] font-black text-summo-primary uppercase tracking-widest">Enviando...</span>
                    </div>
                )}

                {isDragging && (
                    <div className="absolute inset-0 bg-summo-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 border-4 border-dashed border-summo-primary">
                        <Plus size={48} className="text-summo-primary animate-bounce mb-2" />
                        <span className="bg-summo-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Solte para Atualizar</span>
                    </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button onClick={(e) => onToggleAvailability(e, product)} className={`p-2 rounded-full shadow-lg transition backdrop-blur-md ${isAvailable ? 'bg-white/90 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-red-100 text-red-500 hover:bg-green-50 hover:text-green-500'}`} title={isAvailable ? "Pausar Venda" : "Ativar Venda"}>
                        <Power size={16} />
                    </button>
                </div>

                <div className="absolute bottom-3 left-3 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-white/10">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight text-lg line-clamp-2">{product.name}</h3>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">{posChannel.description || "Sem descrição."}</p>

                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Preço Venda</span>
                        {isEditingPrice ? (
                            <div className="flex items-center">
                                <span className="text-sm font-bold text-gray-500 mr-1">R$</span>
                                <input
                                    autoFocus
                                    type="number"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    onBlur={() => handlePriceSave()}
                                    onKeyDown={handleKeyDown}
                                    className="w-20 p-0 text-xl font-black text-gray-800 border-b-2 border-summo-primary outline-none bg-transparent"
                                />
                            </div>
                        ) : (
                            <span
                                onClick={() => { setIsEditingPrice(true); setTempPrice(price.toString()); }}
                                className="text-xl font-black text-gray-800 cursor-text hover:text-summo-primary transition-colors border-b border-transparent hover:border-gray-200"
                                title="Clique para editar rápido"
                            >
                                R$ {price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className={`text-right px-2 py-1 rounded-lg ${isLowMargin ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : isHighMargin ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'}`}>
                        <p className="text-[10px] uppercase font-bold flex items-center gap-1 justify-end">
                            <TrendingUp size={10} /> Margem
                        </p>
                        <p className="font-bold text-sm">{product.marginPercent.toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            {/* Edit Overlay on Hover (Hidden if editing price) */}
            {!isEditingPrice && (
                <div className="absolute inset-0 bg-summo-primary/0 group-hover:bg-summo-primary/5 transition-colors pointer-events-none flex items-center justify-center">
                    <div className="bg-white text-summo-primary px-4 py-2 rounded-full font-bold shadow-xl transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                        <Edit3 size={16} /> Detalhes
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuEngineering: React.FC = () => {
    const { products, ingredients } = useData();
    const menuEditorLogic = useMenuEditor();
    const { openEditor, handleOpenCreator, toggleAvailability } = menuEditorLogic;

    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleImportSuccess = () => {
        // Force refresh or just close modal, data context should handle subscriptions
        // Ideally show success toast which is done inside modal
        // window.location.reload(); // Optional if subscription is not live
    };

    // Categories for the Capsule Header
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['Todos', ...Array.from(cats)];
    }, [products]);

    // 1. Enrich Products with Calculated Stats
    const productsWithStats = useMemo(() => {
        return products.map(p => {
            const posChannel = p.channels.find(c => c.channel === 'pos') || p.channels[0];
            const price = posChannel?.price || 0;
            const cost = p.cost || 0; // Assuming cost is on the product root
            const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

            return {
                ...p,
                marginPercent: margin
            };
        });
    }, [products]);

    // 2. Filter Logic
    const filteredProducts = useMemo(() => {
        let items = productsWithStats;

        // Filter by Category
        if (selectedCategory !== 'Todos') {
            items = items.filter(p => p.category === selectedCategory);
        }

        // Filter by Search
        if (searchQuery) {
            items = items.filter(p =>
                searchMatch(p.name, searchQuery) ||
                searchMatch(p.category, searchQuery) ||
                searchMatch(p.description || '', searchQuery)
            );
        }

        return items;
    }, [productsWithStats, selectedCategory, searchQuery]);

    const handleCreateType = (type: 'SIMPLE' | 'COMBO') => {
        handleOpenCreator(selectedCategory, type);
        setIsTypeModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 animate-fade-in relative">

            {/* HEADER AREA (No Sidebar) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">

                {/* Top Row: Title + Actions */}
                <div className="p-4 lg:px-8 lg:py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-summo-bg p-2 rounded-xl text-summo-primary">
                            <LayoutTemplate size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 leading-none">Menu Studio</h1>
                            <p className="text-xs text-gray-500 mt-1">{filteredProducts.length} itens cadastrados</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar item..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-summo-primary focus:ring-2 focus:ring-summo-primary/20 outline-none bg-gray-50 text-gray-800 text-sm transition-all"
                            />
                        </div>
                        <button onClick={() => setIsTypeModalOpen(true)} className="bg-summo-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center gap-2 whitespace-nowrap active:scale-95">
                            <Plus size={20} /> <span className="hidden sm:inline">Novo Produto</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Category Capsules (Scrollable) */}
                <div className="px-4 lg:px-8 pb-3 overflow-x-auto no-scrollbar flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                                ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredProducts.map((product, index) => (
                        <ErrorBoundary key={product.id || `product-${index}`} scope={`Card: ${product.name}`} fallback={<div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm">Erro ao carregar produto</div>}>
                            <MenuProductCard
                                product={product}
                                onOpenEditor={openEditor}
                                onToggleAvailability={toggleAvailability}
                                isEditorOpen={menuEditorLogic.selectedProduct?.id === product.id}
                            />
                        </ErrorBoundary>
                    ))}

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center max-w-md mx-auto">
                            <div className="bg-gray-100 p-6 rounded-full mb-6">
                                <Wand2 size={48} className="text-purple-500 opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Comece seu Cardápio</h3>
                            <p className="text-sm text-gray-500 mb-8">
                                Você ainda não tem produtos cadastrados. Que tal usar nossa IA para importar tudo automaticamente?
                            </p>

                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mb-4"
                            >
                                <Import size={20} /> Importar Cardápio (iFood/PDF)
                            </button>

                            <button onClick={() => setIsTypeModalOpen(true)} className="text-sm font-bold text-gray-500 hover:text-gray-700 underline">
                                Criar manualmente
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ProductEditor logic={menuEditorLogic} />

            {/* --- TYPE SELECTION MODAL --- */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-summo-primary/10 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />

                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">O que vamos criar?</h2>
                            <p className="text-gray-500">Escolha o tipo de item para começar.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <button
                                onClick={() => handleCreateType('SIMPLE')}
                                className="flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-summo-primary hover:shadow-xl transition-all group"
                            >
                                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <div className="w-8 h-8 bg-summo-primary rounded-lg" />
                                </div>
                                <span className="font-bold text-lg text-gray-800 group-hover:text-summo-primary">Produto Simples</span>
                                <span className="text-xs text-gray-500 text-center mt-2">Item único, com ficha técnica e preço fixo.</span>
                            </button>

                            <button
                                onClick={() => handleCreateType('COMBO')}
                                className="flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-orange-500 hover:shadow-xl transition-all group"
                            >
                                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <div className="flex gap-1">
                                        <div className="w-4 h-6 bg-orange-500 rounded-sm" />
                                        <div className="w-4 h-4 bg-orange-400 rounded-full self-end" />
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-gray-800 group-hover:text-orange-600">Combo</span>
                                <span className="text-xs text-gray-500 text-center mt-2">Conjunto de produtos com preço promocional.</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsTypeModalOpen(false)}
                            className="mt-8 w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <MenuImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />

        </div>
    );
};

export default React.memo(MenuEngineering);
