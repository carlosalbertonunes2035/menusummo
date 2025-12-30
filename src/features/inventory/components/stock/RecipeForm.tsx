import React, { useState, useMemo } from 'react';
import {
    Plus, Trash2, Save, Calculator, ChefHat,
    ArrowLeft, Search, Scale, DollarSign, RefreshCcw, X
} from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { Recipe, RecipeIngredient } from '../../../../types/recipe';
import { formatCurrency } from '../../../../lib/utils';

interface RecipeFormProps {
    existingRecipe?: Recipe;
    onClose: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ existingRecipe, onClose }) => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { saveRecipe } = useRecipesQuery(tenantId);
    const { ingredients } = useIngredientsQuery(tenantId);

    const [recipe, setRecipe] = useState<Partial<Recipe>>(existingRecipe || {
        name: '',
        ingredients: [],
        yield: 1,
        yieldUnit: 'un',
        totalCost: 0
    });

    const [searchTerm, setSearchTerm] = useState('');

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(ing =>
            ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !recipe.ingredients?.some(i => i.ingredientId === ing.id)
        );
    }, [ingredients, searchTerm, recipe.ingredients]);

    const totalCost = useMemo(() => {
        return (recipe.ingredients || []).reduce((acc, item) => {
            const ing = ingredients.find(i => i.id === item.ingredientId);
            if (!ing) return acc;

            const costPerUnit = ing.costPerUnit || ing.cost || 0;
            let itemCost = 0;

            // Conversion logic
            if (ing.unit === 'kg' && item.unit === 'g') itemCost = (item.quantity / 1000) * costPerUnit;
            else if (ing.unit === 'L' && item.unit === 'ml') itemCost = (item.quantity / 1000) * costPerUnit;
            else itemCost = item.quantity * costPerUnit;

            return acc + itemCost;
        }, 0);
    }, [recipe.ingredients, ingredients]);

    const costPerYield = totalCost / (recipe.yield || 1);

    const addIngredient = (ingId: string) => {
        const ing = ingredients.find(i => i.id === ingId);
        if (!ing) return;

        const newItem: RecipeIngredient = {
            ingredientId: ingId,
            quantity: 1,
            unit: ing.unit,
            cost: 0
        };

        setRecipe(prev => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), newItem]
        }));
        setSearchTerm('');
    };

    const updateIngredient = (idx: number, updates: Partial<RecipeIngredient>) => {
        const newIngredients = [...(recipe.ingredients || [])];
        newIngredients[idx] = { ...newIngredients[idx], ...updates };
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const removeIngredient = (idx: number) => {
        const newIngredients = recipe.ingredients?.filter((_, i) => i !== idx);
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSave = async () => {
        if (!recipe.name || !recipe.ingredients?.length) {
            showToast('Preencha o nome e adicione ingredientes.', 'error');
            return;
        }

        try {
            const finalRecipe = {
                ...recipe,
                totalCost,
                updatedAt: new Date().toISOString()
            } as Recipe;

            await saveRecipe(finalRecipe);
            showToast('Receita salva com sucesso!', 'success');
            onClose();
        } catch (error) {
            showToast('Erro ao salvar receita.', 'error');
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[90vh] max-h-[800px] animate-slide-in-up overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <ChefHat className="text-summo-primary" size={24} />
                            {existingRecipe ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Engenharia de Produção</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Custo por {recipe.yieldUnit}</p>
                        <p className="text-xl font-black text-summo-primary">{formatCurrency(costPerYield)}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-summo-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-summo-dark transition flex items-center gap-2 shadow-lg shadow-summo-primary/20"
                    >
                        <Save size={18} /> Salvar
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
                        title="Fechar sem salvar"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Left Side: Form */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nome da Receita</label>
                            <input
                                type="text"
                                value={recipe.name}
                                onChange={e => setRecipe({ ...recipe, name: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800 text-lg"
                                placeholder="Ex: Molho Especial da Casa"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Rendimento Total</label>
                            <div className="relative">
                                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    value={recipe.yield}
                                    onChange={e => setRecipe({ ...recipe, yield: parseFloat(e.target.value) })}
                                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Unidade do Rendimento</label>
                            <select
                                value={recipe.yieldUnit}
                                onChange={e => setRecipe({ ...recipe, yieldUnit: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800"
                            >
                                <option value="un">Unidade(s)</option>
                                <option value="kg">Quilogramas (kg)</option>
                                <option value="L">Litros (L)</option>
                                <option value="porcao">Porções</option>
                            </select>
                        </div>
                    </div>

                    {/* Ingredients List */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Plus size={18} className="text-green-500" />
                            Ingredientes e Pesagem
                        </h4>

                        <div className="space-y-3">
                            {recipe.ingredients?.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                                    <ChefHat className="mx-auto text-gray-200 mb-2" size={40} />
                                    <p className="text-sm text-gray-400 font-medium">Sua receita ainda está vazia.</p>
                                </div>
                            ) : (
                                recipe.ingredients?.map((item, idx) => {
                                    const ing = ingredients.find(i => i.id === item.ingredientId);
                                    if (!ing) return null;
                                    const costPerUnit = ing.costPerUnit || ing.cost || 0;
                                    let itemCost = 0;
                                    if (ing.unit === 'kg' && item.unit === 'g') itemCost = (item.quantity / 1000) * costPerUnit;
                                    else if (ing.unit === 'L' && item.unit === 'ml') itemCost = (item.quantity / 1000) * costPerUnit;
                                    else itemCost = item.quantity * costPerUnit;

                                    return (
                                        <div key={idx} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 group hover:shadow-md transition shadow-sm">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-800 truncate">{ing.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Custo Ref: {formatCurrency(costPerUnit)}/{ing.unit}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.quantity}
                                                    onChange={e => updateIngredient(idx, { quantity: parseFloat(e.target.value) })}
                                                    className="w-20 p-2 bg-gray-50 border border-gray-100 rounded-xl text-center font-black text-gray-800 focus:ring-2 focus:ring-summo-primary outline-none"
                                                />
                                                <select
                                                    value={item.unit}
                                                    onChange={e => updateIngredient(idx, { unit: e.target.value })}
                                                    className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none"
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="L">L</option>
                                                    <option value="ml">ml</option>
                                                    <option value="un">un</option>
                                                </select>
                                            </div>

                                            <div className="w-24 text-right">
                                                <p className="text-xs font-bold text-gray-600">{formatCurrency(itemCost)}</p>
                                            </div>

                                            <button
                                                onClick={() => removeIngredient(idx)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Ingredient Picker */}
                <div className="w-80 bg-gray-50 border-l border-gray-100 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar insumos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-summo-primary"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Insumos Disponíveis</h5>
                        {filteredIngredients.map(ing => (
                            <button
                                key={ing.id}
                                onClick={() => addIngredient(ing.id)}
                                className="w-full p-3 bg-white border border-gray-100 rounded-xl text-left hover:border-summo-primary hover:shadow-sm transition group"
                            >
                                <p className="text-sm font-bold text-gray-700 group-hover:text-summo-primary transition">{ing.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{formatCurrency(ing.costPerUnit || ing.cost || 0)} / {ing.unit}</p>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-gray-400 uppercase">Custo Total</span>
                            <span className="text-lg font-black text-gray-800">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100 flex gap-2">
                            <Calculator className="text-yellow-600 shrink-0" size={14} />
                            <p className="text-[10px] text-yellow-700 font-medium leading-tight">
                                Este custo é calculado com base no preço de compra mais recente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
