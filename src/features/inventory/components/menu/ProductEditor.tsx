import React, { useEffect, useState, useMemo } from 'react';
import { useMenuEditor } from '../../hooks/useMenuEditor';
import { useApp } from '../../../../contexts/AppContext';
import { useOptionGroupsQuery } from '@/lib/react-query/queries/useOptionGroupsQuery';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useAuth } from '../../../auth/context/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import OptionGroupManager from './OptionGroupManager';

// Atomic Components
import { ProductEditorHeader } from './editor/ProductEditorHeader';
import { ProductEditorTabs, ProductEditorTab } from './editor/ProductEditorTabs';
import { ProductEditorFooter } from './editor/ProductEditorFooter';

// Sub-components
import { ProductBasicInfo } from './editor/ProductBasicInfo';
import { ProductImageManager } from './editor/ProductImageManager';
import { ProductEngineering } from './editor/ProductEngineering';
import { ProductSEO } from './editor/ProductSEO';
import { ProductChannels } from './editor/ProductChannels';

import { Product, OptionGroup, ChannelConfig } from '../../../../types';
import { slugify } from '../../../../lib/seoUtils';
import { isReservedSlug } from '../../../../lib/reservedSlugs';
import ErrorBoundary from '../../../../components/ui/ErrorBoundary';

import { AiRecipeModal } from './editor/AiRecipeModal';
import { SummoModal } from '../../../../components/ui/SummoModal';
import { Trash2, Save, Sparkles } from 'lucide-react';

