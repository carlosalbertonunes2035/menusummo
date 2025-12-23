
import React, { useCallback } from 'react';
import { Package, Plus, Search, ScanLine, ShoppingCart, History, TrendingDown, Edit3, Wand2, Send, Trash2, Power, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useStock } from '../hooks/useStock';
import StockModals from '../components/stock/StockModals';
import { StockOverview } from '../components/stock/StockOverview';
import { PurchaseEntry } from '../components/stock/PurchaseEntry';
import { RecipeManager } from '../components/stock/RecipeManager';
import { useApp } from '../../../contexts/AppContext';
import IngredientCard from '../components/stock/IngredientCard';
import { PageContainer } from '@/components/layouts/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const Stock: React.FC = () => {
    const logic = useStock();
    const { handleAction, showToast } = useApp();

    const {
        activeTab, setActiveTab, searchTerm, setSearchTerm,
        ingredients, stockMovements, shoppingList, filteredIngredients, recipes,
        openAddModal, openEditModal, openRestockModal, openLossModal, openShoppingAdd, setModalType
    } = logic;

    const [showAiEntry, setShowAiEntry] = React.useState(false);
    const [subTab, setSubTab] = React.useState<'BASIC' | 'RECIPES'>('BASIC');

    // Actions that don't require modal state (Simple toggles/deletes)
    const toggleActive = useCallback((ing: any) => {
        handleAction('ingredients', 'update', ing.id, { isActive: !ing.isActive });
        showToast(ing.isActive ? 'Item Pausado' : 'Item Ativado', ing.isActive ? 'error' : 'success');
    }, [handleAction, showToast]);

    const deleteIngredient = useCallback((id: string) => {
        if (confirm('Deseja realmente excluir este insumo?')) {
            handleAction('ingredients', 'delete', id);
        }
    }, [handleAction]);

    const onDeleteShoppingItem = (id: string) => handleAction('shopping_list', 'delete', id);
    const onUpdateShoppingItem = (id: string, data: any) => handleAction('shopping_list', 'update', id, data);

    const generateShoppingList = () => {
        const needed = ingredients.filter(i => i.currentStock <= i.minStock);
        let added = 0;
        needed.forEach(ing => {
            if (!shoppingList.find(s => s.name === ing.name)) {
                handleAction('shopping_list', 'add', undefined, { name: ing.name, quantity: ing.minStock * 2, unit: ing.unit, checked: false, ingredientId: ing.id });
                added++;
            }
        });
        showToast(`${added} itens adicionados.`, 'success');
    };

    const exportToWhatsApp = () => {
        const pendingItems = shoppingList.filter(i => !i.checked);
        if (pendingItems.length === 0) return showToast('Lista vazia.', 'info');
        const text = `*🛒 Lista de Compras - ${new Date().toLocaleDateString()}*\n\n` + pendingItems.map(i => `- [ ] ${i.name} (${i.quantity} ${i.unit})`).join('\n');
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!ingredients || !stockMovements) return <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

    const kardexColumns = [
        { header: 'Data', accessor: (move: any) => new Date(move.date).toLocaleDateString() },
        {
            header: 'Insumo',
            accessor: (move: any) => (
                <div>
                    <span className="font-bold">{move.ingredientName}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">{move.reason}</span>
                </div>
            )
        },
        {
            header: 'Tipo',
            accessor: (move: any) => (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {move.type}
                </span>
            )
        },
        {
            header: 'Qtd.',
            className: 'text-right',
            accessor: (move: any) => (
                <span className={`font-mono font-bold ${move.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {move.quantity > 0 ? '+' : ''}{move.quantity.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Custo',
            className: 'text-right',
            accessor: (move: any) => (
                <span className="font-mono text-gray-600">
                    R$ {move.cost.toFixed(2)}
                </span>
            )
        }
    ];

    return (
        <PageContainer>
            <Breadcrumbs />
            <div className="h-full flex flex-col bg-gray-50/50 animate-fade-in">
                {/* Header Stack */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 z-20 shadow-sm rounded-2xl mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4">
                        <h2 className="text-xl lg:text-3xl font-bold text-summo-dark hidden lg:block tracking-tight">Gestão de Estoque</h2>
                        <div className="flex flex-col gap-3 w-full lg:w-auto">
                            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto no-scrollbar">
                                <button onClick={() => setActiveTab('OVERVIEW')} className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><TrendingUp size={18} /> Finanças</button>
                                <button onClick={() => setActiveTab('INVENTORY')} className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'INVENTORY' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Package size={18} /> Insumos</button>
                                <button onClick={() => setActiveTab('SHOPPING')} className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'SHOPPING' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><ShoppingCart size={18} /> Compras</button>
                                <button onClick={() => setActiveTab('HISTORY')} className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'HISTORY' ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><History size={18} /> Kardex</button>
                            </div>
                            <div className="flex gap-2 w-full">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Buscar nome ou categoria..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-summo-primary outline-none text-sm" />
                                </div>
                                {activeTab === 'INVENTORY' && (
                                    <>
                                        <button onClick={() => setShowAiEntry(true)} className="bg-summo-dark text-white p-2.5 rounded-xl shadow-lg hover:bg-summo-primary transition" title="Importar via IA"><ScanLine size={20} /></button>
                                        <button onClick={() => openAddModal()} className="bg-summo-primary text-white p-2.5 rounded-xl shadow-lg hover:bg-summo-dark transition" title="Novo Insumo"><Plus size={20} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
                    {activeTab === 'OVERVIEW' && <StockOverview />}

                    {activeTab === 'INVENTORY' && (
                        <div className="space-y-6">
                            {/* Sub-selector */}
                            <div className="flex gap-4 border-b border-gray-100 mb-6">
                                <button
                                    onClick={() => {
                                        setSubTab('BASIC');
                                        setSearchTerm(''); // Clear search when going back to list
                                    }}
                                    className={`pb-3 text-sm font-black transition-all ${subTab === 'BASIC' ? 'text-summo-primary border-b-2 border-summo-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Insumos Básicos
                                </button>
                                <button
                                    onClick={() => setSubTab('RECIPES')}
                                    className={`pb-3 text-sm font-black transition-all ${subTab === 'RECIPES' ? 'text-summo-primary border-b-2 border-summo-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Minhas Receitas (Fichas Técnicas)
                                </button>
                            </div>

                            {subTab === 'BASIC' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                                    {filteredIngredients.map(ing => {
                                        const usedIn = (recipes || []).filter(r => r.ingredients.some(ri => ri.ingredientId === ing.id));
                                        return (
                                            <IngredientCard
                                                key={ing.id}
                                                ingredient={ing}
                                                usedInRecipes={usedIn}
                                                toggleActive={toggleActive}
                                                openShoppingAdd={openShoppingAdd}
                                                openEditModal={openEditModal}
                                                openLossModal={openLossModal}
                                                openRestockModal={openRestockModal}
                                                onOpenRecipes={(ing) => {
                                                    setSubTab('RECIPES');
                                                    setSearchTerm(ing.name);
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <RecipeManager externalSearch={searchTerm} onSearchChange={setSearchTerm} hideSearch={true} />
                            )}
                        </div>
                    )}

                    {activeTab === 'SHOPPING' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                                <div className="text-center lg:text-left"><h3 className="font-bold text-gray-800">Lista de Compras</h3><p className="text-xs text-gray-500">{shoppingList.filter(i => !i.checked).length} itens pendentes</p></div>
                                <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto"><button onClick={generateShoppingList} className="flex-1 lg:flex-none bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"><Wand2 size={16} /> Sugerir</button><button onClick={exportToWhatsApp} className="flex-1 lg:flex-none bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-200 transition"><Send size={16} /> WhatsApp</button><button onClick={() => openShoppingAdd()} className="flex-1 lg:flex-none bg-summo-primary text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-summo-dark transition"><Plus size={16} /> Add</button></div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                {shoppingList.map(item => (<div key={item.id} className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-0 render-auto ${item.checked ? 'bg-gray-50' : 'bg-white'}`}><div className="flex items-center gap-3"><input type="checkbox" checked={item.checked} onChange={() => onUpdateShoppingItem(item.id, { checked: !item.checked })} className="w-5 h-5 rounded border-gray-300 text-summo-primary focus:ring-summo-primary" /><div><p className={`font-bold text-sm text-gray-800 ${item.checked ? 'line-through text-gray-400' : ''}`}>{item.name}{item.ingredientId && <span className="ml-2 text-[9px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">VINCULADO</span>}</p><p className="text-xs text-gray-500">{item.quantity} {item.unit}</p></div></div><button onClick={() => onDeleteShoppingItem(item.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button></div>))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'HISTORY' && (
                        <ResponsiveTable
                            data={stockMovements}
                            columns={kardexColumns}
                            className="animate-fade-in"
                        />
                    )}
                </div>

                <StockModals logic={logic} />

                {showAiEntry && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-transparent">
                            <PurchaseEntry onComplete={() => setShowAiEntry(false)} />
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default React.memo(Stock);
