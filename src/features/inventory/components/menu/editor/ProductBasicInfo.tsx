import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Plus } from 'lucide-react';

interface ProductBasicInfoProps {
    product: Product;
    editData: Partial<Product>;
    onUpdate: (field: keyof Product, value: any) => void;
    categories: string[];
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
    product,
    editData,
    onUpdate,
    categories
}) => {
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Check if current category exists
    useEffect(() => {
        const currentCategory = editData.category ?? product.category;
        const categoryExists = categories.includes(currentCategory || '');
        setIsCreatingCategory(!categoryExists && !!currentCategory);
    }, [editData.category, product.category, categories]);

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
            onUpdate('category', newCategoryName.trim());
            setIsCreatingCategory(false);
            setNewCategoryName('');
        }
    };

    const handleCancelNewCategory = () => {
        setIsCreatingCategory(false);
        setNewCategoryName('');
        onUpdate('category', product.category);
    };

    return (
        <div className="space-y-4">
            {/* Nome */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Nome do Produto
                </label>
                <input
                    type="text"
                    value={editData.name ?? product.name ?? ''}
                    onChange={(e) => onUpdate('name', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold"
                    placeholder="Ex: Pizza Margherita"
                />
            </div>

            {/* Categoria */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Categoria
                </label>
                {isCreatingCategory ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            autoFocus
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateCategory();
                                if (e.key === 'Escape') handleCancelNewCategory();
                            }}
                            className="flex-1 p-3 bg-white border border-summo-primary rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold"
                            placeholder="Nome da nova categoria"
                        />
                        <button
                            onClick={handleCreateCategory}
                            className="px-4 py-2 bg-summo-primary text-white rounded-xl hover:bg-summo-primary/90 transition font-bold text-sm"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={handleCancelNewCategory}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold text-sm"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <select
                        value={editData.category ?? product.category ?? ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold"
                    >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__new__">+ Criar Nova Categoria</option>
                    </select>
                )}
            </div>

            {/* Tipo */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Tipo de Produto
                </label>
                <select
                    value={editData.type ?? product.type ?? 'NORMAL'}
                    onChange={(e) => onUpdate('type', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold"
                >
                    <option value="NORMAL">Produto Normal</option>
                    <option value="COMBO">Combo</option>
                    <option value="INGREDIENT">Insumo</option>
                </select>
            </div>

            {/* Descrição */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Descrição Geral
                </label>
                <textarea
                    value={editData.description ?? product.description ?? ''}
                    onChange={(e) => onUpdate('description', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm resize-none h-24"
                    placeholder="Descrição do produto (usada em todos os canais se não houver override)"
                />
            </div>
        </div>
    );
};
