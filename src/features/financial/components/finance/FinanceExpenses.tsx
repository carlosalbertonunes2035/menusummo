import React, { useState, useEffect } from 'react';
import { Expense } from '../../../../types';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useFinanceQuery } from '@/lib/react-query/queries/useFinanceQuery';
import { FINANCIAL_CATEGORIES } from '../../../../constants';

interface FinanceExpensesProps {
    expenses: Expense[];
}

const FinanceExpenses: React.FC<FinanceExpensesProps> = ({ expenses }) => {
    const { tenantId } = useApp();
    const { saveExpense: saveExpenseMutation, deleteExpense } = useFinanceQuery(tenantId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
    });

    const onDeleteExpense = (id: string) => deleteExpense(id);

    const saveExpense = () => {
        if (!formData.amount || !formData.description || !formData.category) return;
        saveExpenseMutation({
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: new Date(),
            dueDate: new Date(),
            status: 'PAID',
        });
        setIsModalOpen(false);
        setFormData({ category: '', description: '', amount: '' });
    };

    // ESC to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className="bg-summo-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-summo-dark transition">
                    <Plus size={18} /> Nova Despesa
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr className="text-xs text-gray-500 uppercase">
                                <th className="p-4">Data</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma despesa no período selecionado.</td></tr>
                            ) : expenses.map(ex => (
                                <tr key={ex.id} className="border-b border-gray-50 hover:bg-gray-50 render-auto">
                                    <td className="p-4 text-sm">{new Date(ex.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-xs font-bold uppercase text-gray-500">{ex.category}</td>
                                    <td className="p-4 font-medium">{ex.description}</td>
                                    <td className="p-4 text-right font-mono text-red-500 font-bold">- R$ {ex.amount.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onDeleteExpense(ex.id)} className="text-gray-300 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-summo-dark/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Lançar Despesa</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <select className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-summo-primary" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">Selecione...</option>
                                {FINANCIAL_CATEGORIES.filter(c => c.type === 'EXPENSE').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" placeholder="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                <input className="w-full pl-9 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition">Cancelar</button>
                            <button onClick={saveExpense} className="flex-1 py-3 bg-summo-primary text-white rounded-xl font-bold hover:bg-summo-dark transition shadow-lg">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(FinanceExpenses);
