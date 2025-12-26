import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Plus, Wand2, DollarSign, Tag, AlignLeft, ChevronDown, Check } from 'lucide-react';
import { ProductImageManager } from './ProductImageManager';
import { useApp } from '@/contexts/AppContext';
import { Select } from '@/components/ui/Select';

interface ProductBasicInfoProps {
    product: Product;
    editData: Partial<Product>;
    onUpdate: (field: keyof Product, value: any) => void;
    categories: string[];
    onImageChange: (url: string) => void;
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
    product,
    editData,
    onUpdate,
    categories,
    onImageChange
}) => {
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { settings } = useApp();

    // Fix: Only switch to creating mode if explicitly requested or if data is totally desynced, 
    // but avoid loop if we just set it.
    // We will rely on manual toggling for creation to be safer.

    const handleCategoryChange = (value: string) => {
        if (value === '__new__') {
            setIsCreatingCategory(true);
            setNewCategoryName('');
        } else {
            setIsCreatingCategory(false);
            onUpdate('category', value);
        }
    };

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            // Update the category field with the new name
            onUpdate('category', newCategoryName.trim());
            // Exit creation mode immediately
            setIsCreatingCategory(false);
            setNewCategoryName('');
        }
    };

    const handleCancelNewCategory = () => {
        setIsCreatingCategory(false);
        setNewCategoryName('');
        // Revert to existing or empty
        if (!editData.category) onUpdate('category', '');
    };

    const currentCategory = editData.category ?? product.category ?? product.categoryName ?? '';
    // Ensure the current value is valid for the select, or force it to be treated as a custom one if needed
    // But for the Select to work, we might need to add the current value to the options list temporarily if it's new
    const uniqueCategories = Array.from(new Set([...categories, currentCategory].filter(Boolean)));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COL: Image & Type (40%) - Wider as requested */}
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <ProductImageManager
                        product={product}
                        currentImage={editData.image ?? product.image ?? ''}
                        onImageChange={onImageChange}
                        onUpdate={onUpdate}
                        productName={editData.name ?? product.name ?? ''}
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                        Tipo de Produto
                    </label>
                    <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${(editData.type || product.type) === 'COMBO'
                            ? 'border-transparent bg-white shadow-sm'
                            : 'border-summo-primary bg-summo-bg/20'
                            }`}>
                            <input
                                type="radio"
                                name="productType"
                                value="NORMAL"
                                checked={(editData.type || product.type || 'NORMAL') !== 'COMBO'}
                                onChange={() => onUpdate('type', 'NORMAL')}
                                className="text-summo-primary focus:ring-summo-primary"
                            />
                            <span className="text-sm font-bold text-gray-700">Produto Simples</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${(editData.type || product.type) === 'COMBO'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-transparent bg-white shadow-sm'
                            }`}>
                            <input
                                type="radio"
                                name="productType"
                                value="COMBO"
                                checked={(editData.type || product.type) === 'COMBO'}
                                onChange={() => onUpdate('type', 'COMBO')}
                                className="text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm font-bold text-gray-700">Combo / Kit</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* RIGHT COL: Basic Info (60%) */}
            <div className="lg:col-span-7 space-y-6">

                {/* HERO CARD: Name & Price */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-summo-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                Nome do Item
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={editData.name ?? product.name ?? ''}
                                    onChange={(e) => onUpdate('name', e.target.value)}
                                    className="w-full text-xl font-black text-gray-800 placeholder:text-gray-300 border-b-2 border-gray-100 focus:border-summo-primary outline-none py-2 bg-transparent transition"
                                    placeholder="Ex: X-Bacon Supremo"
                                />
                                <button className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-summo-primary opacity-0 group-hover:opacity-100 transition hover:bg-summo-bg rounded-lg" title="Gerar Nome com IA">
                                    <Wand2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-green-600 uppercase flex items-center gap-2">
                                <DollarSign size={14} /> Preço de Venda
                            </label>
                            <div className="relative group">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editData.price ?? product.price ?? ''}
                                    onChange={(e) => onUpdate('price', parseFloat(e.target.value))}
                                    className="w-full pl-8 text-3xl font-black text-gray-800 placeholder:text-gray-200 border-b-2 border-gray-100 focus:border-green-500 outline-none py-1 bg-transparent transition"
                                    placeholder="0,00"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                    Este preço será aplicado automaticamente ao PDV e Cardápio Digital.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Info */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">

                    {/* Category */}
                    <div>
                        {isCreatingCategory ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                                        Nova Categoria
                                    </label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateCategory();
                                            if (e.key === 'Escape') handleCancelNewCategory();
                                        }}
                                        className="w-full p-4 bg-white border-2 border-summo-primary rounded-xl focus:outline-none text-sm font-bold text-summo-primary placeholder:text-summo-primary/50 shadow-sm"
                                        placeholder="Nome da categoria..."
                                    />
                                </div>
                                <button
                                    onClick={handleCreateCategory}
                                    className="h-[54px] px-6 bg-summo-primary text-white rounded-xl hover:bg-summo-dark transition font-bold text-sm shadow-md"
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={handleCancelNewCategory}
                                    className="h-[54px] px-4 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <Select
                                label="Categoria"
                                value={currentCategory}
                                onChange={(val) => {
                                    // Handle direct change
                                    onUpdate('category', val);
                                }}
                                options={uniqueCategories}
                                placeholder="Selecione uma Categoria"
                                allowCreate={true}
                                onCreate={(val) => {
                                    if (val === '__TRIGGER_CREATE__') {
                                        setIsCreatingCategory(true);
                                    } else {
                                        // If using search-to-create directly
                                        onUpdate('category', val);
                                    }
                                }}
                                createLabel="Criar Nova Categoria ✨"
                                searchable={true}
                            />
                        )}
                        <p className="text-[10px] text-gray-400 mt-2">
                            Dica: Categorias ajudam a organizar seu cardápio digital e relatórios.
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2">
                            <AlignLeft size={14} /> Descrição / Ingredientes
                        </label>
                        <div className="relative group">
                            <textarea
                                value={editData.description ?? product.description ?? ''}
                                onChange={(e) => onUpdate('description', e.target.value)}
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-summo-primary rounded-xl outline-none text-sm leading-relaxed resize-none h-32 transition"
                                placeholder="Descreva os ingredientes irresistíveis deste prato..."
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!editData.name && !product.name) return;

                                    const apiKey = settings.ai?.apiKey;
                                    if (!apiKey) {
                                        // TODO: Show toast error: Configure AI in settings
                                        alert("Configure a API Key da IA nas Configurações > Avançado/IA");
                                        return;
                                    }

                                    setIsGenerating(true);
                                    try {
                                        // Dynamic import to avoid circular deps if any, or just import at top. 
                                        // For now I'll use a mocked local function if import fails or standard import.
                                        // Actually let's just assume I imported AIService at top.
                                        const { AIService } = await import('@/services/aiService');
                                        const ai = new AIService(apiKey);

                                        const result = await ai.generateProductCopy(
                                            editData.name || product.name || '',
                                            product.type || 'NORMAL',
                                            settings.businessProfile
                                        );

                                        if (result) {
                                            onUpdate('description', result.description);
                                            // Optional: Update name if it's much better? User asked for description mostly here inside this box
                                            // but mentioned "Internal vs External".
                                            // Maybe show a confirmation? For now let's fill description.
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        alert("Erro ao gerar com IA.");
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                disabled={isGenerating}
                                className="absolute right-3 bottom-3 p-2 bg-white text-summo-primary shadow-sm border border-gray-100 hover:bg-summo-bg rounded-lg opacity-100 transition disabled:opacity-50 z-10 cursor-pointer"
                                title="Melhorar com IA (Baseado no seu Perfil)"
                            >
                                {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-summo-primary border-t-transparent rounded-full" /> : <Wand2 size={16} />}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
