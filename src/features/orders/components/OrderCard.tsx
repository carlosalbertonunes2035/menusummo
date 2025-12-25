
import React, { memo } from 'react';
import { Order, OrderType, OrderStatus } from '../../../types';
import { User, Bike, ShoppingBag, Utensils, Printer, UserCheck, XCircle, ArrowRight, Globe, Smartphone } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    isArchived: boolean;
    onUpdateStatus: (id: string, nextStatus: OrderStatus) => void;
    onCancel: (id: string) => void;
    onPrintSelect: (id: string) => void;
    onInitiatePrint: (order: Order, mode: 'CUSTOMER' | 'KITCHEN') => void;
    printModeSelectId: string | null;
    smartAdvanceStatus: (order: Order) => void;
    getActionButtonLabel: (order: Order) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({
    order, isArchived, onUpdateStatus, onCancel, onPrintSelect, onInitiatePrint,
    printModeSelectId, smartAdvanceStatus, getActionButtonLabel
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition duration-200 relative flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-lg">#{order.id.slice(-4)}</span>
                        {/* Order Type Icons */}
                        {order.type === OrderType.DELIVERY && <Bike size={14} className="text-blue-500" />}
                        {order.type === OrderType.TAKEOUT && <ShoppingBag size={14} className="text-orange-500" />}
                        {order.type === OrderType.DINE_IN && <Utensils size={14} className="text-summo-primary" />}

                        {/* Digital Origin Tag */}
                        {order.origin === 'DIGITAL' && (
                            <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-orange-200">
                                <Smartphone size={10} /> App
                            </span>
                        )}
                    </div>
                    <p className="font-medium text-sm text-gray-600 mt-1 flex items-center gap-1"><User size={12} /> {order.customerName}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {/* Items Summary */}
            <div className="bg-gray-50 p-2.5 rounded-lg text-xs text-gray-600 border border-gray-100 space-y-1">
                {order.items.slice(0, 3).map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                        <span className="font-bold">{i.quantity}x {i.productName}</span>
                    </div>
                ))}
                {order.items.length > 3 && <span className="text-[10px] italic text-gray-400 block mt-1">+ {order.items.length - 3} itens...</span>}
            </div>

            {/* Actions Footer - Conditionally Rendered */}
            {!isArchived && (
                <div className="flex gap-2 pt-1">
                    <div className="relative">
                        <button
                            onClick={() => onPrintSelect(printModeSelectId === order.id ? '' : order.id)}
                            className={`p-2.5 rounded-lg transition ${printModeSelectId === order.id ? 'bg-summo-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            title="Imprimir"
                        >
                            <Printer size={18} />
                        </button>

                        {/* Print Popup */}
                        {printModeSelectId === order.id && (
                            <div className="absolute bottom-full left-0 mb-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in">
                                <button onClick={() => { onInitiatePrint(order, 'CUSTOMER'); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700"><UserCheck size={14} className="text-blue-500" /> Via Cliente</button>
                                <button onClick={() => { onInitiatePrint(order, 'KITCHEN'); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 text-gray-700"><Utensils size={14} className="text-orange-500" /> Via Cozinha</button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => { if (confirm('Cancelar pedido?')) onCancel(order.id) }}
                        className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                        title="Cancelar"
                    >
                        <XCircle size={18} />
                    </button>

                    <button
                        onClick={() => smartAdvanceStatus(order)}
                        className="flex-1 bg-summo-primary text-white rounded-lg text-xs font-bold hover:bg-summo-dark transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:translate-y-0.5"
                    >
                        {getActionButtonLabel(order)}
                        <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default memo(OrderCard);
