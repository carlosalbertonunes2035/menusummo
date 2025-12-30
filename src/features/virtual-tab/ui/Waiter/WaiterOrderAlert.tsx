import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WaiterOrderAlertProps {
    order: Order;
    onClaim: (order: Order) => Promise<void>;
    claiming: boolean;
}

export function WaiterOrderAlert({ order, onClaim, claiming }: WaiterOrderAlertProps) {
    const hasDrinks = order.items.some(item =>
        item.channel?.toLowerCase().includes('bebida') ||
        item.channel?.toLowerCase().includes('drink')
    );

    const timeAgo = formatDistanceToNow(order.createdAt, {
        addSuffix: true,
        locale: ptBR,
    });

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 ${hasDrinks
            ? 'border-orange-500 dark:border-orange-400'
            : 'border-slate-200 dark:border-slate-700'
            } p-4 hover:shadow-xl transition-shadow`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        {hasDrinks && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                🥤 PRIORIDADE
                            </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {order.tableNumber || 'Mesa'}
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.customerName}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {timeAgo}
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(order.total)}
                    </p>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-1 mb-4">
                {order.items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-slate-700 dark:text-slate-300">
                            {item.quantity}x {item.productName}
                        </span>
                        {item.channel && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {item.channel}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <button
                onClick={() => onClaim(order)}
                disabled={claiming}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {claiming ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Coletando...
                    </>
                ) : (
                    <>
                        ⚡ Coletar Pedido
                    </>
                )}
            </button>
        </div>
    );
}
