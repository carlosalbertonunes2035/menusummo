import { useState } from 'react';
import { useLossTracking } from '../../model/hooks/useLossTracking';
import { LossIncident, LossType } from '../../model/types/lossTracking';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LOSS_TYPE_LABELS: Record<LossType, string> = {
    WALKOUT: '🏃 Fuga sem Pagar',
    CANCELLED_ORDER: '❌ Pedido Cancelado',
    KITCHEN_ERROR: '🔥 Erro da Cozinha',
    WAITER_ERROR: '💧 Erro do Garçom',
    CUSTOMER_COMPLAINT: '😠 Reclamação',
    SYSTEM_ERROR: '⚙️ Erro do Sistema',
    ORPHAN_ORDER: '👻 Pedido Órfão',
    EXPIRED_PRODUCT: '📅 Produto Vencido',
    OTHER: '❓ Outro',
};

export function LossDashboard() {
    const { incidents, loading, reviewIncident, getLossStats } = useLossTracking();
    const [selectedIncident, setSelectedIncident] = useState<LossIncident | null>(null);
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Carregando perdas...</p>
                </div>
            </div>
        );
    }

    const stats = getLossStats();
    const pendingIncidents = incidents.filter(i => i.status === 'PENDING');

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Controle de Perdas
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Rastreabilidade completa de prejuízos e incidentes
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Total de Incidentes
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stats.totalIncidents}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Perda Total (Valor)
                    </div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(stats.totalAmount)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Custo Real
                    </div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(stats.totalCost)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Perda Média
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(stats.averageLoss)}
                    </div>
                </div>
            </div>

            {/* Pending Review */}
            {pendingIncidents.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                        ⚠️ Aguardando Revisão ({pendingIncidents.length})
                    </h2>
                    <div className="space-y-3">
                        {pendingIncidents.slice(0, 3).map(incident => (
                            <button
                                key={incident.id}
                                onClick={() => setSelectedIncident(incident)}
                                className="w-full bg-white dark:bg-slate-800 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {LOSS_TYPE_LABELS[incident.type]} - {incident.tableNumber}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {incident.details.customerName} • {incident.details.description}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(incident.amount)}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {format(incident.createdAt, 'dd/MM HH:mm', { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loss by Type */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Perdas por Tipo
                </h2>
                <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{LOSS_TYPE_LABELS[type as LossType].split(' ')[0]}</span>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {LOSS_TYPE_LABELS[type as LossType].split(' ').slice(1).join(' ')}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {data.count} incidente{data.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(data.amount)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Custo: {formatCurrency(data.cost)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Incidentes Recentes
                </h2>
                <div className="space-y-3">
                    {incidents.slice(0, 10).map(incident => (
                        <button
                            key={incident.id}
                            onClick={() => setSelectedIncident(incident)}
                            className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                        {LOSS_TYPE_LABELS[incident.type]} - {incident.tableNumber}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Cliente: {incident.details.customerName}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    incident.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    }`}>
                                    {incident.status === 'APPROVED' ? 'Aprovado' :
                                        incident.status === 'REJECTED' ? 'Rejeitado' :
                                            'Pendente'}
                                </div>
                            </div>

                            {/* Tracking Info */}
                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                <div>📍 Abriu: {incident.tracking.openedByName}</div>
                                {incident.tracking.attendedByName && (
                                    <div>👨‍🍳 Atendeu: {incident.tracking.attendedByName}</div>
                                )}
                                {incident.tracking.deliveredByNames && incident.tracking.deliveredByNames.length > 0 && (
                                    <div>🚶 Levou: {incident.tracking.deliveredByNames.join(', ')}</div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {format(incident.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </div>
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(incident.amount)}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Incident Detail Modal */}
            {selectedIncident && (
                <IncidentDetailModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    onReview={reviewIncident}
                />
            )}
        </div>
    );
}

// Incident Detail Modal Component
function IncidentDetailModal({
    incident,
    onClose,
    onReview
}: {
    incident: LossIncident;
    onClose: () => void;
    onReview: (id: string, approved: boolean, notes?: string) => Promise<void>;
}) {
    const [notes, setNotes] = useState('');
    const [reviewing, setReviewing] = useState(false);

    const handleReview = async (approved: boolean) => {
        setReviewing(true);
        try {
            await onReview(incident.id, approved, notes);
            onClose();
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                Detalhes do Incidente
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                {LOSS_TYPE_LABELS[incident.type]}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Amount */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                        <div className="text-sm text-red-600 dark:text-red-400 mb-1">Perda Total</div>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(incident.amount)}
                        </div>
                        <div className="text-sm text-red-600/70 dark:text-red-400/70">
                            Custo: {formatCurrency(incident.cost)}
                        </div>
                    </div>

                    {/* Tracking */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Rastreabilidade
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Mesa:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {incident.tableNumber}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Cliente:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {incident.details.customerName} ({incident.details.customerPhone})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Abriu:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {incident.tracking.openedByName}
                                </span>
                            </div>
                            {incident.tracking.attendedByName && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 dark:text-slate-400">Atendeu:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {incident.tracking.attendedByName}
                                    </span>
                                </div>
                            )}
                            {incident.tracking.deliveredByNames && incident.tracking.deliveredByNames.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 dark:text-slate-400">Levou:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {incident.tracking.deliveredByNames.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Descrição
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">
                            {incident.details.description}
                        </p>
                    </div>

                    {/* Review Section */}
                    {incident.status === 'PENDING' && (
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                                Revisão
                            </h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notas sobre a revisão (opcional)"
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4"
                                rows={3}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReview(true)}
                                    disabled={reviewing}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    ✓ Aprovar Perda
                                </button>
                                <button
                                    onClick={() => handleReview(false)}
                                    disabled={reviewing}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    ✕ Rejeitar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
