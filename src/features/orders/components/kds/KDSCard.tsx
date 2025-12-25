
import React, { memo } from 'react';
import { Order, OrderStatus, OrderType } from '../../../../types';
import { Clock, CheckCircle2, Truck, User, PlayCircle } from 'lucide-react';

interface KDSCardProps {
    order: Order;
    advanceOrder: (order: Order) => void;
}

const KDSCard: React.FC<KDSCardProps> = ({ order, advanceOrder }) => {
    // eslint-disable-next-line react-hooks/purity
    const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    const isLate = elapsedMinutes > 15;

    // Light theme brand styles
    const cardBg = 'bg-white';
    const textPrimary = 'text-gray-800';
    const textSecondary = 'text-gray-600';
    const noteBg = 'bg-red-500 text-white';
    const borderColor = isLate ? 'border-red-500' : 'border-summo-primary';

    // Timer Badge Logic
    const timerBg = isLate
        ? 'bg-red-100 text-red-600'
        : 'bg-gray-100 text-gray-500';

    // Type Badge Logic
    const typeBadge = order.type === OrderType.DELIVERY
        ? 'bg-blue-100 text-blue-600'
        : 'bg-orange-100 text-orange-600';

    return (
        <div className={`${cardBg} p-4 rounded-xl shadow-sm border-l-4 ${borderColor} animate-fade-in flex flex-col gap-3 render-auto`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <span className={`font-bold text-lg block ${textPrimary}`}>#{order.id.slice(-4)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${typeBadge}`}>
                        {order.type === OrderType.DELIVERY ? 'Entrega' : 'Mesa/Ret.'}
                    </span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${timerBg}`}>
                    <Clock size={12} />
                    {elapsedMinutes} min
                </div>
            </div>

            {/* Customer */}
            <p className={`text-sm font-medium flex items-center gap-1 ${textSecondary}`}>
                {order.type === OrderType.DELIVERY ? <Truck size={14} /> : <User size={14} />}
                {order.customerName}
            </p>

            {/* Items */}
            <div className="space-y-2 border-t pt-2 border-gray-100">
                {order.items.map((item: any, i: number) => (
                    <div key={i} className={`text-sm pb-1 last:pb-0 ${textPrimary}`}>
                        <div className="flex items-start gap-2">
                            <span className="font-bold whitespace-nowrap text-summo-dark">{item.quantity}x</span>
                            <span className="leading-tight">{item.productName}</span>
                        </div>
                        {item.notes && <p className={`text-xs px-2 py-1 rounded mt-1 font-bold inline-block ${noteBg}`}>{item.notes}</p>}
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <button
                onClick={() => advanceOrder(order)}
                className={`w-full py-4 text-white rounded-xl text-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md mt-2
                    ${order.status === OrderStatus.PENDING ? 'bg-blue-600' : ''}
                    ${order.status === OrderStatus.PREPARING ? 'bg-green-600' : ''}
                    ${order.status === OrderStatus.READY ? 'bg-gray-600' : ''}
                `}
            >
                {order.status === OrderStatus.PENDING && <><PlayCircle size={20} /> Iniciar Preparo</>}
                {order.status === OrderStatus.PREPARING && <><CheckCircle2 size={20} /> Finalizar</>}
                {order.status === OrderStatus.READY && <><Truck size={20} /> Despachar</>}
            </button>
        </div>
    );
};

export default memo(KDSCard);
