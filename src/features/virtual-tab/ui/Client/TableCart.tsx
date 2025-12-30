import React from 'react';
import { TableSession } from '../../model/types';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart } from '../../model/hooks/useCart';

interface TableCartProps {
    session: TableSession;
    onClose?: () => void;
    onOrderSuccess?: (orderId: string) => void;
}

export function TableCart({ session, onClose, onOrderSuccess }: TableCartProps) {
    const {
        cart,
        subtotal,
        isSubmitting,
        updateQuantity,
        removeFromCart,
        submitOrder
    } = useCart(session.tableId);

    const handleConfirmOrder = async () => {
        try {
            const orderId = await submitOrder();
            if (onOrderSuccess) onOrderSuccess(orderId);
            if (onClose) onClose();
        } catch (error) {
            alert('Falha ao enviar pedido. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
            <div className="bg-white rounded-t-3xl md:rounded-xl w-full md:max-w-md md:max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Seu Pedido</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isSubmitting}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">Carrinho vazio</p>
                            <p className="text-sm mt-2">Adicione produtos para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {formatCurrency(item.unitPrice)} cada
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                            disabled={isSubmitting}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                            disabled={isSubmitting}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">
                                            {formatCurrency(item.total)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {cart.length > 0 && (
                    <div className="border-t p-4 space-y-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            A taxa de serviço (10%) será calculada no fechamento da conta.
                        </p>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={isSubmitting}
                            className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Confirmar Pedido'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