// AI Consultant
import { useAiConsultant } from '../../../ai-consultant/hooks/useAiConsultant';
import { AiConsultantModal } from '../../../ai-consultant/components/AiConsultantModal';
import { AiInsightBadge } from '../../../ai-consultant/components/AiInsightBadge';

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

    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { optionGroups } = useOptionGroupsQuery(tenantId);
    const { products } = useProductsQuery(tenantId);

    // UI States
    const [isOptionManagerOpen, setIsOptionManagerOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // AI Consultant
    const {
        insights,
        isLoading: isLoadingInsights,
        error: insightsError,
        getInsights,
        dismissInsight,
        applyInsight,
        clearInsights
    } = useAiConsultant();
    const [showAiConsultantModal, setShowAiConsultantModal] = useState(false);

    // Auto-Slug Effect: Only runs on NEW products or when Name is actively edited
    useEffect(() => {
        const isNewProduct = !selectedProduct?.id || selectedProduct.name === 'Novo Produto';
        const isNameEdited = !!editData.name;

        if (isNewProduct || isNameEdited) {
            const nameToSlug = editData.name || selectedProduct?.name || '';
            const existingRecipeId = (currentEditingProduct as any)?.recipe?.id || (currentEditingProduct as any)?.recipeId;
            if (nameToSlug) {
                const newSlug = slugify(nameToSlug);
                const currentEffectiveSlug = editData.slug ?? selectedProduct?.slug;

                if (currentEffectiveSlug !== newSlug) {
                    setEditData(prev => ({ ...prev, slug: newSlug }));
                }
            }
        }
    }, [editData.name, selectedProduct, editData.slug, setEditData]);

    // Cleanup Effect: Reset UI states when editor opens/closes or product changes
    useEffect(() => {
        if (!selectedProduct) {
            setShowUnsavedModal(false);
            setShowDeleteConfirm(false);
            setIsOptionManagerOpen(false);
        }
    }, [selectedProduct]);

    const onCloseRequest = async () => {
        if (logic.isDirty) {
            setShowUnsavedModal(true);
        } else {
            handleClose(true);
        }
    };

    const [showAiModal, setShowAiModal] = useState(false);

    const handleSaveAndClose = async () => {
        // AI INTERCEPTOR:
        const isNewOrNoRecipe = !selectedProduct?.id || !currentEditingProduct?.recipe?.id;
        const hasName = !!(editData.name || selectedProduct?.name);
        const recipeJustInjected = !!editData.recipe;

        if (isNewOrNoRecipe && hasName && !recipeJustInjected) {
            setShowAiModal(true);
            return;
        }

        handleClose(true);
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
            let updatedChannels = [...existingChannels];

            if (updatedChannels.length === 0) {
                updatedChannels = [
                    { channel: 'pos', isAvailable: true, price: 0, displayName: newData.name || 'Novo Produto' },
                    { channel: 'digital-menu', isAvailable: true, price: 0, displayName: newData.name || 'Novo Produto', description: '' },
                    { channel: 'ifood', isAvailable: false, price: 0, displayName: newData.name || 'Novo Produto' }
                ];
            }

            if (field === 'name') {
                updatedChannels = updatedChannels.map((c: ChannelConfig) => ({ ...c, displayName: value }));
            } else if (field === 'price') {
                const newPrice = Number(value);
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

    // Tab Navigation
    const tabFlow: ProductEditorTab[] = ['GENERAL', 'OPTIONS', 'ENGINEERING', 'CHANNELS', 'SEO'];
    const currentTabIndex = activeTab ? tabFlow.indexOf(activeTab as ProductEditorTab) : 0;
    const canGoNext = currentTabIndex >= 0 && currentTabIndex < tabFlow.length - 1;

    const handleNextTab = () => {
        if (canGoNext && currentTabIndex >= 0) {
            setActiveTab(tabFlow[currentTabIndex + 1]);
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

    const currentChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === activeChannel);

    return (
        <>
            <div className="fixed inset-0 z-[60] flex justify-end">
                <div className="absolute inset-0 bg-summo-dark/60 backdrop-blur-sm transition-opacity" onClick={onCloseRequest}></div>

                <div className="relative w-full lg:w-[1000px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right h-full">

                    <ProductEditorHeader
                        product={selectedProduct}
                        editData={editData}
                        activeChannelData={currentChannelData}
                        onClose={onCloseRequest}
                        onChannelToggle={(checked) => handleChannelDataChange('isAvailable', checked)}
                    >
                        {/* AI Consultant Button */}
                        <div className="flex items-center gap-2">
                            {insights.length > 0 && (
                                <AiInsightBadge
                                    count={insights.length}
                                    onClick={() => setShowAiConsultantModal(true)}
                                />
                            )}
                            <button
                                onClick={async () => {
                                    setShowAiConsultantModal(true);
                                    if (insights.length === 0) {
                                        await getInsights(currentEditingProduct, {
                                            restaurantName: tenantId,
                                            restaurantType: 'Espetaria'
                                        });
                                    }
                                }}
                                className="
                                    flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                                    bg-primary-100 dark:bg-primary-900/30
                                    text-primary-700 dark:text-primary-300
                                    rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50
                                    transition-all duration-200
                                "
                                title="Consultar IA sobre este produto"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Consultor IA</span>
                            </button>
                        </div>
                    </ProductEditorHeader>

                    <ProductEditorTabs
                        activeTab={activeTab as ProductEditorTab}
                        setActiveTab={setActiveTab}
                    />

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 pb-24">
                        <ErrorBoundary scope={activeTab}>

                            {activeTab === 'GENERAL' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'OPTIONS' && (
                                <OptionGroupManager
                                    isEmbedded={true}
                                    isOpen={true}
                                    onClose={() => { }}
                                    onLinkGroup={linkOptionGroup}
                                    existingGroupIds={currentEditingProduct.optionGroupIds || []}
                                />
                            )}

                            {activeTab === 'ENGINEERING' && (
                                <ProductEngineering
                                    product={currentEditingProduct as any}
                                    onUpdate={setEditData}
                                    onLinkRecipe={linkRecipe}
                                    onUnlinkRecipe={unlinkRecipe}
                                    onUpdateIngredientAmount={updateIngredientAmount}
                                    onRemoveIngredient={removeIngredient}
                                />
                            )}

                            {activeTab === 'CHANNELS' && (
                                <ProductChannels
                                    product={currentEditingProduct as any}
                                    activeChannel={activeChannel}
                                    setActiveChannel={setActiveChannel}
                                    onUpdateChannel={handleChannelDataChange}
                                />
                            )}

                            {activeTab === 'SEO' && (
                                <ProductSEO
                                    product={currentEditingProduct as any}
                                    onUpdate={setEditData}
                                    slugError={slugError}
                                />
                            )}
                        </ErrorBoundary>
                    </div>

                    <ProductEditorFooter
                        isEditMode={!!selectedProduct.id}
                        canGoNext={canGoNext}
                        onDelete={() => setShowDeleteConfirm(true)}
                        onSaveAndClose={handleSaveAndClose}
                        onNext={handleNextTab}
                    />

                </div>
                <style>{` .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } `}</style>
            </div>

            {/* Delete Confirmation Modal */}
            <SummoModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Excluir Produto"
            >
                <div className="p-4">
                    <p className="text-gray-600 mb-6">Tem certeza que deseja excluir <b>{selectedProduct.name}</b>? Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={() => { handleDelete(); setShowDeleteConfirm(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sim, Excluir</button>
                    </div>
                </div>
            </SummoModal>

            {/* Unsaved Changes Warning Modal */}
            <SummoModal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                title="Descartar Alterações?"
            >
                <div className="p-4">
                    <p className="text-gray-600 mb-6">Você tem alterações não salvas. Deseja sair e perder o progresso?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowUnsavedModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Continuar Editando</button>
                        <button onClick={() => { logic.discardChanges(); setShowUnsavedModal(false); }} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Sair sem Salvar</button>
                    </div>
                </div>
            </SummoModal>


            <OptionGroupManager
                isOpen={isOptionManagerOpen}
                onClose={() => setIsOptionManagerOpen(false)}
                onLinkGroup={linkOptionGroup}
                existingGroupIds={currentEditingProduct.optionGroupIds || []}
            />

            {/* AI Proactive Modal */}
            <AiRecipeModal
                isOpen={showAiModal}
                onClose={() => {
                    setShowAiModal(false);
                    // If user cancels AI, proceed with normal save
                    handleSave();
                    handleClose(true);
                }}
                onAccept={(aiRecipe: any) => {
                    // Inject AI Recipe into Edits
                    const newRecipe = {
                        name: aiRecipe.name,
                        ingredients: aiRecipe.ingredients.map((ing: any) => ({
                            ingredientId: `NEW_${ing.name}`, // Placeholder for auto-creation
                            name: ing.name,
                            quantity: ing.quantity,
                            unit: ing.unit,
                            cost: ing.estimatedCost
                        })),
                        yield: 1,
                        totalCost: aiRecipe.totalCost
                    };

                    setEditData(prev => ({ ...prev, recipe: newRecipe } as any));

                    setTimeout(() => {
                        handleSave();
                        handleClose(true);
                        setShowAiModal(false);
                    }, 100);
                }}
                productName={editData.name || selectedProduct.name || ''}
            />

            {/* AI Consultant Modal */}
            <AiConsultantModal
                isOpen={showAiConsultantModal}
                onClose={() => setShowAiConsultantModal(false)}
                insights={insights}
                isLoading={isLoadingInsights}
                error={insightsError}
                onApplyInsight={(insight) => {
                    // Apply suggested changes
                    if (insight.suggestedAction) {
                        switch (insight.type) {
                            case 'pricing':
                                if (typeof insight.suggestedAction.value === 'number') {
                                    handleBasicInfoUpdate('price', insight.suggestedAction.value);
                                    showToast('Preço atualizado com base na sugestão da IA', 'success');
                                }
                                break;
                            case 'description':
                                if (typeof insight.suggestedAction.value === 'string') {
                                    handleBasicInfoUpdate('description', insight.suggestedAction.value);
                                    showToast('Descrição atualizada com base na sugestão da IA', 'success');
                                }
                                break;
                        }
                    }
                    applyInsight(insight);
                }}
                onDismissInsight={dismissInsight}
            />
        </>
    );
};

export default ProductEditor;
