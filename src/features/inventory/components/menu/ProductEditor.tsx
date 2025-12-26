import React, { useEffect, useState, useMemo } from 'react';
import { useMenuEditor } from '../../hooks/useMenuEditor';
import { useData } from '../../../../contexts/DataContext';
import { useApp } from '../../../../contexts/AppContext';
import { useAuth } from '../../../auth/context/AuthContext';
import OptionGroupManager from './OptionGroupManager';

// Sub-components
import { ProductBasicInfo } from './editor/ProductBasicInfo';
import { ProductImageManager } from './editor/ProductImageManager';
import { ProductEngineering } from './editor/ProductEngineering';
import { ProductSEO } from './editor/ProductSEO';
import { ProductChannels } from './editor/ProductChannels';

import {
    X, LayoutTemplate, ListPlus, Calculator, Globe, Package, CheckCircle2,
    Save, Trash2, Library, Link2Off, Monitor, Loader2, Wand2,
    Image as ImageIcon, UploadCloud, Camera, Eye
} from 'lucide-react';
import { Product, OptionGroup, ChannelConfig } from '../../../../types';
import { slugify } from '../../../../lib/seoUtils';
import { isReservedSlug } from '../../../../lib/reservedSlugs';
import ErrorBoundary from '../../../../components/ui/ErrorBoundary';

