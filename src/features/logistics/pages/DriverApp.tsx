import React from 'react';
import { Order, OrderStatus } from '../../../types';
import { MapPin, Navigation, CheckCircle2, DollarSign, Clock, User, Loader2, CreditCard, Banknote } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useDrivers } from '@/hooks/useDrivers';
import { useApp } from '../../../contexts/AppContext';

const DriverApp: React.FC = () => {
    const { data: orders, updateStatus } = useOrders({ limit: 100 });
    const { data: drivers } = useDrivers();

    // For this standalone view, we'll mock selecting the first active driver.
    // In a real multi-user app, this would come from authentication.
    const driver = drivers.find(d => d.active);

    if (!driver) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                    <User size={40} className="mx-auto text-gray-300 mb-3" />
                    <h2 className="font-bold text-lg text-gray-700">Nenhum motorista ativo</h2>
                    <p className="text-sm text-gray-500 mt-1">Cadastre um motorista em Configurações.</p>
                </div>
            </div>
        );
    }

    // Sort by sequence if available
    const myOrders = orders
        .filter((o: typeof orders[number]) => o.driverId === driver.id && o.status === OrderStatus.DELIVERING)
        .sort((a: typeof orders[number], b: typeof orders[number]) => (a.deliverySequence || 999) - (b.deliverySequence || 999));

    const completedToday = orders.filter((o: typeof orders[number]) => o.driverId === driver.id && o.status === OrderStatus.COMPLETED).length;
    const earnings = completedToday * (driver.commission || 5.00);

    const openMaps = (address: string) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    };

    const getPaymentInfo = (order: Order) => {
        const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remaining = order.total - totalPaid;

        if (remaining <= 0.1) { // Floating point tolerance
            return { status: 'PAID', text: 'PAGO ONLINE', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' };
        }

        const isCash = order.change !== undefined || order.payments?.length === 0; // Heuristic
        return {
            status: 'COLLECT',
            text: `COBRAR R$ ${remaining.toFixed(2)}`,
            subtext: isCash ? (order.change ? `Troco p/ R$ ${order.change}` : 'Dinheiro') : 'Cobrar na Entrega',
            icon: isCash ? Banknote : CreditCard,
            color: 'text-red-600',
            bg: 'bg-red-100'
        };
    };

    return (
        <div className="h-full flex flex-col bg-gray-100 pb-safe">
            {/* Header */}
            <div className="bg-summo-dark text-white p-6 rounded-b-3xl shadow-lg z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs opacity-70 uppercase tracking-wider font-bold">Portal do Entregador</p>
                        <h1 className="text-2xl font-bold">Olá, {driver.name.split(' ')[0]} 👋</h1>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full">
                        <User size={24} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-xs opacity-70 mb-1">Entregas Hoje</p>
                        <p className="text-xl font-bold flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> {completedToday}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-xs opacity-70 mb-1">Ganhos (Est.)</p>
                        <p className="text-xl font-bold flex items-center gap-2"><DollarSign size={16} className="text-yellow-400" /> R$ {earnings.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Active Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h2 className="font-bold text-gray-600 uppercase text-sm ml-1">Em Rota ({myOrders.length})</h2>

                {myOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <MapPin size={48} className="mb-2 opacity-20" />
                        <p>Nenhuma entrega pendente.</p>
                        <p className="text-xs">Aguarde novos pedidos da loja.</p>
                    </div>
                ) : (
                    myOrders.map((order: typeof myOrders[number], index: number) => {
                        const paymentInfo = getPaymentInfo(order);
                        const PaymentIcon = paymentInfo.icon;

                        return (
                            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-summo-primary"></div>

                                {/* Sequence Badge */}
                                {order.deliverySequence && (
                                    <div className="absolute top-0 right-0 bg-summo-primary text-white px-3 py-1 rounded-bl-xl font-bold text-sm shadow-sm">
                                        PARADA #{order.deliverySequence}
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3 mt-4">
                                    <div>
                                        <span className="font-bold text-lg text-gray-800">#{order.id.slice(-4)}</span>
                                        <p className="text-gray-600 font-medium">{order.customerName}</p>
                                    </div>
                                </div>

                                <div className={`p-3 rounded-xl mb-4 border flex items-center justify-between ${paymentInfo.bg} ${paymentInfo.color.replace('text-', 'border-').replace('600', '200')}`}>
                                    <div>
                                        <span className={`font-black text-lg block ${paymentInfo.color}`}>{paymentInfo.text}</span>
                                        {paymentInfo.subtext && <span className="text-xs font-bold opacity-80">{paymentInfo.subtext}</span>}
                                    </div>
                                    <div className={`p-2 rounded-full bg-white/50 ${paymentInfo.color}`}>
                                        <PaymentIcon size={24} />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                                    <div className="flex items-start gap-2 text-sm text-gray-700">
                                        <MapPin size={16} className="text-summo-primary flex-shrink-0 mt-0.5" />
                                        <p>{order.deliveryAddress}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openMaps(order.deliveryAddress || '')}
                                        className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                                    >
                                        <Navigation size={18} /> Navegar
                                    </button>
                                    <button
                                        onClick={() => updateStatus({ orderId: order.id, status: OrderStatus.COMPLETED })}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition"
                                    >
                                        <CheckCircle2 size={18} /> Entregue
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default DriverApp;
