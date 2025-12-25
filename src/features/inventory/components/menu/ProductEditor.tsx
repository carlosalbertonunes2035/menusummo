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
    Image as ImageIcon, UploadCloud, Camera
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

    // Auto-Slug Effect
    useEffect(() => {
        const nameToSlug = editData.name || selectedProduct?.name || '';
        if (nameToSlug) {
            const newSlug = slugify(nameToSlug);
            if (editData.slug !== newSlug) {
                setEditData(prev => ({ ...prev, slug: newSlug }));
            }
        }
    }, [editData.name, selectedProduct?.name, editData.slug, setEditData]);

    // Derived State
    // Vincular grupos de opções com segurança
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
        if (field === 'name') {
            // Update name and sync displayName across channels
            setEditData((prev: Partial<Product>) => {
                const newData = { ...prev, name: value };
                if (prev.channels) {
                    const updatedChannels = prev.channels.map((c: ChannelConfig) => ({ ...c, displayName: value }));
                    newData.channels = updatedChannels;
                }
                return newData;
            });
        } else {
            setEditData(prev => ({ ...prev, [field]: value }));
        }
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

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S - Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl+D - Delete (only if product exists)
            if (e.ctrlKey && e.key === 'd' && selectedProduct?.id) {
                e.preventDefault();
                setShowDeleteConfirm(true);
            }
            // Esc - Close modal or confirmation
            if (e.key === 'Escape') {
                if (showDeleteConfirm) {
                    setShowDeleteConfirm(false);
                } else {
                    handleClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleClose, selectedProduct?.id, showDeleteConfirm]);

    // Calculate product completion score
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

    // Tab Navigation Flow
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

    if (!selectedProduct || !currentEditingProduct) return null;

    const digitalChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'digital-menu') || currentEditingProduct.channels?.[0] || { image: '', displayName: '', description: '' };
    const currentChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === activeChannel);

    return (
        <>
            <div className="fixed inset-0 z-[60] flex justify-end">
                <div className="absolute inset-0 bg-summo-dark/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

                <div className="relative w-full lg:w-[800px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right h-full">
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
                            <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"><X size={24} /></button>
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
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Monitor size={12} /> Identificação</h4>

                                        <ProductBasicInfo
                                            product={currentEditingProduct}
                                            editData={editData}
                                            onUpdate={handleBasicInfoUpdate}
                                            categories={uniqueCategories as string[]}
                                        />

                                        <div className="pt-2">
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

                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Package size={12} /> Imagem Principal</h4>
                                        <div className="flex justify-center">
                                            <div className="w-48">
                                                <select
                                                    value={editData.type || currentEditingProduct.type}
                                                    onChange={(e) => setEditData({ ...editData, type: e.target.value as 'SIMPLE' | 'COMBO' })}
                                                    disabled={!!selectedProduct.id}
                                                    className={`w-full p-3 border rounded-xl outline-none transition appearance-none bg-white ${!!selectedProduct.id ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'focus:ring-2 focus:ring-summo-primary/20'}`}
                                                >
                                                    <option value="SIMPLE">Produto Simples</option>
                                                    <option value="COMBO">Combo de Produtos</option>
                                                </select>
                                                <ProductImageManager
                                                    product={currentEditingProduct}
                                                    currentImage={currentEditingProduct.image || ''}
                                                    onImageChange={handleImageChange}
                                                    productName={currentEditingProduct.name || ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Left Column - Image & Basic Info */}
                                    <div className="space-y-4">
                                        {/* Master Image Upload */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <ImageIcon size={18} /> Foto Principal
                                                <span className="text-xs font-normal text-gray-400 ml-auto">Será usada em todos os canais</span>
                                            </h3>
                                            <div className="relative group w-full aspect-video max-h-[200px] bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-summo-primary hover:bg-summo-primary/5 transition overflow-hidden">
                                                {(editData.image || currentEditingProduct.image) ? (
                                                    <>
                                                        <img src={editData.image || currentEditingProduct.image} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                            <button onClick={() => document.getElementById('master-image-upload')?.click()} className="p-2 bg-white rounded-full text-gray-700 hover:text-summo-primary"><UploadCloud size={20} /></button>
                                                            <button onClick={() => handleImageChange('')} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><Trash2 size={20} /></button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div onClick={() => document.getElementById('master-image-upload')?.click()} className="text-center p-2">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2 group-hover:scale-110 transition"><Camera size={24} /></div>
                                                        <p className="text-sm font-bold text-gray-500">Adicionar Foto</p>
                                                    </div>
                                                )}
                                                <input type="file" id="master-image-upload" className="hidden" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => handleImageChange(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
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
                        <div className="p-4 pb-safe lg:pb-4 flex gap-3">
                            {/* Previous Tab Button */}
                            {canGoPrevious && (
                                <button
                                    onClick={handlePreviousTab}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition active:scale-95 flex items-center gap-2"
                                    title="Aba Anterior"
                                >
                                    ← Anterior
                                </button>
                            )}

                            {/* Delete Button - Always visible now */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition absolute left-6"
                                title={selectedProduct.id ? "Excluir Produto (Ctrl+D)" : "Descartar Rascunho"}
                            >
                                <Trash2 size={20} />
                            </button>

                            {/* Next Tab / Save Button */}
                            {canGoNext ? (
                                <button
                                    onClick={handleNextTab}
                                    className="flex-1 py-3 bg-summo-primary text-white rounded-xl font-bold hover:bg-summo-dark transition active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Próximo →
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-summo-primary text-white rounded-xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Save size={20} /> Salvar <span className="text-xs opacity-70">(Ctrl+S)</span>
                                </button>
                            )}
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
                            <h3 className="text-xl font-bold text-gray-800">Excluir Produto?</h3>
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
        </>
    );
};

export default ProductEditor;
