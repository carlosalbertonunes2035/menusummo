import {
    Plus, ChefHat, Search, Trash2, Edit3,
    Calculator, ArrowRight, BookOpen, Clock,
    AlertTriangle, Sparkles, Filter
} from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { Recipe } from '../../../../types/recipe';
import { formatCurrency } from '../../../../lib/utils';
import { RecipeForm } from './RecipeForm';

interface RecipeManagerProps {
    externalSearch?: string;
    onSearchChange?: (val: string) => void;
    hideSearch?: boolean;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({ externalSearch, onSearchChange, hideSearch }) => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { recipes, deleteRecipe: deleteRecipeMutation } = useRecipesQuery(tenantId);
    const { ingredients } = useIngredientsQuery(tenantId);
    const [localSearch, setLocalSearch] = useState('');
    const [editingRecipe, setEditingRecipe] = useState<Recipe | 'new' | null>(null);

    const searchTerm = externalSearch ?? localSearch;
    const setSearchTerm = onSearchChange ?? setLocalSearch;

    const filteredRecipes = (recipes || []).filter((r: Recipe) => {
        const matchesName = r.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesIngredient = r.ingredients.some(ri => {
            const ing = ingredients.find(i => i.id === ri.ingredientId);
            return ing?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        });
        return matchesName || matchesIngredient;
    });

    const deleteRecipe = async (id: string) => {
        if (confirm("Deseja realmente excluir esta ficha técnica?")) {
            await deleteRecipeMutation(id);
            showToast("Receita excluída.", 'info');
        }
    };

    if (editingRecipe) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-5xl bg-transparent">
                    <RecipeForm
                        existingRecipe={editingRecipe === 'new' ? undefined : editingRecipe}
                        onClose={() => setEditingRecipe(null)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Search */}
            <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${hideSearch ? 'justify-end' : ''}`}>
                {!hideSearch && (
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar receitas..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-3.5 pl-12 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-summo-primary font-bold text-gray-800"
                        />
                    </div>
                )}
                <button
                    onClick={() => setEditingRecipe('new')}
                    className="w-full md:w-auto bg-summo-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-summo-primary/20 hover:bg-summo-dark transition flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Nova Ficha Técnica
                </button>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChefHat className="text-gray-200" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sem fichas técnicas criadas</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8">
                        Crie receitas para fracionar insumos e ter um controle de custos ultra-preciso por produto.
                    </p>
                    <button
                        onClick={() => setEditingRecipe('new')}
                        className="text-summo-primary font-bold hover:underline flex items-center gap-2 mx-auto"
                    >
                        Começar agora <ArrowRight size={18} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe: Recipe) => (
                        <div key={recipe.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-summo-bg p-3 rounded-2xl text-summo-primary">
                                        <ChefHat size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingRecipe(recipe)}
                                            className="p-2 text-gray-400 hover:text-summo-primary hover:bg-summo-bg rounded-xl transition"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteRecipe(recipe.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black text-gray-800 mb-1">{recipe.name}</h4>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                                    Rendimento: {recipe.yield} {recipe.yieldUnit}
                                </p>

                                <div className="space-y-3">
                                    {(recipe.ingredients || []).slice(0, 3).map((item: any, idx: number) => {
                                        // In many cases we don't have the full ingredient object here, just ID
                                        // We might need to look it up if we want names
                                        return (
                                            <div key={idx} className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400 truncate max-w-[120px]">Ingrediente #{idx + 1}</span>
                                                <span className="text-gray-600">{item.quantity} {item.unit}</span>
                                            </div>
                                        );
                                    })}
                                    {recipe.ingredients.length > 3 && (
                                        <p className="text-[10px] text-gray-300 font-bold text-center mt-2">+ {recipe.ingredients.length - 3} itens</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center group-hover:bg-summo-primary transition-colors duration-300">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-white/60 transition-colors">Custo por {recipe.yieldUnit}</p>
                                    <p className="text-xl font-black text-gray-800 group-hover:text-white transition-colors">
                                        {formatCurrency((recipe.totalCost || 0) / (recipe.yield || 1))}
                                    </p>
                                </div>
                                <div className="text-xs font-bold text-summo-primary group-hover:text-white flex items-center gap-1 transition-colors">
                                    Ver Detalhes <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Optimization Insight */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-orange-400/20 shadow-2xl">
                <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-summo-primary/10 rounded-full blur-3xl"></div>

                <div className="bg-white/5 p-6 rounded-full shrink-0 relative z-10">
                    <Sparkles className="text-summo-primary" size={48} />
                </div>

                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-2xl font-black mb-2">Poder de Escala & Fração</h3>
                    <p className="text-gray-400 font-medium max-w-xl">
                        Ao cadastrar suas fichas técnicas, a Summo AI calcula automaticamente o custo de cada grama ou ml utilizado em seus pratos.
                        <b> Próximo passo:</b> Ao vender um produto, o sistema dará baixa proporcional em todos esses sub-itens.
                    </p>
                </div>

                <div className="shrink-0 relative z-10 w-full md:w-auto">
                    <button className="w-full bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition shadow-xl">
                        Simular Produção <Calculator size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
