import React, { useEffect, useState, useMemo } from 'react';
import { Edit3, X, LayoutTemplate, ChefHat, Tag, Wand2, Loader2, Trash2, Plus, Save, Image as ImageIcon, Globe, Monitor, ListPlus, ShoppingCart, Tv, Check, Calculator, AlertTriangle, Sparkles, Search, TrendingDown, TrendingUp, Package, Link2Off, Library, Info, DollarSign, Search as SearchIcon, Layers, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { useMenuEditor } from '../../hooks/useMenuEditor';
import { useData } from '../../../../contexts/DataContext';
import { useApp } from '../../../../contexts/AppContext';
import { useAuth } from '../../../auth/context/AuthContext';
import OptionGroupManager from './OptionGroupManager';
import { generateProductImage } from '../../../../services/geminiService';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../../../lib/utils';
import { Product, Ingredient, OptionGroup, ChannelConfig } from '../../../../types';
import { storageService } from '../../../../lib/firebase/storageService';
import ErrorBoundary from '../../../../components/ui/ErrorBoundary';
import { slugify } from '../../../../lib/seoUtils';
import { isReservedSlug } from '../../../../lib/reservedSlugs';

// Declare custom window property
declare global {
    interface Window {
        compressImage: (file: File, quality: number) => Promise<{ mimeType: string, base64: string }>;
    }
}

interface ProductEditorProps {
    logic: ReturnType<typeof useMenuEditor>;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ logic }) => {
    const {
        selectedProduct, editData, setEditData, currentEditingProduct, handleClose, activeTab, setActiveTab,
        handleGenerateCopy, isGeneratingCopy, handleSave, handleTagToggle,
        addIngredientToRecipe, removeIngredient, updateIngredientAmount, updateRecipeYield,
        handleChannelDataChange, activeChannel, setActiveChannel,
        linkOptionGroup, unlinkOptionGroup, handleDelete,
        linkRecipe, unlinkRecipe
    } = logic;

    const { ingredients, optionGroups, products, recipes } = useData();
    const { settings, showToast } = useApp();
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || 'global';
    const [isOptionManagerOpen, setIsOptionManagerOpen] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uniqueCategories = useMemo(() =>
        Array.from(new Set(products.map((p: Product) => p.category))),
        [products]);



    // Auto-Slug Effect: Strictly enforce slug mirrors name
    useEffect(() => {
        const nameToSlug = editData.name || selectedProduct?.name || '';
        if (nameToSlug) {
            const newSlug = slugify(nameToSlug);
            // Verify if slug actually changed to avoid infinite loops
            if (editData.slug !== newSlug) {
                setEditData(prev => ({ ...prev, slug: newSlug }));
            }
        }
    }, [editData.name, selectedProduct?.name, editData.slug, setEditData]);

    // FIX: Hooks must be called before any early returns
    const linkedGroups = useMemo(() =>
        (currentEditingProduct?.optionGroupIds || [])
            .map((id: string) => optionGroups.find((g: OptionGroup) => g.id === id))
            .filter(Boolean),
        [currentEditingProduct?.optionGroupIds, optionGroups]);

    // FIX: Hooks must be called before any early returns
    const currentSlug = editData.slug ?? selectedProduct?.slug ?? '';
    const slugError = useMemo(() => {
        if (!currentSlug || !selectedProduct) return null;
        if (isReservedSlug(currentSlug)) return "Este termo é reservado pelo sistema.";
        const duplicate = products.find((p: Product) => p.slug === currentSlug && p.id !== (selectedProduct.id || editData.id));
        if (duplicate) return `Este link já está em uso pelo produto "${duplicate.name}".`;
        return null;
    }, [currentSlug, products, selectedProduct?.id, editData.id]);

    useEffect(() => {
        if (selectedProduct) {
            const categoryExists = uniqueCategories.includes(selectedProduct.category || '');
            setIsCreatingCategory(!categoryExists);
        }
    }, [selectedProduct, uniqueCategories]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                handleClose();
            }
        };
        if (selectedProduct) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedProduct, handleClose]);

    const handleCancelNewCategory = () => {
        setIsCreatingCategory(false);
        setEditData((prev: Partial<Product>) => ({ ...prev, category: selectedProduct?.category }));
    };

    // ✅ FIX: Early returns BEFORE any conditional logic/calculations
    if (!selectedProduct || !currentEditingProduct) return null;

    const currentChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === activeChannel);
    const digitalChannelData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'digital-menu') || currentEditingProduct.channels?.[0] || { image: '', displayName: '', description: '' };

    if (!currentChannelData) return null;

    // ✅ NOW all calculations are AFTER early returns - no hook order issues
    const { integrations, financial } = settings;
    const ifoodSettings = integrations?.ifood;
    const packagingAvgCost = financial?.packagingAvgCost || 0;
    const { realCost: costInsumos } = currentEditingProduct;
    const currentPrice = currentChannelData.price || 0;
    const promotionalPrice = currentChannelData.promotionalPrice || 0;
    const effectivePrice = (promotionalPrice > 0 && promotionalPrice < currentPrice) ? promotionalPrice : currentPrice;
    const feesPercent = activeChannel === 'ifood' ? ((ifoodSettings?.commissionRate || 0) + (ifoodSettings?.financialFee || 0)) : 0;

    const cmvPercent = effectivePrice > 0 ? (costInsumos / effectivePrice) * 100 : 0;
    const costTaxes = effectivePrice * ((financial?.taxRate || 0) / 100);
    const costFixed = effectivePrice * ((financial?.fixedCostRate || 0) / 100);
    const costFees = effectivePrice * (feesPercent / 100);
    const costProfit = effectivePrice - costInsumos - packagingAvgCost - costTaxes - costFixed - costFees;

    const pieData = [
        { name: 'Insumos', value: costInsumos, color: '#f59e0b' },
        { name: 'Embalagem', value: packagingAvgCost, color: '#64748b' },
        { name: 'Impostos/Fixo', value: costTaxes + costFixed, color: '#ef4444' },
        { name: 'Taxas Canal', value: costFees, color: '#f43f5e' },
        { name: 'Lucro Real', value: Math.max(0, costProfit), color: '#22c55e' },
    ].filter(d => d.value > 0);

    // ✅ Scenario Analysis - now safely AFTER early returns
    const comboItems = editData.comboItems || selectedProduct.comboItems || [];
    const comboSteps = editData.comboSteps || selectedProduct.comboSteps || [];

    let bestCaseProfit = 0, avgCaseProfit = 0, worstCaseProfit = 0;

    if (editData.type === 'COMBO') {
        const fixedCost = comboItems.reduce((acc: number, item: any) => {
            const p = (products || []).find((pr: Product) => pr.id === item.productId);
            return acc + (item.quantity * (p?.cost || 0));
        }, 0);

        let bestStepCost = 0, avgStepCost = 0, worstStepCost = 0;

        comboSteps.forEach((step: any) => {
            if (!step.items || step.items.length === 0) return;
            const costs = step.items.map((i: any) => i.overridePrice || 0);
            const minCost = Math.min(...costs);
            const maxCost = Math.max(...costs);
            const avgCost = costs.reduce((a: number, b: number) => a + b, 0) / costs.length;

            bestStepCost += step.min * minCost;
            avgStepCost += step.min * avgCost;
            worstStepCost += step.min * maxCost;
        });

        const comboPrice = currentEditingProduct.channels?.find((c: any) => c.channel === 'pos')?.price || 0;

        bestCaseProfit = comboPrice - (fixedCost + bestStepCost);
        avgCaseProfit = comboPrice - (fixedCost + avgStepCost);
        worstCaseProfit = comboPrice - (fixedCost + worstStepCost);
    }

    const calculateIdealPrice = (targetMargin: number, channelFees: number) => {
        const totalCost = costInsumos + packagingAvgCost;
        const denominator = 1 - (((financial?.fixedCostRate || 0) + (financial?.taxRate || 0) + channelFees + targetMargin) / 100);
        return denominator > 0 ? totalCost / denominator : 0;
    };

    const suggestedPOSPrice = calculateIdealPrice(20, 0);
    const suggestedIfoodPrice = calculateIdealPrice(20, (ifoodSettings?.commissionRate || 0) + (ifoodSettings?.financialFee || 0));

    const handleNameChange = (val: string) => {
        setEditData((prev: Partial<Product>) => {
            const newData = { ...prev, name: val };
            if (prev.channels) {
                const updatedChannels = prev.channels.map((c: ChannelConfig) => ({ ...c, displayName: val }));
                newData.channels = updatedChannels;
            }
            return newData;
        });
    };

    const handlePriceInput = (field: 'price' | 'promotionalPrice', val: string) => {
        handleChannelDataChange(field, val === '' ? null : parseFloat(val));
    };




    const handleAutoSlug = () => {
        const nameToSlug = editData.name || selectedProduct.name || '';
        if (!nameToSlug) {
            showToast("Preencha o nome do produto primeiro.", "error");
            return;
        }

        let newSlug = slugify(nameToSlug);
        let uniqueSlug = newSlug;
        let counter = 1;

        const isSlugTaken = (s: string) => {
            if (isReservedSlug(s)) return true;
            return products.some((p: Product) => p.slug === s && p.id !== (selectedProduct.id || editData.id));
        };

        while (isSlugTaken(uniqueSlug)) {
            uniqueSlug = `${newSlug}-${counter}`;
            counter++;
        }

        setEditData((prev: Partial<Product>) => ({ ...prev, slug: uniqueSlug }));
        showToast("Link amigável gerado!", "success");
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex justify-end">
                <div className="absolute inset-0 bg-summo-dark/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

                <div className="relative w-full lg:w-[800px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right h-full">
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-summo-bg flex items-center justify-center text-summo-primary flex-shrink-0 relative overflow-hidden">
                                {digitalChannelData.image ? <img src={digitalChannelData.image} className="w-full h-full object-cover" /> : <Package size={20} />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-800 leading-none truncate">{editData.name || selectedProduct.name || "Novo Produto"}</h2>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${currentEditingProduct.type === 'COMBO' ? 'bg-purple-100 text-purple-700' : 'bg-summo-bg text-summo-primary'}`}>
                                        {currentEditingProduct.type === 'COMBO' ? 'Combo' : 'Simples'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">{selectedProduct.id ? "Editando Produto" : "Criando Novo Produto"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition select-none ${currentChannelData.isAvailable ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}>
                                <div className={`w-2 h-2 rounded-full ${currentChannelData.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className={`text-xs font-bold uppercase ${currentChannelData.isAvailable ? 'text-green-700' : 'text-red-700'}`}>{currentChannelData.isAvailable ? 'Ativo' : 'Pausado'}</span>
                                <input type="checkbox" className="hidden" checked={currentChannelData.isAvailable || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelDataChange('isAvailable', e.target.checked)} />
                            </label>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"><X size={24} /></button>
                        </div>
                    </div>

                    <div className="px-6 border-b border-gray-100 flex gap-6 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('GENERAL')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'GENERAL' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><LayoutTemplate size={16} className="inline mr-2 mb-0.5" /> Cadastro Básico</button>
                        <button onClick={() => setActiveTab('OPTIONS')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'OPTIONS' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><ListPlus size={16} className="inline mr-2 mb-0.5" /> Complementos</button>
                        <button onClick={() => setActiveTab('ENGINEERING')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'ENGINEERING' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Calculator size={16} className="inline mr-2 mb-0.5" /> Engenharia & Lucro</button>
                        <button onClick={() => setActiveTab('SEO')} className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'SEO' ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Globe size={16} className="inline mr-2 mb-0.5" /> SEO & Marketing</button>

                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 pb-24">
                        <ErrorBoundary scope={activeTab}>
                            {activeTab === 'GENERAL' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Monitor size={12} /> Identificação</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Removed Type Selector - Fixed at creation */}

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Interno</label>
                                                <input type="text" value={editData.name ?? selectedProduct.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800" placeholder="Ex: X-Salada" autoFocus />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria</label>
                                                <div className="flex items-center gap-2">
                                                    {isCreatingCategory ? (
                                                        <><input type="text" value={editData.category ?? selectedProduct.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData((prev: Partial<Product>) => ({ ...prev, category: e.target.value }))} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-gray-800" placeholder="Nova Categoria" autoFocus /><button type="button" onClick={handleCancelNewCategory} className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"><X size={18} /></button></>
                                                    ) : (
                                                        <><select value={editData.category ?? selectedProduct.category ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditData({ ...editData, category: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-gray-800 font-bold">
                                                            <option value="" disabled>-- Selecione --</option>
                                                            {uniqueCategories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select><button type="button" onClick={() => { setIsCreatingCategory(true); setEditData({ ...editData, category: '' }); }} className="p-3 bg-summo-bg text-summo-primary rounded-xl border border-summo-primary/20 hover:bg-summo-primary hover:text-white transition shadow-sm" title="Criar Nova Categoria"><Plus size={18} /></button></>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Etiquetas (Tags)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Promoção', 'Novo', 'Vegano', 'Mais Vendido', 'Sem Glúten', 'Sem Lactose'].map((tag: string) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleTagToggle(tag)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition flex items-center gap-1 ${(currentEditingProduct?.tags || []).includes(tag) ? 'bg-summo-bg text-summo-primary border-summo-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                                    >
                                                        {tag} {(currentEditingProduct?.tags || []).includes(tag) && <Check size={12} strokeWidth={3} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 bg-blue-50 text-blue-600 rounded-bl-xl text-xs font-bold flex items-center gap-1 border-b border-l border-blue-100"><Globe size={12} /> Loja Online</div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                                <Globe size={12} /> Overrides da Vitrine (Opcional)
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Diferente no Cardápio?</label>
                                            <input
                                                type="text"
                                                value={digitalChannelData.displayName === (editData.name ?? selectedProduct.name) ? '' : digitalChannelData.displayName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelDataChange('displayName', e.target.value || (editData.name ?? selectedProduct.name), 'digital-menu')}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm text-gray-700"
                                                placeholder={`Deixe vazio para usar: ${editData.name ?? selectedProduct.name}`}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria na Loja (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={digitalChannelData.category || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelDataChange('category', e.target.value, 'digital-menu')}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm text-gray-700"
                                                    placeholder="Ex: Ofertas do Dia (Vazio = Use Geral)"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ordem (Prioridade)</label>
                                                <input
                                                    type="number"
                                                    value={digitalChannelData.sortOrder ?? ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChannelDataChange('sortOrder', e.target.value === '' ? undefined : parseInt(e.target.value), 'digital-menu')}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm text-gray-700"
                                                    placeholder="Ex: 1 (Menor primeiro)"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col-reverse md:flex-row gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block">Descrição na Vitrine</label>
                                                    <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} className="flex items-center gap-1 text-[10px] text-summo-primary font-bold hover:bg-summo-bg px-2 py-0.5 rounded-lg transition">
                                                        {isGeneratingCopy ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />} Criar texto com IA
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={digitalChannelData.description || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChannelDataChange('description', e.target.value, 'digital-menu')}
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl h-28 text-sm focus:ring-2 focus:ring-summo-primary outline-none resize-none"
                                                    placeholder="Se vazio, usará a descrição geral do produto."
                                                />
                                            </div>
                                            <div className="w-full md:w-32 flex flex-col gap-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Foto (Override)</label>
                                                <div
                                                    className="relative group"
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={async (e) => {
                                                        e.preventDefault();
                                                        setIsDragging(false);

                                                        if (!selectedProduct.id && !editData.id) {
                                                            return alert("Salve o produto primeiro para habilitar o upload de imagem.");
                                                        }

                                                        let fileToUpload: File | Blob | null = null;

                                                        // 1. Files
                                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                            fileToUpload = e.dataTransfer.files[0];
                                                        }
                                                        // 2. URLs (Drag from Google)
                                                        else {
                                                            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                                                            if (url && url.startsWith('http')) {
                                                                setIsUploadingImage(true);
                                                                try {
                                                                    const res = await fetch(url);
                                                                    fileToUpload = await res.blob();
                                                                } catch (err) {
                                                                    console.error("Link directo bloqueado por CORS", err);
                                                                    showToast("Link direto bloqueado. Tente baixar e arrastar o arquivo.", "error");
                                                                }
                                                            }
                                                        }

                                                        if (fileToUpload) {
                                                            setIsUploadingImage(true);
                                                            try {
                                                                const url = await storageService.uploadProductImage(fileToUpload, tenantId, selectedProduct.id || editData.id || 'new-product');
                                                                setEditData((prev: Partial<Product>) => {
                                                                    const existingChannels = prev.channels || selectedProduct.channels || [];
                                                                    const updatedChannels = existingChannels.map((c: ChannelConfig) => {
                                                                        if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) return { ...c, image: url };
                                                                        return c;
                                                                    });
                                                                    return { ...prev, image: url, channels: updatedChannels };
                                                                });
                                                            } catch (err) {
                                                                alert("Erro ao processar imagem.");
                                                            } finally {
                                                                setIsUploadingImage(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <label className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden ${isDragging ? 'border-summo-primary bg-summo-bg scale-105 shadow-xl' : 'hover:bg-gray-50'}`}>
                                                        {isUploadingImage ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Loader2 size={24} className="animate-spin text-summo-primary" />
                                                                <span className="text-[10px] font-bold text-gray-400">Enviando...</span>
                                                            </div>
                                                        ) : digitalChannelData.image ? (
                                                            <div className="w-full h-full relative group/img overflow-hidden bg-gray-50">
                                                                {/* Blurred Smart-Fit background */}
                                                                <img
                                                                    src={digitalChannelData.image}
                                                                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-125"
                                                                    aria-hidden="true"
                                                                />
                                                                {/* Actual image contained */}
                                                                <img
                                                                    src={digitalChannelData.image}
                                                                    className="relative w-full h-full object-contain z-10"
                                                                />

                                                                {/* Removal Overlay */}
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (window.confirm("Remover esta imagem?")) {
                                                                                setEditData((prev: Partial<Product>) => {
                                                                                    const existingChannels = prev.channels || selectedProduct.channels || [];
                                                                                    const updatedChannels = existingChannels.map((c: ChannelConfig) => {
                                                                                        if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) return { ...c, image: '' };
                                                                                        return c;
                                                                                    });
                                                                                    return { ...prev, image: '', channels: updatedChannels };
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition transform hover:scale-110 shadow-xl"
                                                                        title="Excluir Imagem"
                                                                    >
                                                                        <Trash2 size={20} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <ImageIcon size={24} className="text-gray-300" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            disabled={isUploadingImage}
                                                            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && (selectedProduct.id || editData.id)) {
                                                                    if (file.size > 5 * 1024 * 1024) { alert("Arquivo muito grande. Máximo 5MB."); return; }
                                                                    setIsUploadingImage(true);
                                                                    try {
                                                                        let uploadSource: File | Blob = file;
                                                                        if ((window as any).compressImage) {
                                                                            try {
                                                                                const compressed = await (window as any).compressImage(file, 800);
                                                                                if (compressed) {
                                                                                    const res = await fetch(`data:${compressed.mimeType};base64,${compressed.base64}`);
                                                                                    uploadSource = await res.blob();
                                                                                }
                                                                            } catch (e) { }
                                                                        }
                                                                        const url = await storageService.uploadProductImage(uploadSource, tenantId, selectedProduct.id || editData.id || 'new-product');
                                                                        setEditData((prev: Partial<Product>) => {
                                                                            const existingChannels = prev.channels || selectedProduct.channels || [];
                                                                            const updatedChannels = existingChannels.map((c: ChannelConfig) => {
                                                                                if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) return { ...c, image: url };
                                                                                return c;
                                                                            });
                                                                            return { ...prev, image: url, channels: updatedChannels };
                                                                        });
                                                                    } catch (err) { alert("Erro ao enviar imagem."); } finally { setIsUploadingImage(false); }
                                                                } else if (file) { alert("Salve o produto primeiro para habilitar o upload de imagem."); }
                                                            }}
                                                        />
                                                        {isDragging && (
                                                            <div className="absolute inset-0 bg-summo-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                                                                <Plus size={32} className="text-summo-primary animate-bounce" />
                                                            </div>
                                                        )}
                                                    </label>
                                                    {digitalChannelData.image && !isUploadingImage && (
                                                        <button onClick={() => handleChannelDataChange('image', '', 'digital-menu')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={10} /></button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!selectedProduct.id && !editData.id) {
                                                            return alert("Salve o produto primeiro para usar a IA de imagem.");
                                                        }
                                                        setIsGeneratingImage(true);
                                                        try {
                                                            const imgBase64 = await generateProductImage(editData.name || selectedProduct.name);
                                                            if (imgBase64) {
                                                                // For AI images, we also upload to storage instead of keeping base64
                                                                const res = await fetch(imgBase64);
                                                                const blob = await res.blob();
                                                                const url = await storageService.uploadProductImage(blob, tenantId, selectedProduct.id || 'new-product', 'ai-generated');

                                                                // Sync AI image across all fields too (Atomic Update)
                                                                setEditData((prev: Partial<Product>) => {
                                                                    const existingChannels = prev.channels || selectedProduct.channels || [];
                                                                    const updatedChannels = existingChannels.map((c: ChannelConfig) => {
                                                                        if (['pos', 'digital-menu', 'ifood'].includes(c.channel)) {
                                                                            return { ...c, image: url };
                                                                        }
                                                                        return c;
                                                                    });

                                                                    return {
                                                                        ...prev,
                                                                        image: url,
                                                                        channels: updatedChannels
                                                                    };
                                                                });
                                                            }
                                                        } catch (e) {
                                                            alert("Erro na IA");
                                                        } finally {
                                                            setIsGeneratingImage(false);
                                                        }
                                                    }}
                                                    disabled={isGeneratingImage || isUploadingImage}
                                                    className="w-full bg-summo-bg text-summo-primary py-2 rounded-lg text-xs font-bold border border-summo-primary/20 flex items-center justify-center gap-1"
                                                >
                                                    {isGeneratingImage ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Foto IA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {activeTab === 'OPTIONS' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">Grupos Vinculados</h3>
                                            <button onClick={() => setIsOptionManagerOpen(true)} className="bg-summo-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-summo-dark transition text-sm flex items-center gap-2"><Library size={16} /> Gerenciar Biblioteca</button>
                                        </div>
                                        {linkedGroups.length === 0 ? <p className="text-center py-8 text-gray-400">Nenhum grupo de complemento vinculado.</p> :
                                            <div className="space-y-3">{linkedGroups.map((group: OptionGroup | undefined) => (group ? <div key={group.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center"><div><p className="font-bold text-gray-700">{group.title}</p><p className="text-xs text-gray-500">{group.options.length} opções</p></div><button onClick={() => unlinkOptionGroup(group.id)} className="text-red-400 hover:text-red-600 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"><Link2Off size={16} /></button></div> : null))}</div>
                                        }
                                    </div>
                                </div>
                            )}


                            {activeTab === 'ENGINEERING' && (
                                <div className="space-y-6 animate-fade-in pb-10">
                                    {editData.type === 'COMBO' ? (
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Layers size={14} /> Itens Fixos (Obrigatórios)</h4>
                                                <div className="group relative">
                                                    <Info size={14} className="text-gray-300 cursor-help" />
                                                    <div className="absolute right-0 w-64 p-2 bg-gray-800 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition z-10 top-6">
                                                        Itens que o cliente NÃO escolhe, eles vêm sempre no combo (Ex: 1 Coca-Cola Lata).
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Adicionar Produto Fixo</label>
                                                <select
                                                    onChange={(e) => {
                                                        const pid = e.target.value;
                                                        if (!pid) return;
                                                        setEditData((prev: Partial<Product>) => {
                                                            const currentItems = prev.comboItems || selectedProduct.comboItems || [];
                                                            if (currentItems.some((i: any) => i.productId === pid)) return prev;
                                                            return {
                                                                ...prev,
                                                                comboItems: [...currentItems, { productId: pid, quantity: 1 }]
                                                            };
                                                        });
                                                    }}
                                                    className="w-full p-2 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-summo-primary outline-none text-gray-700"
                                                    value=""
                                                >
                                                    <option value="">+ Selecionar Item Fixo</option>
                                                    {(products || []).filter((p: Product) => p.id !== (selectedProduct.id || editData.id)).map((p: Product) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {(editData.comboItems || selectedProduct.comboItems || []).length === 0 && (
                                                    <p className="text-xs text-gray-400 text-center py-2 italic">Nenhum item fixo adicionado.</p>
                                                )}
                                                {(editData.comboItems || selectedProduct.comboItems || []).map((item: any, idx: number) => {
                                                    const prod = (products || []).find((p: Product) => p.id === item.productId);
                                                    if (!prod) return null;

                                                    const updateQty = (q: number) => {
                                                        setEditData((prev: Partial<Product>) => {
                                                            const items = [...(prev.comboItems || selectedProduct.comboItems || [])];
                                                            items[idx] = { ...items[idx], quantity: q };
                                                            return { ...prev, comboItems: items };
                                                        });
                                                    };

                                                    const removeItem = () => {
                                                        setEditData((prev: Partial<Product>) => {
                                                            const items = (prev.comboItems || selectedProduct.comboItems || []).filter((_: any, i: number) => i !== idx);
                                                            return { ...prev, comboItems: items };
                                                        });
                                                    };

                                                    return (
                                                        <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                                            <span className="font-bold text-gray-700 flex-1">{prod.name}</span>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                                    <button onClick={() => updateQty(Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-summo-primary font-bold">-</button>
                                                                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                                                                    <button onClick={() => updateQty(item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-summo-primary font-bold">+</button>
                                                                </div>
                                                                <button onClick={removeItem} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* COMBO STEPS SECTION */}
                                            <div className="mt-8 pt-6 border-t font-sans">
                                                <div className="flex justify-between items-end mb-6">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><ListPlus size={18} className="text-summo-primary" /> Etapas de Escolha</h4>
                                                        <p className="text-[10px] text-gray-400 mt-1">Ex: "Escolha sua Bebida", "Escolha 3 Espetos"</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditData(prev => ({
                                                            ...prev,
                                                            comboSteps: [...(prev.comboSteps || selectedProduct.comboSteps || []), { name: '', min: 1, max: 1, items: [] }]
                                                        }))}
                                                        className="px-4 py-2 bg-summo-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-summo-primary/20 hover:bg-summo-dark transition flex items-center gap-2"
                                                    >
                                                        <Plus size={14} /> Nova Etapa
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    {(editData.comboSteps || selectedProduct.comboSteps || []).length === 0 && (
                                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                            <p className="text-sm text-gray-500 font-medium">Nenhuma etapa de escolha configurada.</p>
                                                            <p className="text-xs text-gray-400 mt-1">Adicione etapas para que o cliente personalize o combo.</p>
                                                        </div>
                                                    )}

                                                    {(editData.comboSteps || selectedProduct.comboSteps || []).map((step: any, stepIdx: number) => (
                                                        <div key={stepIdx} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden group">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-summo-primary/20 group-hover:bg-summo-primary transition-colors"></div>
                                                            <div className="flex justify-between items-start mb-4 pl-3">
                                                                <div className="flex-1 mr-4">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Título da Etapa (Visível ao Cliente)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={step.name}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                            newSteps[stepIdx] = { ...newSteps[stepIdx], name: e.target.value };
                                                                            setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                        }}
                                                                        className="w-full text-base font-bold text-gray-800 placeholder-gray-300 border-b border-gray-100 focus:border-summo-primary outline-none py-1 bg-transparent transition"
                                                                        placeholder="Ex: Escolha os Sabores"
                                                                    />
                                                                </div>
                                                                <button onClick={() => {
                                                                    const newSteps = (editData.comboSteps || selectedProduct.comboSteps || []).filter((_: any, i: number) => i !== stepIdx);
                                                                    setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                }} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                                            </div>

                                                            <div className="flex gap-4 mb-6 pl-3">
                                                                <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                                    <p className="text-xs font-bold text-gray-500 mb-2">Quantos itens o cliente escolhe?</p>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] uppercase font-bold text-gray-400">Mínimo:</span>
                                                                            <input type="number" min="0" value={step.min} onChange={(e) => {
                                                                                const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                                newSteps[stepIdx] = { ...newSteps[stepIdx], min: parseInt(e.target.value) };
                                                                                setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                            }} className="w-12 text-center font-bold bg-white border border-gray-200 rounded p-1" />
                                                                        </div>
                                                                        <div className="h-4 w-px bg-gray-300"></div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] uppercase font-bold text-gray-400">Máximo:</span>
                                                                            <input type="number" min="1" value={step.max} onChange={(e) => {
                                                                                const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                                newSteps[stepIdx] = { ...newSteps[stepIdx], max: parseInt(e.target.value) };
                                                                                setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                            }} className="w-12 text-center font-bold bg-white border border-gray-200 rounded p-1" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="pl-3">
                                                                <div className="mb-3">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Produtos Disponíveis nesta Etapa</label>
                                                                    <select
                                                                        onChange={(e) => {
                                                                            const pid = e.target.value;
                                                                            if (!pid) return;
                                                                            const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                            if (!newSteps[stepIdx].items.some((i: any) => i.productId === pid)) {
                                                                                // Default override price to the product's cost for better initial data, or 0 if user wants to set it manually
                                                                                const prod = (products || []).find(p => p.id === pid);
                                                                                newSteps[stepIdx].items.push({ productId: pid, overridePrice: prod?.cost || 0 });
                                                                                setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                            }
                                                                            e.target.value = "";
                                                                        }}
                                                                        className="w-full p-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                                                    >
                                                                        <option value="">+ Adicionar Opção à Lista</option>
                                                                        {(products || []).filter((p: Product) => p.id !== (selectedProduct.id || editData.id)).map((p: Product) => (
                                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(step.items || []).map((item: any, itemIdx: number) => {
                                                                        const prod = (products || []).find((p: Product) => p.id === item.productId);
                                                                        if (!prod) return null;
                                                                        return (
                                                                            <div key={itemIdx} className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition group/item">
                                                                                <span className="flex-1 font-bold text-gray-700">{prod.name}</span>
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className="text-[9px] text-gray-400 uppercase font-bold">Custo Interno</span>
                                                                                        <div className="relative">
                                                                                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                                                                            <input
                                                                                                type="number"
                                                                                                value={item.overridePrice ?? ''}
                                                                                                onChange={(e) => {
                                                                                                    const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                                                    newSteps[stepIdx].items[itemIdx].overridePrice = parseFloat(e.target.value);
                                                                                                    setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                                                }}
                                                                                                className="w-20 py-1 pl-6 pr-1 text-right text-gray-700 font-bold bg-white border border-gray-200 rounded focus:border-summo-primary outline-none"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <button onClick={() => {
                                                                                        const newSteps = [...(editData.comboSteps || selectedProduct.comboSteps || [])];
                                                                                        newSteps[stepIdx].items = newSteps[stepIdx].items.filter((_: any, i: number) => i !== itemIdx);
                                                                                        setEditData(prev => ({ ...prev, comboSteps: newSteps }));
                                                                                    }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition"><Trash2 size={16} /></button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-900 rounded-xl shadow-lg">
                                                    <div className="flex items-center gap-3 text-white mb-1">
                                                        <DollarSign size={20} className="text-yellow-400" />
                                                        <div>
                                                            <p className="text-xs font-bold uppercase text-gray-400">Custo Base (Interno)</p>
                                                            <p className="text-[10px] text-gray-500">Soma dos Custos dos Itens</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xl font-black text-white">
                                                        {formatCurrency(
                                                            // Fixed Items Cost
                                                            (editData.comboItems || selectedProduct.comboItems || []).reduce((acc: number, item: any) => {
                                                                const p = (products || []).find((pr: Product) => pr.id === item.productId);
                                                                return acc + (item.quantity * (p?.cost || 0));
                                                            }, 0) +
                                                            // Steps Avg Cost (Min quantity * Avg Item Cost)
                                                            (editData.comboSteps || selectedProduct.comboSteps || []).reduce((acc: number, step: any) => {
                                                                if (!step.items || step.items.length === 0) return acc;
                                                                const avgCost = step.items.reduce((sAcc: number, sItem: any) => {
                                                                    return sAcc + (sItem.overridePrice || 0); // Using internal cost override
                                                                }, 0) / step.items.length;
                                                                return acc + (step.min * avgCost);
                                                            }, 0)
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm relative group cursor-pointer hover:bg-blue-100 transition"
                                                    onClick={() => {
                                                        const calculatedOriginal = (editData.comboItems || selectedProduct.comboItems || []).reduce((acc: number, item: any) => {
                                                            const p = (products || []).find((pr: Product) => pr.id === item.productId);
                                                            const pPrice = p?.channels?.find((c: any) => c.channel === 'pos')?.price || 0;
                                                            return acc + (item.quantity * pPrice);
                                                        }, 0) +
                                                            (editData.comboSteps || selectedProduct.comboSteps || []).reduce((acc: number, step: any) => {
                                                                if (!step.items || step.items.length === 0) return acc;
                                                                const avgPrice = step.items.reduce((sAcc: number, sItem: any) => {
                                                                    const p = (products || []).find((pr: Product) => pr.id === sItem.productId);
                                                                    const pPrice = p?.channels?.find((c: any) => c.channel === 'pos')?.price || 0;
                                                                    return sAcc + pPrice;
                                                                }, 0) / step.items.length;
                                                                return acc + (step.min * avgPrice);
                                                            }, 0);

                                                        handlePriceInput('price', calculatedOriginal.toString());
                                                        showToast("Preço Original aplicado ao canal POS!", "success");
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 text-blue-900 mb-1">
                                                        <Tag size={20} className="text-blue-500" />
                                                        <div>
                                                            <p className="text-xs font-bold uppercase text-blue-400">Valor Original (Soma)</p>
                                                            <p className="text-[10px] text-blue-300"> Clique para aplicar</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xl font-black text-blue-900">
                                                        {formatCurrency(
                                                            // Fixed Items Sales Price
                                                            (editData.comboItems || selectedProduct.comboItems || []).reduce((acc: number, item: any) => {
                                                                const p = (products || []).find((pr: Product) => pr.id === item.productId);
                                                                const pPrice = p?.channels?.find((c: any) => c.channel === 'pos')?.price || 0;
                                                                return acc + (item.quantity * pPrice);
                                                            }, 0) +
                                                            // Steps Avg Sales Price
                                                            (editData.comboSteps || selectedProduct.comboSteps || []).reduce((acc: number, step: any) => {
                                                                if (!step.items || step.items.length === 0) return acc;
                                                                const avgPrice = step.items.reduce((sAcc: number, sItem: any) => {
                                                                    const p = (products || []).find((pr: Product) => pr.id === sItem.productId);
                                                                    const pPrice = p?.channels?.find((c: any) => c.channel === 'pos')?.price || 0;
                                                                    return sAcc + pPrice;
                                                                }, 0) / step.items.length;
                                                                return acc + (step.min * avgPrice);
                                                            }, 0)
                                                        )}
                                                    </span>
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-blue-500">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><ChefHat size={14} /> Ficha Técnica Vinculada</h4>
                                                {!currentEditingProduct.recipe?.id && (
                                                    <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-bold border border-red-100 flex items-center gap-1"><AlertTriangle size={10} /> Não Vinculado</span>
                                                )}
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 relative">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Selecionar Receita Existente</label>
                                                    <select
                                                        value={currentEditingProduct.recipe?.id || ''}
                                                        onChange={(e) => linkRecipe(e.target.value)}
                                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold text-gray-700"
                                                    >
                                                        <option value="">-- Vincular Receita --</option>
                                                        {recipes.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {currentEditingProduct.recipe?.id && (
                                                    <div className="flex items-end gap-2">
                                                        <button
                                                            onClick={unlinkRecipe}
                                                            className="p-3 bg-white border border-gray-200 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition shadow-sm"
                                                            title="Desvincular"
                                                        >
                                                            <Link2Off size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Removed Packaging Hint as per user request */}
                                            {currentEditingProduct.recipe?.ingredients && currentEditingProduct.recipe.ingredients.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <p className="text-xs font-bold text-gray-500 uppercase">Resumo da Composição</p>
                                                        <p className="text-[10px] text-gray-400">Rendimento: {currentEditingProduct.recipe.yield} {currentEditingProduct.recipe.yieldUnit}</p>
                                                    </div>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                        {currentEditingProduct.recipe.ingredients.map((item: any, idx: number) => {
                                                            const ing = ingredients.find(i => i.id === item.ingredientId);
                                                            const subRec = recipes.find(r => r.id === item.ingredientId);
                                                            const costPerUnit = ing ? (ing.costPerUnit || ing.cost || 0) : ((subRec?.totalCost || 0) / (subRec?.yield || 1));
                                                            const isLinked = !!currentEditingProduct.recipe?.id;

                                                            return (
                                                                <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded-lg group border border-transparent transition ${isLinked ? 'bg-gray-50 opacity-90' : 'bg-gray-50 hover:bg-white hover:border-gray-200'}`}>
                                                                    <span className="font-medium text-gray-700 flex-1">{ing?.name || subRec?.name || 'Item'}</span>
                                                                    {isLinked ? (
                                                                        <span className="font-bold text-gray-600 px-3">{item.quantity} {item.unit}</span>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                value={item.quantity}
                                                                                onChange={(e) => updateIngredientAmount(idx, parseFloat(e.target.value))}
                                                                                className="w-16 p-1 border rounded text-center"
                                                                            />
                                                                            <span className="text-gray-500">{item.unit}</span>
                                                                            <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                                        </div>
                                                                    )}
                                                                    <span className="font-bold text-gray-600 w-24 text-right">R$ {(item.quantity * costPerUnit).toFixed(2)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-4 flex justify-between items-center p-3 bg-summo-bg rounded-xl border border-summo-primary/10">
                                                        <div className="flex items-center gap-2 text-summo-primary">
                                                            <DollarSign size={16} />
                                                            <span className="text-xs font-bold uppercase">Custo Unitário (Insumos)</span>
                                                        </div>
                                                        <span className="text-lg font-black text-summo-primary">{formatCurrency(costInsumos)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Calculator size={14} /> Raio-X do Preço</h4>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="h-64 flex-1">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                            {pieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                        </Pie>
                                                        <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                                                        <Legend verticalAlign="middle" align="right" layout="vertical" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center space-y-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                                                    <p className="text-xs font-bold text-slate-500 uppercase">Preço Efetivo</p>
                                                    <p className="text-sm font-bold text-slate-800">R$ {effectivePrice.toFixed(2)}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp size={14} className={cmvPercent <= 35 ? 'text-green-500' : 'text-red-500'} />
                                                        <p className="text-xs font-bold text-slate-500 uppercase">CMV %</p>
                                                    </div>
                                                    <p className={`text-sm font-bold ${cmvPercent <= 35 ? 'text-green-600' : 'text-red-600'}`}>{cmvPercent.toFixed(1)}%</p>
                                                </div>
                                                <div className={`p-4 rounded-xl border flex justify-between items-center ${costProfit > 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase">Lucro Líquido</p>
                                                        <p className="text-xl font-black">R$ {costProfit.toFixed(2)}</p>
                                                    </div>
                                                    <span className="text-2xl font-bold">{effectivePrice > 0 ? ((costProfit / effectivePrice) * 100).toFixed(0) : 0}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-summo-primary uppercase flex items-center gap-2"><Globe size={14} /> Precificação por Canal</h4>
                                        <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeChannel === 'pos' ? 'bg-summo-bg border-summo-primary' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`} onClick={() => setActiveChannel('pos')}>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2 font-bold text-gray-800"><ShoppingCart size={18} /> Balcão (POS)</div>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Ideal: R$ {suggestedPOSPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Preço Original</label>
                                                    <input type="number" value={currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'pos')?.price || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceInput('price', e.target.value)} className="w-full p-2 text-lg font-bold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-summo-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-summo-primary uppercase">Preço Promo</label>
                                                    <input type="number" value={currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'pos')?.promotionalPrice ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceInput('promotionalPrice', e.target.value)} placeholder="Opcional" className="w-full p-2 text-lg font-bold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-summo-primary text-green-600" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeChannel === 'ifood' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`} onClick={() => setActiveChannel('ifood')}>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2 font-bold text-red-600"><Tv size={18} /> iFood</div>
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Ideal: R$ {suggestedIfoodPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Preço iFood</label>
                                                    <input type="number" value={currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === 'ifood')?.price || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceInput('price', e.target.value)} className="w-full p-2 text-lg font-bold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'SEO' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe className="text-blue-600" size={20} />
                                            <h4 className="text-lg font-bold text-gray-800">Otimização para Busca (SEO)</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6">Configure como este produto aparece nos resultados de busca do Google e redes sociais.</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">URL Amigável (Link do Produto)</label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">/produto/</div>
                                                        <input
                                                            value={currentSlug}
                                                            readOnly
                                                            disabled
                                                            className={`w-full pl-20 p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-mono text-sm cursor-not-allowed select-none`}
                                                            placeholder="gerado-automaticamente"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleAutoSlug}
                                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                                        title="Gerar automaticamente a partir do nome"
                                                    >
                                                        <Wand2 size={20} />
                                                    </button>
                                                </div>
                                                {slugError ? (
                                                    <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {slugError}</p>
                                                ) : (
                                                    <p className="text-[10px] text-gray-400 mt-1">Este é o link que seus clientes usarão para acessar este produto diretamente.</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título SEO</label>
                                                <input
                                                    type="text"
                                                    value={editData.seoTitle ?? selectedProduct.seoTitle ?? ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, seoTitle: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                                    placeholder="Ex: X-Salada Artesanal - Delivery em São Paulo"
                                                    maxLength={60}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">{(editData.seoTitle ?? selectedProduct.seoTitle ?? '').length}/60 caracteres</p>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição SEO</label>
                                                <textarea
                                                    value={editData.seoDescription ?? selectedProduct.seoDescription ?? ''}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData({ ...editData, seoDescription: e.target.value })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 resize-none"
                                                    placeholder="Descreva o produto de forma atrativa para aparecer nos resultados de busca..."
                                                    rows={3}
                                                    maxLength={160}
                                                />
                                                <p className="text-xs text-gray-400 mt-1">{(editData.seoDescription ?? selectedProduct.seoDescription ?? '').length}/160 caracteres</p>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Palavras-chave (Keywords)</label>
                                                <input
                                                    type="text"
                                                    value={(editData.keywords ?? selectedProduct.keywords ?? []).join(', ')}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData({ ...editData, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                                    placeholder="hamburguer, lanche, delivery, artesanal"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Separe as palavras-chave com vírgulas</p>
                                            </div>

                                            <div className="bg-gray-100 p-5 rounded-xl border border-gray-200 mt-6">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><SearchIcon size={14} /> Prévia no Google (Simulação)</h5>
                                                <div className="font-sans max-w-[600px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center p-1">
                                                            <img src="https://summo.app/favicon.ico" alt="" className="w-4 h-4 opacity-50" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-[#202124]">Summo App</span>
                                                            <span className="text-xs text-[#5f6368]">https://summo.app › loja › {tenantId} › produto</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                                                        {editData.seoTitle || selectedProduct?.seoTitle || editData.name || selectedProduct?.name || 'Título do Produto'}
                                                    </h3>
                                                    <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                                                        {editData.seoDescription || selectedProduct?.seoDescription || editData.description || selectedProduct?.description || 'Descrição do produto aparecerá aqui...'}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-2 text-center">Isto é apenas uma simulação visual.</p>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                                                <div className="flex items-start gap-3">
                                                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900 mb-1">Dicas de SEO</p>
                                                        <ul className="text-xs text-blue-700 space-y-1">
                                                            <li>• Use o nome do produto + diferencial no título</li>
                                                            <li>• Inclua localização se for relevant (ex: "em São Paulo")</li>
                                                            <li>• Descreva benefícios e ingredientes na descrição</li>
                                                            <li>• O slug é gerado automaticamente, mas você pode personalizá-lo</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </ErrorBoundary>
                    </div>

                    <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <div className="p-4 pb-safe lg:pb-4 flex gap-4">
                            {selectedProduct?.id && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-4 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition active:scale-95"
                                    title="Excluir Produto"
                                >
                                    <Trash2 size={24} />
                                </button>
                            )}
                            <button onClick={handleSave} className="flex-1 py-4 bg-summo-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center justify-center gap-2 active:scale-95">
                                <Save size={20} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
                <style>{` .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } `}</style>
            </div>

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
