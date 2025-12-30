import React, { useState, useMemo } from 'react';
import {
    Users,
    ChevronRight,
    Search,
    Plus,
    ClipboardList,
    Utensils,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useOrders } from '@/hooks/useOrders';
import { useCheckout } from '@/hooks/useCheckout';
import { OrderType, OrderStatus, Product } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

const Waiter: React.FC = () => {
    const { tenantId, settings } = useApp();
    const { products } = useProductsQuery(tenantId);
    const { data: orders } = useOrders({ limit: 100 });
    const { placeOrder } = useCheckout();

    const [view, setView] = useState<'TABLES' | 'ORDERING' | 'MEAL_HISTORY'>('TABLES');
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic table generation from settings
    const tables = useMemo(() => {
        const config = settings.tables || { totalTables: 20, prefix: 'Mesa', startNumber: 1 };
        return Array.from({ length: config.totalTables }, (_, i) => {
            const tableNum = config.startNumber + i;
            return `${config.prefix} ${tableNum.toString().padStart(2, '0')}`;
        });
    }, [settings.tables]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const activeOrdersForTable = useMemo(() => {
        if (!selectedTable) return [];
        return orders.filter(o => o.tableNumber === selectedTable && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);
    }, [orders, selectedTable]);

    const handleAddToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const totalOrder = cart.reduce((acc, item) => {
        const price = item.product.channels.find(c => c.channel === 'pos')?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    const handleSubmitOrder = async () => {
        if (cart.length === 0 || !selectedTable) return;

        setIsSubmitting(true);
        try {
            const orderData = {
                customerName: selectedTable,
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.channels.find(c => c.channel === 'pos')?.price || 0,
                    basePrice: item.product.cost || 0
                })),
                total: totalOrder,
                cost: cart.reduce((acc, item) => acc + (item.product.cost * item.quantity), 0),
                status: OrderStatus.PENDING,
                type: OrderType.DINE_IN,
                origin: 'POS' as const,
                payments: [],
                tableNumber: selectedTable,
                createdAt: new Date()
            };

            await placeOrder(orderData);
            setCart([]);
            setView('TABLES');
            setSelectedTable(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-summo-primary text-white p-4 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    {view !== 'TABLES' && (
                        <button onClick={() => setView('TABLES')} className="p-1 -ml-1">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-xl font-bold tracking-tight">SUMMO <span className="text-white/70 font-medium">Garçom</span></h1>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                    <Users size={20} />
                </div>
            </header>

            {/* Navigation (Mobile Style) */}
            {view === 'TABLES' && (
                <div className="flex bg-white border-b sticky top-0 z-10">
                    <button className="flex-1 py-4 border-b-2 border-summo-primary text-summo-primary font-bold flex items-center justify-center gap-2">
                        <Utensils size={18} /> Mesas
                    </button>
                    <button className="flex-1 py-4 text-gray-400 font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <Clock size={18} /> Pendentes
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {view === 'TABLES' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
                        {tables.map((table, index) => {
                            const hasActiveOrder = orders.some(o => o.tableNumber === table && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

                            // Find section color if configured
                            const tableNum = (settings.tables?.startNumber || 1) + index;
                            const section = settings.tables?.sections?.find(s =>
                                tableNum >= s.range[0] && tableNum <= s.range[1]
                            );

                            return (
                                <button
                                    key={table}
                                    onClick={() => {
                                        setSelectedTable(table);
                                        setView('ORDERING');
                                    }}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all p-4 shadow-sm active:scale-95 ${hasActiveOrder
                                        ? 'bg-amber-100 border-2 border-amber-300 text-amber-900'
                                        : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-summo-primary hover:text-summo-primary'
                                        }`}
                                    style={section && !hasActiveOrder ? {
                                        borderColor: section.color,
                                        borderWidth: '2px'
                                    } : undefined}
                                >
                                    <span className="text-lg font-black">{table.replace(/^[^\d]*/, '')}</span>
                                    <span className="text-[10px] uppercase font-bold text-center">
                                        {hasActiveOrder ? 'Ocupada' : (section?.name || 'Livre')}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {view === 'ORDERING' && (
                    <div className="space-y-6 animate-fade-in pb-32">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 sticky top-0 z-10 flex items-center gap-2">
                            <Search className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                className="w-full bg-transparent outline-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produtos</h3>
                            {filteredProducts.map(product => {
                                const price = product.channels.find(c => c.channel === 'pos')?.price || 0;
                                return (
                                    <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{product.name}</p>
                                            <p className="text-sm text-summo-primary font-bold">{formatCurrency(price)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-summo-bg text-summo-primary p-3 rounded-xl active:bg-summo-primary active:text-white transition shadow-sm"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Cart Menu (Only in Ordering view) */}
            {view === 'ORDERING' && cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-slide-in-up">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-summo-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                                </span>
                                <span className="font-bold text-gray-700">Subtotal</span>
                            </div>
                            <span className="text-lg font-black text-gray-800">{formatCurrency(totalOrder)}</span>
                        </div>
                        <button
                            onClick={handleSubmitOrder}
                            disabled={isSubmitting}
                            className="w-full bg-summo-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-summo-primary/20 flex items-center justify-center gap-2 active:scale-95 transition"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} />}
                            ENVIAR PEDIDO ({selectedTable})
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State Footer (Selected Table info) */}
            {view === 'ORDERING' && cart.length === 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Selecionada</p>
                        <p className="font-black text-gray-800 uppercase tracking-tight">{selectedTable}</p>
                    </div>
                    {activeOrdersForTable.length > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-amber-500">Ocupada</p>
                            <p className="font-bold text-gray-800">{activeOrdersForTable.length} pedido(s)</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Waiter;
