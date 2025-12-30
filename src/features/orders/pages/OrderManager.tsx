
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Order, OrderStatus, OrderType } from '../../../types';
import { Search, ChefHat, Truck, AlertCircle, Plus, CheckCircle2, History, Eye, Calendar } from 'lucide-react';
import OrderTicket from '../components/OrderTicket';
import OrderCard from '../components/OrderCard';
import OrderDetailModal from '../components/OrderDetailModal';
import { getChannelInfo, getPaymentLabel } from '../components/OrderManagerUtils';
import { searchMatch, formatCurrency } from '../../../lib/utils';
import { useDebounce } from '../../../lib/hooks';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useApp } from '../../../contexts/AppContext';
import { printingService } from '../../../services/printingService';
import { useOrders } from '../../../hooks/useOrders';

type HistoryDateRange = 'TODAY' | 'YESTERDAY' | '7D' | 'MONTH' | 'ALL';

const OrderManager: React.FC = () => {
    const { settings, tenantId } = useApp();
    const { data: orders, loading: ordersLoading, updateStatus } = useOrders({ limit: 200 });
    const { products } = useProductsQuery(tenantId);

    // PERSISTENCE: Initialize from sessionStorage to maintain context on tab switch
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('om_search') || '';
        return '';
    });
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>(() => {
        if (typeof window !== 'undefined') return (sessionStorage.getItem('om_view') as 'ACTIVE' | 'HISTORY') || 'ACTIVE';
        return 'ACTIVE';
    });
    const [historyDateRange, setHistoryDateRange] = useState<HistoryDateRange>(() => {
        if (typeof window !== 'undefined') return (sessionStorage.getItem('om_date_range') as HistoryDateRange) || 'TODAY';
        return 'TODAY';
    });

    // PERSISTENCE: Save state changes
    useEffect(() => { sessionStorage.setItem('om_search', searchQuery); }, [searchQuery]);
    useEffect(() => { sessionStorage.setItem('om_view', viewMode); }, [viewMode]);
    useEffect(() => { sessionStorage.setItem('om_date_range', historyDateRange); }, [historyDateRange]);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [printModeSelect, setPrintModeSelect] = useState<string | null>(null);
    const [activePrintMode, setActivePrintMode] = useState<'CUSTOMER' | 'KITCHEN'>('CUSTOMER');

    // --- CORE LOGIC ---
    const smartAdvanceStatus = useCallback((order: Order) => {
        let next: OrderStatus | null = null;
        switch (order.status) {
            case OrderStatus.PENDING: next = OrderStatus.PREPARING; break;
            case OrderStatus.PREPARING: next = OrderStatus.READY; break;
            case OrderStatus.READY: next = order.type !== OrderType.DELIVERY ? OrderStatus.COMPLETED : OrderStatus.DELIVERING; break;
            case OrderStatus.DELIVERING: next = OrderStatus.COMPLETED; break;
            default: break;
        }
        if (next) {
            updateStatus({ orderId: order.id, status: next });

            // Auto-print to Kitchen when approved/preparing
            if (next === OrderStatus.PREPARING) {
                printingService.printOrder(order, products, settings, tenantId, 'KITCHEN');
            }
        }
    }, [updateStatus, products, settings, tenantId]);

    const getActionButtonLabel = useCallback((order: Order) => {
        switch (order.status) {
            case OrderStatus.PENDING: return 'Enviar p/ Cozinha';
            case OrderStatus.PREPARING: return 'Marcar Pronto';
            case OrderStatus.READY: return order.type === OrderType.DELIVERY ? 'Despachar Moto 🛵' : 'Entregar Cliente 🤲';
            case OrderStatus.DELIVERING: return 'Concluir Entrega';
            default: return 'Avançar';
        }
    }, []);

    const initiatePrint = useCallback((order: Order, mode: 'CUSTOMER' | 'KITCHEN') => {
        // Try local agent first
        printingService.printOrder(order, products, settings, tenantId, mode === 'CUSTOMER' ? 'ORDER' : 'KITCHEN');

        // Also show on-screen for browser print fallback
        setPrintingOrder(order);
        setPrintModeSelect(null);
        setActivePrintMode(mode);
    }, [products, settings, tenantId]);

    const handleCancel = useCallback((id: string) => updateStatus({ orderId: id, status: OrderStatus.CANCELLED }), [updateStatus]);
    const handlePrintSelect = useCallback((id: string) => setPrintModeSelect(id), []);

    // Columns for Kanban (Active Mode)
    const activeColumns = useMemo(() => {
        const base = [
            { id: OrderStatus.PENDING, label: 'Aprovando', shortLabel: 'Pendente', color: 'bg-gray-100', icon: AlertCircle },
            { id: OrderStatus.PREPARING, label: 'Cozinha', shortLabel: 'Preparo', color: 'bg-orange-50', icon: ChefHat },
            { id: OrderStatus.READY, label: 'Pronto', shortLabel: 'Pronto', color: 'bg-green-50', icon: CheckCircle2 },
            { id: OrderStatus.DELIVERING, label: 'Em Entrega', shortLabel: 'Rota', color: 'bg-blue-50', icon: Truck },
        ];
        return base.filter(c => c.id !== OrderStatus.READY || settings.interface?.showReadyColumn !== false);
    }, [settings.interface]);

    const filteredOrders = useMemo(() => {
        const isHistory = viewMode === 'HISTORY';

        return orders.filter(o => {
            // 1. Filter by Status (Active vs History)
            const isArchivedStatus = o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED;
            if (isHistory && !isArchivedStatus) return false;
            if (!isHistory && isArchivedStatus) return false;

            // 2. Filter by Search Query
            const matchesSearch = searchMatch(o.customerName, debouncedSearch) ||
                o.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                o.items.some(i => searchMatch(i.productName, debouncedSearch));

            if (!matchesSearch) return false;

            // 3. Filter by Date Range (ONLY applies if NOT searching deeply and IS History mode)
            // If the user searches for an ID, we ignore the date range to find it anywhere.
            if (isHistory && debouncedSearch.length < 2) {
                const orderDate = new Date(o.createdAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (historyDateRange) {
                    case 'TODAY':
                        if (orderDate < today) return false;
                        break;
                    case 'YESTERDAY': {
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (orderDate < yesterday || orderDate >= today) return false;
                        break;
                    }
                    case '7D': {
                        const sevenDaysAgo = new Date(today);
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        if (orderDate < sevenDaysAgo) return false;
                        break;
                    }
                    case 'MONTH':
                        if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false;
                        break;
                    case 'ALL':
                        // No filter
                        break;
                }
            }

            return true;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
    }, [orders, debouncedSearch, viewMode, historyDateRange]);



    return (
        <div className="h-full flex flex-col animate-fade-in bg-gray-50/50">
            {/* Controls Header */}
            <div className="flex flex-col gap-4 p-4 md:p-6 bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-20">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Pedidos</h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
                            <button onClick={() => setViewMode('ACTIVE')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap flex items-center gap-1 ${viewMode === 'ACTIVE' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}><Truck size={14} /> Em Aberto</button>
                            <button onClick={() => setViewMode('HISTORY')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap flex items-center gap-1 ${viewMode === 'HISTORY' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}><History size={14} /> Histórico</button>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none text-gray-800 transition" placeholder="Buscar ID, nome ou item..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <button onClick={() => { }} className="bg-summo-primary text-white px-4 md:px-6 py-2.5 rounded-xl font-bold hover:bg-summo-dark shadow-lg shadow-summo-primary/20 flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap">
                            <Plus size={20} /> <span className="hidden sm:inline">Novo</span>
                        </button>
                    </div>
                </div>

                {/* Sub-Filters for History Mode */}
                {viewMode === 'HISTORY' && (
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap"><Calendar size={14} /> Período:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['TODAY', 'YESTERDAY', '7D', 'MONTH', 'ALL'] as HistoryDateRange[]).map(range => (
                                <button key={range} onClick={() => setHistoryDateRange(range)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap ${historyDateRange === range ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}>
                                    {range === 'TODAY' ? 'Hoje' : range === 'YESTERDAY' ? 'Ontem' : range === '7D' ? '7 Dias' : range === 'MONTH' ? 'Este Mês' : 'Tudo'}
                                </button>
                            ))}
                        </div>
                        {debouncedSearch.length > 2 && <span className="text-xs text-orange-500 font-bold animate-pulse">• Filtrando por busca global</span>}
                    </div>
                )}
            </div>

            {/* --- KANBAN BOARD AREA (Active Mode) --- */}
            {viewMode === 'ACTIVE' && (
                <div className="flex-1 overflow-x-hidden md:overflow-x-auto bg-gray-100 p-2 md:p-6 custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full md:min-w-[1000px]">
                        {activeColumns.map(col => (
                            <div key={col.id} className={`flex-1 flex-col rounded-2xl ${col.color} p-2 md:p-4 border border-transparent shadow-sm md:shadow-none flex h-full`}>
                                <div className="hidden md:flex items-center gap-2 mb-4 font-bold text-gray-600 uppercase text-xs tracking-wider">
                                    <div className="p-2 bg-white rounded-lg shadow-sm"><col.icon size={16} /></div> {col.label} <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs border border-gray-100">{filteredOrders.filter(o => o.status === col.id).length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2 custom-scrollbar pb-24 md:pb-0 render-auto">
                                    {filteredOrders.filter(o => o.status === col.id).length === 0 ? (
                                        <div className="h-40 flex flex-col items-center justify-center text-gray-400 opacity-60"><col.icon size={32} className="mb-2" /><p className="text-xs font-medium">Vazio</p></div>
                                    ) : (
                                        filteredOrders.filter(o => o.status === col.id).map(order => (
                                            <div key={order.id} className="render-auto">
                                                <OrderCard
                                                    order={order}
                                                    isArchived={false}
                                                    onUpdateStatus={(id, status) => updateStatus({ orderId: id, status })}
                                                    onCancel={handleCancel}
                                                    onPrintSelect={handlePrintSelect}
                                                    onInitiatePrint={initiatePrint}
                                                    printModeSelectId={printModeSelect}
                                                    smartAdvanceStatus={smartAdvanceStatus}
                                                    getActionButtonLabel={getActionButtonLabel}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TABLE LIST AREA (History Mode) --- */}
            {viewMode === 'HISTORY' && (
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 custom-scrollbar">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Pedido</th>
                                        <th className="p-4">Data/Hora</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Canal</th>
                                        <th className="p-4">Pagamento</th>
                                        <th className="p-4 text-right">Total</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.length === 0 ? (
                                        <tr><td colSpan={8} className="p-10 text-center text-gray-400">Nenhum pedido encontrado neste período.</td></tr>
                                    ) : filteredOrders.map(order => {
                                        const channel = getChannelInfo(order);
                                        const isCancelled = order.status === OrderStatus.CANCELLED;
                                        return (
                                            <tr key={order.id} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                                <td className="p-4 font-bold text-gray-800">#{order.id.slice(-4)}</td>
                                                <td className="p-4 text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()} <span className="text-gray-300">|</span> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-4 font-medium text-gray-700">{order.customerName}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${channel.color}`}>
                                                        <channel.icon size={12} /> {channel.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600 text-xs">
                                                    {getPaymentLabel(order)}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-gray-800">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold border ${isCancelled ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                        {isCancelled ? 'CANCELADO' : 'CONCLUÍDO'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-summo-primary hover:text-white transition shadow-sm flex items-center gap-2 mx-auto"
                                                    >
                                                        <Eye size={14} /> Detalhes
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">Exibindo {filteredOrders.length} pedidos do histórico.</p>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onPrint={() => { initiatePrint(selectedOrder, 'CUSTOMER'); }}
                />
            )}

            {printingOrder && <OrderTicket order={printingOrder} settings={settings} mode={activePrintMode} onClose={() => setPrintingOrder(null)} />}
        </div>
    );
};

export default React.memo(OrderManager);
