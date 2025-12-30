import React from 'react';
import { Smartphone, CreditCard, Banknote } from 'lucide-react';

interface PaymentStepProps {
    paymentMethod: string | null;
    setPaymentMethod: (method: string) => void;
    changeFor: string;
    setChangeFor: (val: string) => void;
    cartTotal: number;
    deliveryFee: number;
    discountValue: number;
    loyaltyDiscount: number;
    finalTotal: number;
    isDelivery: boolean;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
    paymentMethod,
    setPaymentMethod,
    changeFor,
    setChangeFor,
    cartTotal,
    deliveryFee,
    discountValue,
    loyaltyDiscount,
    finalTotal,
    isDelivery
}) => {
    const paymentMethods = [
        { id: 'Pix', label: 'Pix', icon: Smartphone, color: 'text-teal-600', sub: 'Aprovação imediata' },
        { id: 'Cartão', label: 'Cartão na Entrega', icon: CreditCard, color: 'text-blue-600', sub: 'Levar maquininha' },
        { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-green-600', sub: 'Pagamento na entrega' }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-slide-in-right">
            <h3 className="font-bold text-gray-800 text-lg">Pagamento pelo app</h3>
            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <label
                        key={method.id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition shadow-sm hover:shadow-md ${paymentMethod === method.id ? 'border-summo-primary bg-summo-bg/10 ring-1 ring-summo-primary/20' : 'border-gray-100 bg-white'}`}
                    >
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                        <div className={`p-3 rounded-full mr-4 bg-gray-50 ${paymentMethod === method.id ? 'bg-white shadow-sm' : ''}`}>
                            <method.icon size={24} className={method.color} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-sm text-gray-800 block">{method.label}</span>
                            <span className="text-xs text-gray-500">{method.sub}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'border-summo-primary bg-summo-primary' : 'border-gray-300'}`}>
                            {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                    </label>
                ))}
            </div>

            {paymentMethod === 'Dinheiro' && (
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl animate-fade-in">
                    <p className="text-xs font-bold text-yellow-800 mb-2 uppercase">Precisa de troco?</p>
                    <div className="flex gap-2 items-center">
                        <span className="text-yellow-600 font-bold">R$</span>
                        <input
                            type="text"
                            value={changeFor}
                            onChange={e => setChangeFor(e.target.value)}
                            placeholder="Para quanto? (Ex: 50,00)"
                            className="flex-1 bg-white border-yellow-200 border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                    </div>
                </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Resumo Final</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                    {isDelivery && <div className="flex justify-between text-gray-600"><span>Taxa de Entrega</span><span>R$ {deliveryFee.toFixed(2)}</span></div>}
                    {discountValue > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Desconto</span><span>- R$ {discountValue.toFixed(2)}</span></div>}
                    {loyaltyDiscount > 0 && <div className="flex justify-between text-amber-500 font-bold"><span>Cashback Utilizado</span><span>- R$ {loyaltyDiscount.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200 mt-2">
                        <span>Total a pagar</span>
                        <span>R$ {finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
