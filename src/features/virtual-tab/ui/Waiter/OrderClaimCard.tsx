import { OrderClaim } from '../../model/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sortItemsByPriority } from '../../lib/utils/claimUtils';

interface OrderClaimCardProps {
    claim: OrderClaim;
    onMarkDelivered: (claimId: string) => Promise<void>;
}

export function OrderClaimCard({ claim, onMarkDelivered }: OrderClaimCardProps) {
    const sortedItems = sortItemsByPriority(claim.items);
    const allDelivered = claim.items.every(item => item.delivered);
    const someDelivered = claim.items.some(item => item.delivered);

    const timeAgo = formatDistanceToNow(claim.claimedAt, {
        addSuffix: true,
        locale: ptBR,
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Mesa {claim.tableSessionId}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Coletado {timeAgo}
                    </p>
                </div>
                <div className="text-right">
                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                        +{claim.points} pts
                    </div>
                    {claim.responseTime < 30 && (
                        <div className="mt-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                            ⚡ Muito rápido!
                        </div>
                    )}
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
                {sortedItems.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded-lg ${item.delivered
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : item.priority === 'HIGH'
                                    ? 'bg-orange-50 dark:bg-orange-900/20'
                                    : 'bg-slate-50 dark:bg-slate-700/50'
                            }`}
                    >
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                            {item.delivered ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                            ) : (
                                <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                            )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {item.priority === 'HIGH' && !item.delivered && (
                                    <span className="text-xs">🥤</span>
                                )}
                                <span className={`font-medium ${item.delivered
                                        ? 'text-slate-500 dark:text-slate-400 line-through'
                                        : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {item.quantity}x {item.productName}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.category}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            {!allDelivered && (
                <button
                    onClick={() => onMarkDelivered(claim.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    ✅ Marcar como Entregue
                </button>
            )}

            {allDelivered && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        ✅ Pedido entregue com sucesso!
                    </p>
                </div>
            )}
        </div>
    );
}
