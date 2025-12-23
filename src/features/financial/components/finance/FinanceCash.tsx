
import React, { memo } from 'react';
import { CashRegister, StockMovementType } from '@/types';
import { Unlock, Lock, TrendingDown, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface FinanceCashProps {
    cashRegister: CashRegister;
}

const FinanceCash: React.FC<FinanceCashProps> = ({ cashRegister }) => {
    const { setCashRegister } = useApp();

    const handleBleed = () => {
        const amount = prompt("Valor da Sangria (Retirada):");
        const reason = prompt("Motivo:");
        if (amount && reason) {
            const val = parseFloat(amount);
            if (val > cashRegister.currentBalance) {
                alert("Valor da sangria maior que o saldo em caixa.");
                return;
            }
            setCashRegister({
                ...cashRegister,
                currentBalance: cashRegister.currentBalance - val,
                transactions: [...cashRegister.transactions, { id: Date.now().toString(), type: 'BLEED', amount: -val, description: `Sangria: ${reason}`, timestamp: new Date() }]
            });
        }
    };

    const handleSupply = () => {
        const amount = prompt("Valor do Suprimento (Entrada):");
        const reason = prompt("Motivo:");
        if (amount && reason) {
            const val = parseFloat(amount);
            setCashRegister({
                ...cashRegister,
                currentBalance: cashRegister.currentBalance + val,
                transactions: [...cashRegister.transactions, { id: Date.now().toString(), type: 'SUPPLY', amount: val, description: `Suprimento: ${reason}`, timestamp: new Date() }]
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-8 ${cashRegister.isOpen ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Status do Caixa</p>
                        <h3 className={`text-2xl font-bold ${cashRegister.isOpen ? 'text-green-600' : 'text-red-600'}`}>{cashRegister.isOpen ? 'ABERTO' : 'FECHADO'}</h3>
                    </div>
                    <div className={`p-3 rounded-full ${cashRegister.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {cashRegister.isOpen ? <Unlock size={24} /> : <Lock size={24} />}
                    </div>
                </div>
                {cashRegister.isOpen ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-600">Saldo Atual (Dinheiro)</span>
                            <span className="text-xl font-mono font-bold">R$ {cashRegister.currentBalance.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-4">
                            <button onClick={handleBleed} className="py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 text-sm flex items-center justify-center gap-1"><TrendingDown size={14} /> Sangria</button>
                            <button onClick={handleSupply} className="py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 text-sm flex items-center justify-center gap-1"><TrendingUp size={14} /> Suprimento</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-sm text-gray-500 py-4">O caixa é aberto e fechado na tela de PDV.</div>
                )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">Movimentações do Turno</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {cashRegister.transactions.length === 0 ?
                        <p className="text-center text-gray-400 mt-10">Nenhuma movimentação.</p> :
                        [...cashRegister.transactions].reverse().map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 render-auto">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{tx.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>{tx.amount >= 0 ? '+' : ''} R$ {tx.amount.toFixed(2)}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default memo(FinanceCash);
