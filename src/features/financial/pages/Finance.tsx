
import React, { useState, useMemo } from 'react';
import { StockMovementType } from '../../../types';
import { DollarSign, Loader2, Wallet, FileText, Bike, TrendingUp, CreditCard, ArrowRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useExpenses } from '@/hooks/useExpenses';
import { useApp } from '../../../contexts/AppContext';

// Sub-components
import FinanceCash from '../components/finance/FinanceCash';
import FinanceDRE from '../components/finance/FinanceDRE';
import FinancePayables from '../components/finance/FinancePayables'; // Updated import
import FinanceReceivables from '../components/finance/FinanceReceivables'; // New import
import FinanceDrivers from '../components/finance/FinanceDrivers';

const Finance: React.FC = () => {
    const { data: orders } = useOrders({ limit: 500 });
    const { data: stockMovements } = useStockMovements({ limit: 500 });
    const { data: expenses } = useExpenses({ limit: 500 });
    const { cashRegister } = useApp();

    const [view, setView] = useState<'CASH' | 'DRE' | 'PAYABLES' | 'RECEIVABLES' | 'DRIVERS'>('CASH');
    const [dateRange, setDateRange] = useState<'TODAY' | 'YESTERDAY' | 'MONTH' | 'ALL'>('TODAY');

    const filterDate = React.useCallback((date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const check = new Date(date);
        check.setHours(0, 0, 0, 0);

        if (dateRange === 'TODAY') return check.getTime() === today.getTime();
        if (dateRange === 'YESTERDAY') { const yest = new Date(today); yest.setDate(yest.getDate() - 1); return check.getTime() === yest.getTime(); }
        if (dateRange === 'MONTH') return check.getMonth() === today.getMonth() && check.getFullYear() === today.getFullYear();
        return true;
    }, [dateRange]);

    const filteredOrders = useMemo(() => orders.filter(o => filterDate(new Date(o.createdAt))), [orders, filterDate]);
    const filteredExpenses = useMemo(() => expenses.filter(e => filterDate(new Date(e.date))), [expenses, filterDate]);
    const filteredMovements = useMemo(() => stockMovements.filter(m => filterDate(new Date(m.date))), [stockMovements, filterDate]);

    const revenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
    const cmv = filteredMovements.filter(m => m.type === StockMovementType.SALE || m.type === StockMovementType.LOSS).reduce((acc, m) => acc + m.cost, 0);
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = revenue - cmv - totalExpenses;

    // New KPI for Dashboard Header
    const walletBalance = cashRegister.isOpen ? cashRegister.currentBalance : 0;
    const payablesPending = expenses.filter(e => e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0);

    if (!orders || !stockMovements || !expenses) return <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-full overflow-y-auto space-y-6 animate-fade-in p-4 pb-32 lg:p-8 custom-scrollbar bg-gray-50/50">
            {/* Enterprise Header */}
            <div className="bg-summo-dark text-white p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
                <div className="z-10">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Disponibilidade Operacional</p>
                    <h2 className="text-4xl font-bold flex items-center gap-2">
                        R$ {(walletBalance - payablesPending).toFixed(2)}
                    </h2>
                    <p className="text-xs text-white/50 mt-1">Saldo Caixa - Contas Abertas</p>
                </div>

                <div className="flex gap-4 z-10 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <div className="bg-white/10 p-3 rounded-xl min-w-[120px]">
                        <p className="text-xs text-white/70 font-bold uppercase">Caixa Atual</p>
                        <p className="text-xl font-bold text-green-400">R$ {walletBalance.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl min-w-[120px]">
                        <p className="text-xs text-white/70 font-bold uppercase">A Pagar</p>
                        <p className="text-xl font-bold text-red-400">R$ {payablesPending.toFixed(2)}</p>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <DollarSign size={200} />
                </div>
            </div>

            {/* Taxômetro: Transparency Widget */}
            <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex gap-4 items-center">
                        <div className="bg-orange-100 p-3 rounded-2xl text-summo-primary"><TrendingUp size={30} /></div>
                        <div>
                            <h3 className="text-xl font-black text-gray-800 leading-tight">Taxômetro SUMMO</h3>
                            <p className="text-sm text-gray-500 font-medium">Você pagou <span className="text-red-600 font-bold">R$ {(revenue * 0.12).toFixed(2)}</span> em taxas ocultas este período.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 w-full md:w-auto">
                        <div className="flex-1 md:flex-none">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Taxas Marketplaces</p>
                            <p className="text-lg font-bold text-red-500">R$ {(revenue * 0.08).toFixed(2)}</p>
                        </div>
                        <div className="flex-1 md:flex-none border-l border-gray-100 pl-6">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Tarifas Cartão</p>
                            <p className="text-lg font-bold text-orange-600">R$ {(revenue * 0.04).toFixed(2)}</p>
                        </div>
                    </div>

                    <button className="w-full md:w-auto bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-summo-primary transition-colors shadow-lg shadow-gray-200">
                        Como economizar? <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* View Switcher */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'CASH', label: 'Fluxo de Caixa', icon: Wallet },
                    { id: 'PAYABLES', label: 'Contas a Pagar', icon: FileText },
                    { id: 'RECEIVABLES', label: 'A Receber', icon: CreditCard },
                    { id: 'DRIVERS', label: 'Motoboys', icon: Bike },
                    { id: 'DRE', label: 'DRE Gerencial', icon: TrendingUp }
                ].map(v => {
                    const isActive = view === v.id;
                    return (
                        <button key={v.id} onClick={() => setView(v.id as any)} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition whitespace-nowrap shadow-sm ${isActive ? 'bg-summo-primary text-white shadow-summo-primary/30' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                            <v.icon size={18} /> {v.label}
                        </button>
                    )
                })}
            </div>

            <div className="flex-1 min-h-[400px]">
                {view === 'CASH' && <FinanceCash cashRegister={cashRegister} />}
                {view === 'DRE' && <FinanceDRE revenue={revenue} cmv={cmv} expenses={totalExpenses} netProfit={netProfit} />}
                {view === 'PAYABLES' && <FinancePayables expenses={expenses} />}
                {view === 'RECEIVABLES' && <FinanceReceivables orders={orders} />}
                {view === 'DRIVERS' && <FinanceDrivers orders={filteredOrders} />}
            </div>
        </div>
    );
};

export default React.memo(Finance);
