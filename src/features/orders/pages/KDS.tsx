import React, { useCallback, useMemo, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus, OrderType } from '@/types';
import { useApp } from '@/contexts/AppContext';
import KDSCard from '../components/kds/KDSCard';
import { Clock, CalendarDays } from 'lucide-react';

const KDS: React.FC = () => {
    const { data: orders, loading, updateStatus } = useOrders({ limit: 100 });
    const { settings } = useApp();

    const [activeView, setActiveView] = useState<'PRODUCTION' | 'FUTURE'>('PRODUCTION');

    const { productionOrders, futureOrders } = useMemo(() => {
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const prepTimeMs = (settings.kitchen?.preparationTime || 20) * 60000;
        const bufferMs = (settings.kitchen?.safetyBuffer || 10) * 60000;
        const totalLeadMs = prepTimeMs + bufferMs;

        const production: Order[] = [];
        const future: Order[] = [];

        orders.forEach(o => {
            // Ignore completed/cancelled for KDS active view
            if (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED) return;

            // If no schedule, it's immediate -> Production
            if (!o.scheduledTo) {
                production.push(o);
                return;
            }

            const scheduledTime = new Date(o.scheduledTo).getTime();
            const displayTime = scheduledTime - totalLeadMs;

            // If current time is past display time, show in Production
            // Also check if status is already advanced beyond PENDING, which implies work started
            if (now >= displayTime || o.status !== OrderStatus.PENDING) {
                production.push(o);
            } else {
                future.push(o);
            }
        });

        return {
            productionOrders: production.sort((a, b) => {
                // Sort by urgency: Scheduled items close to deadline first, then oldest immediate orders
                const timeA = a.scheduledTo ? new Date(a.scheduledTo).getTime() : new Date(a.createdAt).getTime();
                const timeB = b.scheduledTo ? new Date(b.scheduledTo).getTime() : new Date(b.createdAt).getTime();
                return timeA - timeB;
            }),
            futureOrders: future.sort((a, b) => new Date(a.scheduledTo!).getTime() - new Date(b.scheduledTo!).getTime())
        };
    }, [orders, settings.kitchen]);

    const [mobileActiveStatus, setMobileActiveStatus] = useState<OrderStatus>(OrderStatus.PENDING);

    // KDS Styling Logic
    const theme = {
        bg: 'bg-gray-100',
        headerBg: 'bg-white border-gray-200',
        text: 'text-gray-800',
        subText: 'text-gray-500',
        cardBg: 'bg-white border-gray-200',
        columnPending: 'bg-gray-100 border-gray-200',
        columnPreparing: 'bg-blue-50 border-blue-200',
        columnReady: 'bg-green-50 border-green-200',
        headerTextPending: 'text-gray-600',
        headerTextPreparing: 'text-blue-600',
        headerTextReady: 'text-green-600'
    };

    const columns = useMemo(() => {
        const baseColumns = [
            { id: OrderStatus.PENDING, title: 'Fila / Pendente', className: theme.columnPending, headerColor: theme.headerTextPending },
            { id: OrderStatus.PREPARING, title: 'Em Preparo', className: theme.columnPreparing, headerColor: theme.headerTextPreparing },
            { id: OrderStatus.READY, title: 'Pronto / Aguardando', className: theme.columnReady, headerColor: theme.headerTextReady }
        ];

        if (settings.interface?.showReadyColumn === false) {
            return baseColumns.filter(c => c.id !== OrderStatus.READY);
        }
        return baseColumns;

    }, [settings.interface?.showReadyColumn]);

    const advanceOrder = useCallback((order: Order) => {
        if (order.status === OrderStatus.PENDING) updateStatus({ orderId: order.id, status: OrderStatus.PREPARING });
        else if (order.status === OrderStatus.PREPARING) updateStatus({ orderId: order.id, status: OrderStatus.READY });
        else if (order.status === OrderStatus.READY) {
            const next = order.type !== OrderType.DELIVERY ? OrderStatus.COMPLETED : OrderStatus.DELIVERING;
            updateStatus({ orderId: order.id, status: next });
        }
    }, [updateStatus]);

    return (
        <div className={`h-full flex flex-col ${theme.bg} transition-colors duration-300`}>
            {/* Header / Toggle */}
            <div className={`${theme.headerBg} border-b p-4 flex justify-between items-center shadow-sm z-10 transition-colors duration-300`}>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${theme.text}`}>
                    <Clock className="text-summo-primary" /> KDS Cozinha
                </h2>

                <div className="flex gap-2">
                    <div className="flex p-1 rounded-lg bg-gray-100">
                        <button
                            onClick={() => setActiveView('PRODUCTION')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition flex items-center gap-2 ${activeView === 'PRODUCTION' ? ('bg-white shadow text-summo-primary') : ('text-gray-500')}`}
                        >
                            <Clock size={16} /> Produção ({productionOrders.length})
                        </button>
                        <button
                            onClick={() => setActiveView('FUTURE')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition flex items-center gap-2 ${activeView === 'FUTURE' ? ('bg-white shadow text-summo-primary') : ('text-gray-500')}`}
                        >
                            <CalendarDays size={16} /> Futuros ({futureOrders.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs (Only shown in Production View) */}
            {activeView === 'PRODUCTION' && (
                <div className={`lg:hidden p-4 border-b shadow-sm ${theme.headerBg}`}>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {columns.map(col => {
                            const count = productionOrders.filter(o => o.status === col.id).length;
                            const isActive = mobileActiveStatus === col.id;
                            return (
                                <button key={col.id} onClick={() => setMobileActiveStatus(col.id as OrderStatus)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition ${isActive ? 'bg-summo-dark text-white border-summo-dark' : 'bg-white text-gray-600 border-gray-200'}`}>
                                    {col.title}
                                    {count > 0 && <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden lg:p-6 relative">
                {activeView === 'PRODUCTION' ? (
                    <div className="flex lg:gap-6 h-full min-w-[1000px] lg:min-w-0 overflow-x-auto lg:overflow-visible p-4 lg:p-0">
                        {columns.map(col => {
                            const columnOrders = productionOrders.filter(o => o.status === col.id);
                            const isHiddenOnMobile = mobileActiveStatus !== col.id;
                            return (
                                <div key={col.id} className={`flex-1 flex-col rounded-2xl lg:p-4 lg:border shadow-sm ${col.className} ${isHiddenOnMobile ? 'hidden lg:flex' : 'flex h-full'} transition-colors duration-300`}>
                                    <div className="hidden lg:flex justify-between items-center mb-4 px-1">
                                        <h3 className={`font-bold text-lg uppercase tracking-wide ${col.headerColor}`}>{col.title}</h3>
                                        <span className="px-3 py-1 rounded-full font-mono text-sm font-bold shadow-sm bg-white/60 text-gray-700">
                                            {columnOrders.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-4 p-2 lg:p-0 lg:pr-2 custom-scrollbar">
                                        {columnOrders.map(order => (
                                            <KDSCard key={order.id} order={order} advanceOrder={advanceOrder} />
                                        ))}
                                        {columnOrders.length === 0 && <div className="text-center pt-10 text-gray-400">Nenhum pedido aqui.</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-4 lg:p-0">
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="border p-4 rounded-xl flex items-start gap-3 bg-blue-50 border-blue-200">
                                <CalendarDays className="text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-bold text-blue-800">Agendamentos Futuros</h3>
                                    <p className="text-sm text-blue-600">Estes pedidos aparecerão na tela de Produção automaticamente {settings.kitchen?.preparationTime + settings.kitchen?.safetyBuffer} minutos antes do horário agendado.</p>
                                </div>
                            </div>

                            {futureOrders.length === 0 ? (
                                <div className={`text - center py - 20 font - bold ${theme.subText} `}>Sem pedidos agendados para o futuro.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {futureOrders.map(order => (
                                        <div key={order.id} className="p-4 rounded-xl border shadow-sm opacity-75 hover:opacity-100 transition bg-white border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-gray-800">#{order.id.slice(-4)}</span>
                                                <span className="text-xs px-2 py-1 rounded font-bold bg-gray-100 text-gray-600">
                                                    Para: {new Date(order.scheduledTo!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="font-medium mb-2 text-gray-800">{order.customerName}</p>
                                            <div className="text-sm space-y-1 p-2 rounded bg-gray-50 text-gray-500">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span>{item.quantity}x {item.productName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 text-xs text-center font-bold border-t pt-2 text-summo-primary border-gray-100">
                                                Entra em produção às {new Date(new Date(order.scheduledTo!).getTime() - ((settings.kitchen?.preparationTime + settings.kitchen?.safetyBuffer) * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(KDS);
