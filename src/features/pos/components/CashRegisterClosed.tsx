
import React, { useState } from 'react';
import { Banknote, Unlock } from 'lucide-react';

interface CashRegisterClosedProps {
    onOpen: (initialAmount: number) => void;
}

const CashRegisterClosed: React.FC<CashRegisterClosedProps> = ({ onOpen }) => {
    const [initialAmount, setInitialAmount] = useState('');

    const handleOpen = () => {
        const amount = parseFloat(initialAmount);
        if (isNaN(amount) || amount < 0) {
            alert("Valor inválido."); // Using alert for simplicity, could be a toast
            return;
        }
        onOpen(amount);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
                <Banknote size={48} className="mx-auto mb-4 text-summo-primary opacity-50"/>
                <h2 className="text-2xl font-bold text-summo-dark mb-2">Caixa Fechado</h2>
                <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                        type="number" 
                        value={initialAmount} 
                        onChange={(e) => setInitialAmount(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
                        placeholder="150,00" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-summo-primary"
                        autoFocus
                    />
                </div>
                <button 
                    onClick={handleOpen} 
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 active:scale-95"
                >
                    <Unlock size={20}/> Abrir Caixa
                </button>
            </div>
        </div>
    );
};

export default React.memo(CashRegisterClosed);