interface ProductEditorProps {
    logic: ReturnType<typeof useMenuEditor>;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ logic }) => {
    const {
        selectedProduct, editData, setEditData, currentEditingProduct, handleClose, activeTab, setActiveTab,
        handleGenerateCopy, isGeneratingCopy, handleSave, handleTagToggle,
        linkRecipe, unlinkRecipe, updateIngredientAmount, removeIngredient,
        handleChannelDataChange, activeChannel, setActiveChannel,
        linkOptionGroup, unlinkOptionGroup, handleDelete
    } = logic;

    const { optionGroups, products } = useData();
    const { showToast } = useApp();

    // UI States
    const [isOptionManagerOpen, setIsOptionManagerOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Auto-Slug Effect: Only runs on NEW products or when Name is actively edited
    useEffect(() => {
        const isNewProduct = !selectedProduct?.id || selectedProduct.name === 'Novo Produto';
        const isNameEdited = !!editData.name;

        if (isNewProduct || isNameEdited) {
            const nameToSlug = editData.name || selectedProduct?.name || '';
            if (nameToSlug) {
                const newSlug = slugify(nameToSlug);
                const currentEffectiveSlug = editData.slug ?? selectedProduct?.slug;

                if (currentEffectiveSlug !== newSlug) {
                    setEditData(prev => ({ ...prev, slug: newSlug }));
                }
            }
        }
    }, [editData.name, selectedProduct, editData.slug, setEditData]);

    const onCloseRequest = async () => {
        if (logic.isDirty) {
            setShowUnsavedModal(true);
        } else {
            handleClose(true);
        }
    };

    const handleSaveAndClose = async () => {
        // Optimistic Close: Close UI immediately
        handleClose(true);
        // Then perform save in background
        handleSave();
    };

    // Derived State
    const linkedGroups = useMemo(() => {
        if (!currentEditingProduct?.optionGroupIds || !Array.isArray(currentEditingProduct.optionGroupIds)) {
            return [];
        }
        return currentEditingProduct.optionGroupIds
            .map((id: string) => optionGroups.find((g: OptionGroup) => g.id === id))
            .filter(Boolean) as OptionGroup[];
    }, [currentEditingProduct?.optionGroupIds, optionGroups]);

    const currentSlug = editData.slug ?? selectedProduct?.slug ?? '';
    const slugError = useMemo(() => {
        if (!currentSlug || !selectedProduct) return null;
        if (isReservedSlug(currentSlug)) return "Este termo é reservado pelo sistema.";
        const duplicate = products.find((p: Product) => p.slug === currentSlug && p.id !== (selectedProduct.id || editData.id));
        if (duplicate) return `Este link já está em uso pelo produto "${duplicate.name}".`;
        return null;
    }, [currentSlug, products, selectedProduct?.id, editData.id]);

    const uniqueCategories = useMemo(() =>
        Array.from(new Set(products.map((p: Product) => p.category))),
        [products]);

    // Handlers
    const handleBasicInfoUpdate = (field: keyof Product, value: any) => {
        setEditData((prev: Partial<Product>) => {
            const newData = { ...prev, [field]: value };
            const existingChannels = prev.channels || selectedProduct?.channels || [];

            // Ensure basic channels exist if arrays are empty (Fix for broken imports)
            let updatedChannels = [...existingChannels];

            if (updatedChannels.length === 0) {
                updatedChannels = [
                    { channel: 'pos', isAvailable: true, price: 0, displayName: newData.name || 'Novo Produto' },
                    { channel: 'digital-menu', isAvailable: true, price: 0, displayName: newData.name || 'Novo Produto', description: '' },
                    { channel: 'ifood', isAvailable: false, price: 0, displayName: newData.name || 'Novo Produto' }
                ];
            }

            // Sync logic
            if (field === 'name') {
                updatedChannels = updatedChannels.map((c: ChannelConfig) => ({ ...c, displayName: value }));
            } else if (field === 'price') {
                const newPrice = Number(value); // Ensure number
                newData.price = newPrice;
                updatedChannels = updatedChannels.map((c: ChannelConfig) => {
                    if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) {
                        return { ...c, price: newPrice };
                    }
                    return c;
                });
            } else if (field === 'description') {
                updatedChannels = updatedChannels.map((c: ChannelConfig) => {
                    if (['pos', 'digital-menu'].includes(c.channel)) {
                        return { ...c, description: value };
                    }
                    return c;
                });
            }

            newData.channels = updatedChannels;
            return newData;
        });
    };

    const handleImageChange = (url: string) => {
        setEditData((prev: Partial<Product>) => {
            const existingChannels = prev.channels || selectedProduct?.channels || [];
            const updatedChannels = existingChannels.map((c: ChannelConfig) => {
                if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) return { ...c, image: url };
                return c;
            });
            return { ...prev, image: url, channels: updatedChannels };
        });
    };

    // Completion Score
    const getCompletionScore = () => {
        let score = 0;
        const current = currentEditingProduct;
        if (!current) return 0;
        if (current.name) score += 20;
        if (current.channels?.some(c => c.image)) score += 20;
        if (current.ingredients && current.ingredients.length > 0) score += 20;
        if (current.channels?.some(c => c.isAvailable && c.price > 0)) score += 20;
        if (current.slug) score += 20;
        return score;
    };

    // Tab Navigation
    const tabFlow = ['GENERAL', 'OPTIONS', 'ENGINEERING', 'CHANNELS', 'SEO'] as const;
    const currentTabIndex = activeTab ? tabFlow.indexOf(activeTab) : 0;
    const canGoNext = currentTabIndex >= 0 && currentTabIndex < tabFlow.length - 1;
    const canGoPrevious = currentTabIndex > 0;

    const handleNextTab = () => {
        if (canGoNext && currentTabIndex >= 0) {
            setActiveTab(tabFlow[currentTabIndex + 1]);
        }
    };

    const handlePreviousTab = () => {
        if (canGoPrevious && currentTabIndex >= 0) {
            setActiveTab(tabFlow[currentTabIndex - 1]);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSaveAndClose();
            }
            if (e.ctrlKey && e.key === 'd' && selectedProduct?.id) {
                e.preventDefault();
                setShowDeleteConfirm(true);
            }
            if (e.key === 'Escape') {
                if (showDeleteConfirm) setShowDeleteConfirm(false);
                else if (showUnsavedModal) setShowUnsavedModal(false);
                else onCloseRequest();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSaveAndClose, onCloseRequest, selectedProduct?.id, showDeleteConfirm, showUnsavedModal]);


    if (!selectedProduct || !currentEditingProduct) return null;

    const digitalChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'digital-menu') || currentEditingProduct.channels?.[0] || { image: '', displayName: '', description: '' };
    const currentChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === activeChannel);

    return (
        <>
            <div className="fixed inset-0 z-[60] flex justify-end">
                <div className="absolute inset-0 bg-summo-dark/60 backdrop-blur-sm transition-opacity" onClick={onCloseRequest}></div>

                <div className="relative w-full lg:w-[1000px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right h-full">
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-summo-bg flex items-center justify-center text-summo-primary flex-shrink-0 relative overflow-hidden">
                                {digitalChannelData.image ? <img src={digitalChannelData.image} className="w-full h-full object-cover" /> : <Package size={20} />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-800 leading-none truncate">{editData.name || selectedProduct.name || "Novo Produto"}</h2>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${(editData.type || currentEditingProduct.type) === 'COMBO' ? 'bg-orange-100 text-orange-700' : 'bg-summo-bg text-summo-primary'}`}>
                                        {(editData.type || currentEditingProduct.type) === 'COMBO' ? '🎁 COMBO' : 'SIMPLES'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">{selectedProduct.id ? "Editando Produto" : "Criando Novo Produto"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {currentChannelData && (
                                <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition select-none ${currentChannelData.isAvailable ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}>
                                    <div className={`w-2 h-2 rounded-full ${currentChannelData.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className={`text-xs font-bold uppercase ${currentChannelData.isAvailable ? 'text-green-700' : 'text-red-700'}`}>{currentChannelData.isAvailable ? 'Ativo' : 'Pausado'}</span>
                                    <input type="checkbox" className="hidden" checked={currentChannelData.isAvailable || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelDataChange('isAvailable', e.target.checked)} />
                                </label>
                            )}
                            <div className="h-8 w-px bg-gray-200"></div>
                            <button type="button" onClick={onCloseRequest} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"><X size={24} /></button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="font-medium">Progresso:</span>
                            <span className="font-bold text-summo-primary">{getCompletionScore()}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${getCompletionScore()}%` }}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 border-b border-gray-100 flex gap-6 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('GENERAL')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'GENERAL' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><LayoutTemplate size={16} className="inline mr-2 mb-0.5" /> Cadastro Básico</button>
                        <button onClick={() => setActiveTab('OPTIONS')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'OPTIONS' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><ListPlus size={16} className="inline mr-2 mb-0.5" /> Complementos</button>
                        <button onClick={() => setActiveTab('ENGINEERING')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'ENGINEERING' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Calculator size={16} className="inline mr-2 mb-0.5" /> Engenharia & Lucro</button>
                        <button onClick={() => setActiveTab('CHANNELS')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'CHANNELS' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Monitor size={16} className="inline mr-2 mb-0.5" /> Canais de Venda</button>
                        <button onClick={() => setActiveTab('SEO')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'SEO' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Globe size={16} className="inline mr-2 mb-0.5" /> SEO & Marketing</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 pb-24">
                        <ErrorBoundary scope={activeTab}>

                            {/* GENERAL TAB */}
                            {activeTab === 'GENERAL' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Monitor size={12} /> Informações Principais</h4>

                                        <ProductBasicInfo
                                            product={currentEditingProduct}
                                            editData={editData}
                                            onUpdate={handleBasicInfoUpdate}
                                            categories={uniqueCategories as string[]}
                                            onImageChange={handleImageChange}
                                        />

                                        <div className="pt-4 border-t border-gray-100 mt-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Etiquetas (Tags)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Promoção', 'Novo', 'Vegano', 'Mais Vendido', 'Sem Glúten', 'Sem Lactose'].map((tag: string) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleTagToggle(tag)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition flex items-center gap-1 ${(currentEditingProduct?.tags || []).includes(tag) ? 'bg-summo-bg text-summo-primary border-summo-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                                    >
                                                        {tag} {(currentEditingProduct?.tags || []).includes(tag) && <CheckCircle2 size={12} strokeWidth={3} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* OPTIONS TAB */}
                            {activeTab === 'OPTIONS' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">Grupos Vinculados</h3>
                                            <button onClick={() => setIsOptionManagerOpen(true)} className="bg-summo-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-summo-dark transition text-sm flex items-center gap-2"><Library size={16} /> Gerenciar Biblioteca</button>
                                        </div>
                                        {!linkedGroups || linkedGroups.length === 0 ? <p className="text-center py-8 text-gray-400">Nenhum grupo de complemento vinculado.</p> :
                                            <div className="space-y-3">{linkedGroups.map((group: OptionGroup) => (group ? <div key={group.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center"><div><p className="font-bold text-gray-700">{group.title}</p><p className="text-xs text-gray-500">{group.options?.length || 0} opções</p></div><button onClick={() => unlinkOptionGroup(group.id)} className="text-red-400 hover:text-red-600 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"><Link2Off size={16} /></button></div> : null))}</div>
                                        }
                                    </div>
                                </div>
                            )}

                            {/* ENGINEERING TAB */}
                            {activeTab === 'ENGINEERING' && (
                                <ProductEngineering
                                    product={currentEditingProduct}
                                    linkRecipe={linkRecipe}
                                    unlinkRecipe={unlinkRecipe}
                                    onChannelDataChange={handleChannelDataChange}
                                />
                            )}

                            {/* CHANNELS TAB */}
                            {activeTab === 'CHANNELS' && (
                                <ProductChannels
                                    product={currentEditingProduct}
                                    editData={editData}
                                    activeChannel={activeChannel}
                                    onChannelChange={setActiveChannel}
                                    onChannelDataChange={handleChannelDataChange}
                                    handleGenerateCopy={handleGenerateCopy}
                                    isGeneratingCopy={isGeneratingCopy}
                                />
                            )}

                            {/* SEO TAB */}
                            {activeTab === 'SEO' && (
                                <ProductSEO
                                    product={currentEditingProduct}
                                    editData={editData}
                                    onUpdate={handleBasicInfoUpdate}
                                    slugError={slugError}
                                />
                            )}
                        </ErrorBoundary>
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <div className="p-4 pb-safe lg:pb-4 flex items-center justify-between gap-4">
                            {/* Delete Button - Left Side */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
                                title={selectedProduct.id ? "Excluir Produto (Ctrl+D)" : "Descartar Rascunho"}
                            >
                                <Trash2 size={20} />
                            </button>

                            {/* Navigation Buttons - Right Side */}
                            <div className="flex items-center gap-3 flex-1 justify-end">
                                {/* Always Show Save Button for Quick Access */}
                                <button
                                    onClick={handleSaveAndClose}
                                    className="px-6 py-3 bg-white text-summo-primary border-2 border-summo-primary/10 rounded-xl font-bold hover:bg-summo-bg transition flex items-center justify-center gap-2 active:scale-95"
                                    title="Salvar e Fechar (Ctrl+S)"
                                >
                                    <Save size={18} /> Salvar
                                </button>

                                {canGoNext ? (
                                    <button
                                        onClick={handleNextTab}
                                        className="px-6 py-3 bg-summo-primary text-white rounded-xl font-bold hover:bg-summo-dark transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-summo-primary/20"
                                    >
                                        Próximo →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSaveAndClose}
                                        className="px-6 py-3 bg-summo-primary text-white rounded-xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Save size={20} /> Concluir
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
                <style>{` .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } `}</style>
            </div >

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Excluir Produto?
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja excluir <strong className="text-gray-800">"{selectedProduct?.name}"</strong>?
                            <br />
                            <span className="text-red-600 text-sm mt-2 block">⚠️ Esta ação não pode ser desfeita.</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete();
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <OptionGroupManager
                isOpen={isOptionManagerOpen}
                onClose={() => setIsOptionManagerOpen(false)}
                onLinkGroup={linkOptionGroup}
                existingGroupIds={currentEditingProduct.optionGroupIds || []}
            />
            {/* Unsaved Changes Warning Modal */}
            {showUnsavedModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Save size={24} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Salvar Alterações?
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Você tem alterações não salvas em <strong className="text-gray-800">"{editData.name || selectedProduct.name || "Novo Produto"}"</strong>.
                            <br />
                            Deseja salvar antes de sair?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={async () => {
                                    await handleSaveAndClose();
                                    setShowUnsavedModal(false);
                                }}
                                className="w-full py-3 bg-summo-primary text-white rounded-xl font-bold hover:bg-summo-dark transition flex items-center justify-center gap-2 shadow-lg shadow-summo-primary/20"
                            >
                                <Save size={18} /> Sim, Salvar e Sair
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleClose(true)}
                                    className="flex-1 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition"
                                >
                                    Descartar Alterações
                                </button>
                                <button
                                    onClick={() => setShowUnsavedModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Continuar Editando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductEditor;
