
import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Revenue } from '@/types/finance';
import { revenueService } from '@/services/revenueService';
import { CreditCard, Calendar, AlertCircle, Plus, FilePlus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface FinanceReceivablesProps {
    orders: Order[];
}

const FinanceReceivables: React.FC<FinanceReceivablesProps> = ({ orders }) => {
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [manualRevenues, setManualRevenues] = useState<Revenue[]>([]);
    const [formData, setFormData] = useState({ description: '', amount: 0, date: new Date().toISOString().split('T')[0] });

    // Fetch revenues on mount
    useEffect(() => {
        loadRevenues();
    }, []);

    const loadRevenues = async () => {
        try {
            // Fetch for current month (or broader range if needed)
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

            const data = await revenueService.getRevenues(start, end);
            setManualRevenues(data);
        } catch (error) {
            console.error('Failed to load revenues', error);
        }
    };

    const handleAddRevenue = async () => {
        if (!formData.description || formData.amount <= 0) {
            showToast('Preencha os dados corretamente', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await revenueService.addRevenue({
                description: formData.description,
                amount: formData.amount,
                date: new Date(formData.date),
                status: 'PENDING',
                category: 'manual_entry', // Default for now
            });
            showToast('Receita adicionada!', 'success');
            setIsModalOpen(false);
            setFormData({ description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
            loadRevenues();
        } catch (error) {
            showToast('Erro ao salvar receita', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRevenue = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await revenueService.deleteRevenue(id);
            showToast('Removido!', 'success');
            loadRevenues();
        } catch (error) {
            showToast('Erro ao remover', 'error');
        }
    }

    // --- Calculated Values ---
    const receivables = React.useMemo(() => {
        const creditOrders = orders.filter(o => o.paymentMethod === 'CREDIT_CARD' && o.status !== 'CANCELLED');
        const totalPending = creditOrders.reduce((acc, o) => acc + o.total, 0);

        const upcoming = creditOrders
            .map(o => ({
                id: o.id,
                date: new Date(new Date(o.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000), // D+30
                amount: o.total * 0.959, // Mock fee calc
                originalAmount: o.total
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5);

        return { totalPending, upcoming };
    }, [orders]);

    const tabs = React.useMemo(() => {
        const unpaidTabs = orders.filter(o => o.paymentMethod === 'CREDIT_TAB' && o.status !== 'CANCELLED'); // Assuming status tracks payment
        const totalTabs = unpaidTabs.reduce((acc, o) => acc + o.total, 0);
        return { unpaidTabs, totalTabs };
    }, [orders]);


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-700">Contas a Receber</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2">
                    <Plus size={18} /> Nova Receita
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credit Cards Widget */}
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

                {/* Tabs / Fiado Widget */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" /> Contas de Clientes (Fiado)</h3>
                            <p className="text-xs text-gray-500">Vendas a prazo não quitadas</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400 font-bold uppercase">Total em Aberto</p>
                            <p className="text-2xl font-bold text-orange-600">R$ {tabs.totalTabs.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {tabs.unpaidTabs.length === 0 ? <p className="text-center text-gray-400 py-4">Nenhuma conta em aberto.</p> :
                            tabs.unpaidTabs.map((order) => (
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

            {/* Manual Revenues Section (CONNECTED) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-700">Outras Receitas (Manuais)</h3>
                </div>
                <div className="p-4">
                    {manualRevenues.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                            <FilePlus size={48} className="mb-2 opacity-50" />
                            <p>Nenhuma receita manual lançada.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-2 text-emerald-600 font-bold hover:underline">Adicionar Receita</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b">
                                    <tr>
                                        <th className="p-3">Data</th>
                                        <th className="p-3">Descrição</th>
                                        <th className="p-3 text-right">Valor</th>
                                        <th className="p-3 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manualRevenues.map((r) => (
                                        <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3">{r.date.toLocaleDateString()}</td>
                                            <td className="p-3 font-medium text-gray-700">{r.description}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">R$ {r.amount.toFixed(2)}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleDeleteRevenue(r.id)} className="text-red-400 hover:text-red-600 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for New Revenue */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Nova Receita Extra</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Venda de equipamento, Aporte..."
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Data do Recebimento</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    disabled={isLoading}
                                    onClick={handleAddRevenue}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Receita'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceReceivables;
