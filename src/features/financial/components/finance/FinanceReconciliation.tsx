
import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useFinanceQuery } from '@/lib/react-query/queries/useFinanceQuery';
import { CheckCircle2, Circle, Calendar, Filter, DollarSign, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming custom util or internal
import { Revenue, Expense } from '@/types/finance';

// Helper to normalize data for "Ledger" view
interface LedgerItem {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    status: 'COMPLETED' | 'PENDING' | 'SCHEDULED';
    originalRef: Revenue | Expense;
}

export const FinanceReconciliation: React.FC = () => {
    // 1. Contexts
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { revenues, expenses, saveExpense, saveRevenue } = useFinanceQuery(tenantId);

    // 2. State
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [hideReconciled, setHideReconciled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 3. Computed Ledger
    const ledger = useMemo(() => {
        const items: LedgerItem[] = [];

        revenues.forEach(r => {
            items.push({
                id: r.id,
                date: r.date,
                description: r.description || 'Receita',
                amount: r.amount,
                type: 'INCOME',
                category: r.category,
                status: r.status, // Assuming Revenue/Expense has status field now
                originalRef: r
            });
        });

        expenses.forEach(e => {
            items.push({
                id: e.id,
                date: e.date,
                description: e.description || 'Despesa',
                amount: e.amount,
                type: 'EXPENSE',
                category: e.category,
                status: e.status || 'PENDING',
                originalRef: e
            });
        });

        // Sort by Date DESC
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [revenues, expenses]);

    // 4. Filtering
    const filteredLedger = useMemo(() => {
        return ledger.filter(item => {
            const matchDate = item.date.startsWith(filterDate);
            const matchSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchHide = hideReconciled ? item.status !== 'COMPLETED' : true;
            return matchDate && matchSearch && matchHide;
        });
    }, [ledger, filterDate, searchTerm, hideReconciled]);

    // 5. Actions
    const toggleReconcile = async (item: LedgerItem) => {
        const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            if (item.type === 'INCOME') {
                await saveRevenue({ id: item.id, status: newStatus });
            } else {
                await saveExpense({ id: item.id, status: newStatus });
            }
            showToast(newStatus === 'COMPLETED' ? 'Conciliado!' : 'Marcado como Pendente', 'success');
        } catch (e) {
            showToast("Erro ao atualizar status", "error");
        }
    };

    // 6. Stats
    const stats = useMemo(() => {
        const pending = filteredLedger.filter(i => i.status === 'PENDING').length;
        const balance = filteredLedger.reduce((acc, i) => {
            if (i.status !== 'COMPLETED') return acc; // Only count REAL money
            return acc + (i.type === 'INCOME' ? i.amount : -i.amount);
        }, 0);
        return { pending, balance };
    }, [filteredLedger]);

    return (
        <div className="space-y-6 animate-fade-in p-1">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-xs font-bold text-gray-500 uppercase">Mês de Referência</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="month"
                            className="p-2 border rounded-lg font-bold text-gray-700 bg-gray-50"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                        <button
                            onClick={() => setHideReconciled(!hideReconciled)}
                            className={`p-2 px-4 rounded-lg text-xs font-bold border transition ${hideReconciled ? 'bg-summo-primary text-white border-summo-primary' : 'bg-white text-gray-500 border-gray-200'}`}
                        >
                            {hideReconciled ? 'Vendo Apenas Pendentes' : 'Ver Tudo'}
                        </button>
                    </div>
                </div>

                <div className="w-full md:w-64 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar transação..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="text-right pl-4 border-l border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase">Saldo Conciliado (Real)</p>
                    <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        R$ {Math.abs(stats.balance).toFixed(2)}
                    </p>
                    {stats.pending > 0 && <p className="text-xs text-orange-500 font-bold mt-1">{stats.pending} pendências</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="p-4 w-12 text-center">OK</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLedger.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma transação encontrada.</td></tr>
                            ) : filteredLedger.map(item => (
                                <tr key={item.id} className={`hover:bg-gray-50 transition border-l-4 ${item.status === 'COMPLETED' ? 'border-l-green-500 bg-green-50/20' : 'border-l-transparent'}`}>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleReconcile(item)}
                                            className={`transition ${item.status === 'COMPLETED' ? 'text-green-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
                                        >
                                            {item.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800">
                                        {item.description}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg whitespace-nowrap">
                                        <span className={`flex items-center justify-end gap-1 ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                            {item.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            R$ {item.amount.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
