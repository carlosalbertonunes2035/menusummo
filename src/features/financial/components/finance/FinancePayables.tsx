
import React, { useState, useMemo, memo } from 'react';
import { Expense } from '../../../../types';
import { FINANCIAL_CATEGORIES, COST_CENTERS } from '../../../../constants';
import { Plus, Trash2, X, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';

interface FinancePayablesProps {
    expenses: Expense[];
}

const FinancePayables: React.FC<FinancePayablesProps> = ({ expenses }) => {
    const { handleAction, showToast } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID'>('PENDING');

    const [formData, setFormData] = useState<Partial<Expense>>({
        description: '', amount: 0, category: '', status: 'PENDING', dueDate: new Date()
    });

    const sortedExpenses = useMemo(() => {
        let filtered = expenses;
        if (filterStatus !== 'ALL') {
            filtered = expenses.filter(e => e.status === filterStatus);
        }
        return filtered.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
        });
    }, [expenses, filterStatus]);

    const totalPayable = useMemo(() => expenses.filter(e => e.status === 'PENDING').reduce((acc, e) => acc + e.amount, 0), [expenses]);
    const overdueCount = useMemo(() => expenses.filter(e => e.status === 'PENDING' && e.dueDate && new Date(e.dueDate) < new Date()).length, [expenses]);

    const handleDelete = (id: string) => { if (confirm('Excluir conta?')) handleAction('expenses', 'delete', id); };

    const handlePay = (expense: Expense) => {
        handleAction('expenses', 'update', expense.id, { status: 'PAID', paidAt: new Date() });
        showToast('Conta paga!', 'success');
    };

    const handleSave = () => {
        if (!formData.description || !formData.amount || !formData.category) {
            showToast('Preencha os campos obrigatórios', 'error');
            return;
        }
        handleAction('expenses', 'add', undefined, {
            ...formData,
            id: Date.now().toString(),
            date: new Date(),
            amount: Number(formData.amount),
            status: formData.status || 'PENDING'
        });
        setIsModalOpen(false);
        showToast('Conta lançada', 'success');
    };

    const getCatName = (id: string) => FINANCIAL_CATEGORIES.find(c => c.id === id)?.name || id;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                    <div><p className="text-xs font-bold text-red-500 uppercase">A Pagar (Total)</p><p className="text-2xl font-bold text-red-700">R$ {totalPayable.toFixed(2)}</p></div>
                    <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div><p className="text-xs font-bold text-gray-500 uppercase">Vencidas</p><p className="text-2xl font-bold text-gray-800">{overdueCount}</p></div>
                    <div className="p-3 bg-gray-100 rounded-full text-gray-500"><Calendar size={24} /></div>
                </div>
                <div className="flex items-center justify-end">
                    <button onClick={() => setIsModalOpen(true)} className="bg-summo-dark text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-summo-primary transition flex items-center gap-2 active:scale-95 w-full md:w-auto justify-center"><Plus size={20} /> Nova Conta</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">Contas e Despesas</h3>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                        {['ALL', 'PENDING', 'PAID'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s as any)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${filterStatus === s ? 'bg-summo-bg text-summo-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {s === 'ALL' ? 'Todas' : s === 'PENDING' ? 'Aberto' : 'Pagas'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[700px]">
                        <thead className="bg-white text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold">Vencimento</th>
                                <th className="p-4 font-bold">Descrição</th>
                                <th className="p-4 font-bold">Categoria</th>
                                <th className="p-4 font-bold text-right">Valor</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedExpenses.map(expense => {
                                const isOverdue = expense.status === 'PENDING' && expense.dueDate && new Date(expense.dueDate) < new Date();
                                const isPaid = expense.status === 'PAID';
                                return (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition group">
                                        <td className={`p-4 font-mono font-bold ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>{expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 font-bold text-gray-800">{expense.description}<span className="block text-[10px] font-normal text-gray-400">{expense.supplier || 'Fornecedor não inf.'}</span></td>
                                        <td className="p-4 text-gray-500 text-xs uppercase"><span className="bg-gray-100 px-2 py-1 rounded">{getCatName(expense.category)}</span></td>
                                        <td className="p-4 text-right font-bold text-gray-800">R$ {expense.amount.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {isPaid ? 'PAGO' : isOverdue ? 'VENCIDO' : 'ABERTO'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {!isPaid && <button onClick={() => handlePay(expense)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="Dar Baixa"><CheckCircle2 size={16} /></button>}
                                            <button onClick={() => handleDelete(expense.id)} className="p-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl">Nova Conta / Despesa</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Vencimento</label><input type="date" className="w-full p-3 border rounded-xl" value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, dueDate: new Date(e.target.value + 'T00:00:00') })} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Valor</label><input type="number" className="w-full p-3 border rounded-xl font-bold" placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                <input type="text" className="w-full p-3 border rounded-xl" placeholder="Ex: Conta de Luz" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Categoria (Plano de Contas)</label>
                                <select className="w-full p-3 border rounded-xl bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="">Selecione...</option>
                                    {FINANCIAL_CATEGORIES.filter(c => c.type === 'EXPENSE').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Centro de Custo</label>
                                <select className="w-full p-3 border rounded-xl bg-white" value={formData.costCenter || ''} onChange={e => setFormData({ ...formData, costCenter: e.target.value })}>
                                    <option value="">Geral / Indefinido</option>
                                    {COST_CENTERS.map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Fornecedor (Opcional)</label>
                                <input type="text" className="w-full p-3 border rounded-xl" placeholder="Ex: CPFL, Sabesp..." value={formData.supplier || ''} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" className="w-5 h-5" checked={formData.status === 'PAID'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'PAID' : 'PENDING' })} />
                                <span className="text-sm font-medium">Já está pago?</span>
                            </div>
                            <button onClick={handleSave} className="w-full py-4 bg-summo-primary text-white font-bold rounded-xl shadow-lg mt-4">Salvar Lançamento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(FinancePayables);
