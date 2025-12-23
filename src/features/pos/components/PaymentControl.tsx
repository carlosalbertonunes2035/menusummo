
import React, { useState } from 'react';
import { PaymentMethod, PaymentTransaction } from '../../../types';
import { CreditCard, Smartphone, Banknote, FileText, CheckCircle2, Trash2, Ticket } from 'lucide-react';

interface PaymentControlProps {
    grandTotal: number;
    remainingDue: number;
    changeDue: number;
    totalPaid: number;
    payments: PaymentTransaction[];
    onAddPayment: (method: PaymentMethod, amount: number) => void;
    onRemovePayment: (index: number) => void;
}

const PaymentControl: React.FC<PaymentControlProps> = ({
    grandTotal, remainingDue, changeDue, totalPaid, payments, onAddPayment, onRemovePayment
}) => {
    const [cashReceived, setCashReceived] = useState('');

    const handleCashAdd = () => {
        const val = parseFloat(cashReceived);
        if (!isNaN(val) && val > 0) {
            onAddPayment(PaymentMethod.CASH, val);
            setCashReceived('');
        }
    };

    const paymentMethods = [
        { id: PaymentMethod.PIX, icon: Smartphone, label: 'Pix', color: 'text-teal-600 border-teal-200 bg-teal-50' },
        { id: PaymentMethod.DEBIT_CARD, icon: CreditCard, label: 'Débito', color: 'text-blue-600 border-blue-200 bg-blue-50' },
        { id: PaymentMethod.CREDIT_CARD, icon: CreditCard, label: 'Crédito', color: 'text-indigo-600 border-indigo-200 bg-indigo-50' },
        { id: PaymentMethod.MEAL_VOUCHER, icon: Ticket, label: 'Vale Ref.', color: 'text-orange-600 border-orange-200 bg-orange-50' },
    ];

    return (
        <div className="p-4 space-y-4 animate-fade-in">
            {/* Totalizer Header */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${remainingDue <= 0.01 ? 'bg-green-500' : 'bg-summo-primary'}`}></div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase text-gray-400">
                    <span>Total: R$ {grandTotal.toFixed(2)}</span>
                    <span>Pago: R$ {totalPaid.toFixed(2)}</span>
                </div>
                {remainingDue > 0.01 ? (
                    <>
                        <p className="text-gray-500 text-xs uppercase font-bold">Falta Pagar</p>
                        <p className="text-4xl font-bold text-summo-dark">R$ {remainingDue.toFixed(2)}</p>
                    </>
                ) : (
                    <>
                        <p className="text-green-600 text-xs uppercase font-bold flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Pedido Quitado</p>
                        {changeDue > 0 ? (
                            <div className="mt-2 animate-bounce">
                                <p className="text-gray-400 text-xs uppercase font-bold">Troco</p>
                                <p className="text-3xl font-bold text-green-600">R$ {changeDue.toFixed(2)}</p>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-green-600 mt-1">R$ 0,00</p>
                        )}
                    </>
                )}
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(m => (
                    <button
                        key={m.id}
                        onClick={() => onAddPayment(m.id, remainingDue)}
                        disabled={remainingDue <= 0.01}
                        className={`p-4 rounded-xl border-2 flex items-center gap-3 transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:filter disabled:grayscale ${m.color} hover:shadow-md`}
                    >
                        <m.icon size={24} />
                        <span className="text-sm font-bold uppercase tracking-wide">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Cash Input */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-2 items-center mb-2"><Banknote size={16} className="text-green-600" /> <span className="text-xs font-bold text-gray-600 uppercase">Dinheiro / Espécie</span></div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                        <input
                            type="number"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 p-3 outline-none font-mono font-bold text-xl text-gray-800 focus:ring-2 focus:ring-green-500 transition"
                            placeholder="0,00"
                            value={cashReceived}
                            onChange={e => setCashReceived(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCashAdd(); }}
                        />
                    </div>
                    <button onClick={handleCashAdd} disabled={!cashReceived || remainingDue <= 0.01} className="bg-green-600 text-white px-6 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-600/20 active:scale-95">OK</button>
                </div>
            </div>

            <button onClick={() => onAddPayment(PaymentMethod.CREDIT_TAB, remainingDue)} disabled={remainingDue <= 0.01} className="w-full p-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-sm font-bold flex justify-center items-center gap-2 transition disabled:opacity-50">
                <FileText size={16} /> Pendurar (Fiado)
            </button>

            {/* Payment List */}
            {payments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase">Pagamentos Registrados</p>
                    {payments.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-sm p-3 bg-white rounded-xl border border-gray-100 shadow-sm items-center animate-slide-in-up">
                            <span className="font-medium text-gray-600 flex items-center gap-2">{p.method}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-gray-800">R$ {p.amount.toFixed(2)}</span>
                                <button onClick={() => onRemovePayment(idx)} className="text-red-300 hover:text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(PaymentControl);
