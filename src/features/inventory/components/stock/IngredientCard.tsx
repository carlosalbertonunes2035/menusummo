
import React, { memo } from 'react';
import { Ingredient } from '../../../../types';
import { Package, Power, ShoppingCart, Edit3, TrendingDown, Plus, Tag, ChefHat } from 'lucide-react';

interface IngredientCardProps {
    ingredient: Ingredient;
    toggleActive: (ing: Ingredient) => void;
    openShoppingAdd: (ing: Ingredient) => void;
    openEditModal: (ing: Ingredient) => void;
    openLossModal: (ing: Ingredient) => void;
    openRestockModal: (ing: Ingredient) => void;
    onOpenRecipes?: (ing: Ingredient) => void;
    usedInRecipes?: any[];
}

const IngredientCard: React.FC<IngredientCardProps> = ({
    ingredient: ing,
    toggleActive,
    openShoppingAdd,
    openEditModal,
    openLossModal,
    openRestockModal,
    onOpenRecipes,
    usedInRecipes = []
}) => {
    const isLow = ing.currentStock <= ing.minStock;

    return (
        <div className={`bg-white p-4 rounded-2xl shadow-sm border transition-all duration-200 relative overflow-hidden flex flex-col render-auto ${ing.isActive === false ? 'opacity-80 grayscale-[0.8] border-gray-200' : isLow ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="flex gap-3 mb-3">
                {ing.image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={ing.image} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                ) : (
                    <div className={`p-3 rounded-lg flex items-center justify-center h-12 w-12 flex-shrink-0 ${isLow ? 'bg-red-100 text-red-600' : 'bg-summo-bg text-summo-primary'}`}>
                        <Package size={20} />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight truncate pr-6">{ing.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {ing.isActive === false && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">PAUSADO</span>}
                        {ing.category && <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Tag size={8} /> {ing.category}</span>}
                        {usedInRecipes.length > 0 && (
                            <button
                                onClick={() => onOpenRecipes?.(ing)}
                                className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-blue-100 transition shadow-sm border border-blue-100 active:scale-95"
                                title={usedInRecipes.map(r => r.name).join(', ')}
                            >
                                <ChefHat size={8} /> {usedInRecipes.length} {usedInRecipes.length === 1 ? 'Receita' : 'Receitas'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute top-2 right-2">
                    <button onClick={() => toggleActive(ing)} className={`p-1.5 rounded-lg transition ${ing.isActive === false ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-green-500'}`}>
                        <Power size={16} />
                    </button>
                </div>
            </div>
            <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-summo-dark tracking-tight">{ing.currentStock.toFixed(2).replace('.00', '')}</span>
                <span className="text-xs text-gray-500 font-bold mb-1">{ing.unit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-summo-secondary'}`} style={{ width: `${Math.min(100, (ing.currentStock / (ing.minStock * 3)) * 100)}%` }}></div>
            </div>
            <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center gap-2">
                <button onClick={() => openShoppingAdd(ing)} className="p-2 text-gray-400 hover:text-summo-primary hover:bg-summo-bg rounded-lg transition"><ShoppingCart size={16} /></button>
                <button onClick={() => openEditModal(ing)} className="p-2 text-gray-400 hover:text-summo-primary hover:bg-summo-bg rounded-lg transition"><Edit3 size={16} /></button>
                <div className="flex-1"></div>
                <button onClick={() => openLossModal(ing)} className="p-2 bg-gray-50 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><TrendingDown size={16} /></button>
                <button onClick={() => openRestockModal(ing)} className="bg-summo-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-summo-primary transition shadow-sm flex items-center gap-1"><Plus size={14} /> Ajuste</button>
            </div>
        </div>
    );
};

export default memo(IngredientCard);
