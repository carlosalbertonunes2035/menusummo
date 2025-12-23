
import React, { useMemo, memo } from 'react';
import { Order, PaymentMethod, OrderStatus } from '../../../../types';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface FinanceReceivablesProps {
    orders: Order[];
}

const FinanceReceivables: React.FC<FinanceReceivablesProps> = ({ orders }) => {

    const receivables = useMemo(() => {
        const creditOrders = orders.filter(o =>
            o.status !== OrderStatus.CANCELLED &&
            o.payments.some(p => p.method === PaymentMethod.CREDIT_CARD)
        );

        let totalPending = 0;
        const upcoming: any[] = [];

        creditOrders.forEach(order => {
            const creditPayment = order.payments.find(p => p.method === PaymentMethod.CREDIT_CARD);
            if (creditPayment) {
                // Simulate D+30 Rule
                const saleDate = new Date(order.createdAt);
                const receiveDate = new Date(saleDate);
                receiveDate.setDate(saleDate.getDate() + 30);

                // Assume 3.5% Fee
                const netAmount = creditPayment.amount * 0.965;
                totalPending += netAmount;

                upcoming.push({
                    id: order.id,
                    date: receiveDate,
                    amount: netAmount,
                    originalAmount: creditPayment.amount,
                    customer: order.customerName
                });
            }
        });

        return { totalPending, upcoming: upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()) };
    }, [orders]);

    const unpaidTabs = useMemo(() => {
        return orders.filter(o =>
            o.status !== OrderStatus.CANCELLED &&
            o.payments.some(p => p.method === PaymentMethod.CREDIT_TAB)
        );
    }, [orders]);

    const totalTabs = unpaidTabs.reduce((acc, o) => acc + o.total, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Credit Card Receivables */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><CreditCard size={20} className="text-blue-500" /> Cartão de Crédito</h3>
                        <p className="text-xs text-gray-500">Valores a receber (Estimado D+30)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 font-bold uppercase">Total Previsto</p>
                        <p className="text-2xl font-bold text-blue-600">R$ {receivables.totalPending.toFixed(2)}</p>
                    </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {receivables.upcoming.length === 0 ? <p className="text-center text-gray-400 py-4">Nenhum recebimento futuro.</p> :
                        receivables.upcoming.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="font-bold text-gray-700 text-sm flex items-center gap-2"><Calendar size={12} /> {item.date.toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">Ref. Pedido #{item.id.slice(-4)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-700">R$ {item.amount.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-400 line-through">R$ {item.originalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Fiado / Tabs */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" /> Contas de Clientes (Fiado)</h3>
                        <p className="text-xs text-gray-500">Vendas a prazo não quitadas</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 font-bold uppercase">Total em Aberto</p>
                        <p className="text-2xl font-bold text-orange-600">R$ {totalTabs.toFixed(2)}</p>
                    </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {unpaidTabs.length === 0 ? <p className="text-center text-gray-400 py-4">Nenhuma conta em aberto.</p> :
                        unpaidTabs.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{order.customerName}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="font-bold text-orange-600">R$ {order.total.toFixed(2)}</span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default memo(FinanceReceivables);
