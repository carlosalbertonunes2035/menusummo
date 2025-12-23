
import React from 'react';
import { CheckCircle2, Receipt, Wand2 } from 'lucide-react';

interface OrderSuccessProps {
    orderId: string;
    onNewOrder: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId, onNewOrder }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-summo-bg animate-fade-in p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido #{orderId.slice(-4)}</h2>
                <p className="text-gray-500 mb-8">Realizado com sucesso!</p>
                <div className="grid gap-3">
                    <button
                        onClick={onNewOrder}
                        className="w-full py-4 bg-summo-primary text-white rounded-xl font-bold shadow-lg hover:bg-summo-dark transition active:scale-95"
                    >
                        Novo Pedido (Enter)
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95">
                            <Receipt size={18} /> Cliente
                        </button>
                        <button className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95">
                            <Wand2 size={18} /> Cozinha
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OrderSuccess);
