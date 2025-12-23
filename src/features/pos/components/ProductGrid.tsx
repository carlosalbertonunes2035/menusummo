import React, { useEffect, memo } from 'react';
import { Product, Ingredient } from '../../../types';
import { ImageIcon, Edit3, TrendingUp, AlertCircle, Ban } from 'lucide-react';
import { getProductChannel } from '../../../lib/utils';

interface ProductGridProps {
    products: Product[];
    ingredients: Ingredient[];
    onAdd: (product: Product) => void;
    onEdit: (product: Product, e: React.MouseEvent) => void;
    selectedIndex?: number;
}

// Sub-component Memoizado para evitar re-render de todos os produtos ao filtrar/clicar
const ProductCard = memo(({
    product,
    index,
    ingredients,
    isSelected,
    onAdd,
    onEdit
}: {
    product: Product,
    index: number,
    ingredients: Ingredient[],
    isSelected: boolean,
    onAdd: (p: Product) => void,
    onEdit: (p: Product, e: React.MouseEvent) => void
}) => {
    // @FIX: Access channel-specific properties for display (Strict POS channel)
    const posChannel = getProductChannel(product, 'pos');

    // Helper to check availability
    const checkAvailability = (product: Product) => {
        for (const item of product.ingredients) {
            const ing = ingredients.find(i => i.id === item.ingredientId);
            if (!ing) return { available: false, reason: 'Ingrediente faltando' };
            if (ing.isActive === false) return { available: false, reason: `Sem ${ing.name}` };
            if (ing.currentStock < item.amount) return { available: false, reason: `Estoque ${ing.name}` };
        }
        return { available: true };
    };

    const status = checkAvailability(product);
    const isDisabled = !status.available;

    return (
        <div
            id={`product-card-${index}`}
            onClick={() => !isDisabled && onAdd(product)}
            onContextMenu={(e) => onEdit(product, e)}
            className={`bg-white rounded-2xl p-3 border shadow-sm transition-all flex flex-col h-full group relative select-none duration-150 render-auto
                ${isDisabled
                    ? 'opacity-60 cursor-not-allowed border-gray-100'
                    : isSelected
                        ? 'border-summo-primary ring-4 ring-summo-primary/20 scale-[1.02] shadow-xl z-10'
                        : 'hover:shadow-lg hover:border-summo-primary/50 cursor-pointer active:scale-95 border-gray-200'
                }`}
        >
            <div className="aspect-square bg-gray-100 rounded-xl mb-3 relative overflow-hidden">
                {posChannel?.image ? (
                    <img src={posChannel.image} className={`w-full h-full object-cover ${isDisabled ? 'grayscale' : ''}`} loading="lazy" decoding="async" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={32} />
                    </div>
                )}

                {!isDisabled && (
                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors ${isSelected ? 'bg-summo-primary text-white' : 'bg-white/90 text-gray-800 backdrop-blur'}`}>
                        R$ {(posChannel?.price || 0).toFixed(2)}
                    </div>
                )}

                {isDisabled && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                        <div className="bg-red-500 text-white p-2 rounded-full mb-1 shadow-sm">
                            <Ban size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-red-600 bg-white/90 px-2 py-1 rounded shadow-sm">
                            {status.reason}
                        </span>
                    </div>
                )}

                {!isDisabled && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(product, e); }}
                        className={`absolute top-2 right-2 p-2.5 bg-white/95 backdrop-blur rounded-xl text-gray-500 shadow-sm transition-all hover:text-summo-primary active:scale-95
                            ${isSelected ? 'opacity-100 text-summo-primary ring-2 ring-summo-primary/20' : 'opacity-100 lg:opacity-0 group-hover:opacity-100'}`}
                    >
                        <Edit3 size={18} />
                    </button>
                )}
            </div>
            <h3 className={`font-bold leading-tight text-sm mb-1 line-clamp-2 transition-colors ${isSelected ? 'text-summo-primary' : 'text-gray-800'}`}>
                {product.name}
            </h3>
        </div>
    );
});

const ProductGrid: React.FC<ProductGridProps> = ({ products, ingredients, onAdd, onEdit, selectedIndex = -1 }) => {

    // Automatic scroll effect - Desktop only
    useEffect(() => {
        if (selectedIndex >= 0 && window.innerWidth >= 1024) {
            const el = document.getElementById(`product-card-${selectedIndex}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 lg:pb-0">
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    index={index}
                    product={product}
                    ingredients={ingredients}
                    isSelected={index === selectedIndex}
                    onAdd={onAdd}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
};

export default React.memo(ProductGrid);
