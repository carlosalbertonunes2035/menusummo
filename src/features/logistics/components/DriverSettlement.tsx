
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Driver } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { useDrivers } from '@/hooks/useDrivers';
import { Calculator, Calendar, CheckCircle, ChevronDown, DollarSign, Download, Filter, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists or I use Intl
import { toast } from 'react-hot-toast';

export const DriverSettlement: React.FC = () => {
    // 1. Data
    const { data: drivers } = useDrivers();
    const { data: allOrders } = useOrders({ limit: 500 }); // Fetch enough history

    // 2. State
    const [selectedDriverId, setSelectedDriverId] = useState<string>('all');
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // 3. Logic
    const settlementData = useMemo(() => {
        const start = new Date(dateRange.start); start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.end); end.setHours(23, 59, 59, 999);

        // Filter orders: Completed, In Date Range, Matches Driver
        const relevantOrders = allOrders.filter(o =>
            o.status === OrderStatus.COMPLETED &&
            o.type === 'DELIVERY' &&
            o.driverId &&
            (selectedDriverId === 'all' || o.driverId === selectedDriverId) &&
            new Date(o.createdAt) >= start &&
            new Date(o.createdAt) <= end
        );

        // Group by Driver
        const driverStats: Record<string, {
            driver: Driver | undefined;
            deliveries: number;
            totalOrderValue: number;
            commissionTotal: number;
            cashCollected: number; // Order total if payment was CASH (approx)
            onlinePaid: number;
            payable: number; // What we owe driver (Commission)
            receivable: number; // What driver owes us (Cash Collected)
            balance: number; // Net: Payable - Receivable. Positive = We pay Driver. Negative = Driver pays us.
            orders: Order[];
        }> = {};

        relevantOrders.forEach(order => {
            if (!order.driverId) return;
            if (!driverStats[order.driverId]) {
                driverStats[order.driverId] = {
                    driver: drivers.find(d => d.id === order.driverId),
                    deliveries: 0,
                    totalOrderValue: 0,
                    commissionTotal: 0,
                    cashCollected: 0,
                    onlinePaid: 0,
                    payable: 0,
                    receivable: 0,
                    balance: 0,
                    orders: []
                };
            }

            const stats = driverStats[order.driverId];
            stats.deliveries++;
            stats.totalOrderValue += order.total;
            stats.orders.push(order);

            // Commission Calculation
            // Priority: Driver Specific Fee set in order (snapshot) -> Driver Default -> Global Default
            // Assuming driver.commission is fixed fee per delivery.
            const commission = stats.driver?.commission || 5.00;
            stats.commissionTotal += commission;
            stats.payable += commission;

            // Cash Collection Logic
            // If payment method is CASH or generic 'money', driver holds it.
            // If ONLINE (Card, Pix), restaurant holds it.
            const isCash = order.paymentMethod === 'CASH' || !order.paymentMethod; // Fallback
            if (isCash) {
                stats.cashCollected += order.total;
                stats.receivable += order.total;
            } else {
                stats.onlinePaid += order.total;
            }
        });

        // Calculate final balance
        Object.values(driverStats).forEach(s => {
            s.balance = s.payable - s.receivable;
        });

        return Object.values(driverStats);
    }, [allOrders, drivers, selectedDriverId, dateRange]);

    const totalBalance = settlementData.reduce((acc, s) => acc + s.balance, 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-48">
                        <label className="text-xs font-bold text-gray-500 uppercase">Motorista</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
                            value={selectedDriverId}
                            onChange={e => setSelectedDriverId(e.target.value)}
                        >
                            <option value="all">Todos os Motoristas</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 md:w-auto flex gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">De</label>
                            <input type="date" className="p-2 border rounded-lg" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Até</label>
                            <input type="date" className="p-2 border rounded-lg" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Balanço do Período</p>
                    <h2 className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {totalBalance >= 0 ? 'A Pagar: ' : 'A Receber: '}
                        R$ {Math.abs(totalBalance).toFixed(2)}
                    </h2>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {settlementData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Wallet size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Nenhuma entrega no período.</p>
                    </div>
                ) : (
                    settlementData.map((data, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {data.driver?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{data.driver?.name}</h3>
                                        <p className="text-xs text-gray-500">{data.deliveries} entregas realizadas</p>
                                    </div>
                                </div>
                                <div className={`text-right px-3 py-1 rounded-lg ${data.balance >= 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    <p className="text-xs font-bold uppercase">Resultado</p>
                                    <p className="font-bold text-lg">
                                        {data.balance >= 0 ? 'Pagar Motorista' : 'Receber do Motorista'} <br />
                                        R$ {Math.abs(data.balance).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Total Entregue (Valor Pedidos)</p>
                                    <p className="font-bold text-gray-800 text-lg">R$ {data.totalOrderValue.toFixed(2)}</p>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Em Dinheiro (Mão):</span>
                                            <span className="font-bold text-orange-600">R$ {data.cashCollected.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Online (Pix/Card):</span>
                                            <span className="font-bold text-blue-600">R$ {data.onlinePaid.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-l pl-6">
                                    <p className="text-gray-500 mb-1">Comissão (Ganhos)</p>
                                    <p className="font-bold text-green-600 text-lg">+ R$ {data.commissionTotal.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 mt-1">Base: R$ {data.driver?.commission?.toFixed(2) || '5.00'} / entrega</p>
                                </div>

                                <div className="border-l pl-6">
                                    <p className="text-gray-500 mb-1">Cálculo Final</p>
                                    <div className="space-y-1 mt-2">
                                        <div className="flex justify-between">
                                            <span>Comissão (+):</span>
                                            <span className="font-bold text-green-600">R$ {data.commissionTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Dinheiro na Mão (-):</span>
                                            <span className="font-bold text-red-600">R$ {data.cashCollected.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                                            <span>Saldo:</span>
                                            <span className={data.balance >= 0 ? 'text-red-600' : 'text-green-600'}>Use R$ {Math.abs(data.balance).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accordion for Details could go here */}
                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                <button className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto">
                                    <ChevronDown size={14} /> Ver Detalhes dos Pedidos
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition text-sm">
                    <Download size={16} /> Imprimir Acerto
                </button>
            </div>
        </div>
    );
};
