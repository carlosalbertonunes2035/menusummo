/**
 * AiConsultantModal Component
 * Modal that displays AI-powered product insights
 */

import React from 'react';
import { AiInsight } from '../types';
import { AiInsightCard } from './AiInsightCard';
import { SummoModal } from '../../../components/ui/SummoModal';
import { Sparkles, X } from 'lucide-react';

interface AiConsultantModalProps {
    isOpen: boolean;
    onClose: () => void;
    insights: AiInsight[];
    isLoading?: boolean;
    error?: string | null;
    onApplyInsight?: (insight: AiInsight) => void;
    onDismissInsight?: (insightId: string) => void;
}

export function AiConsultantModal({
    isOpen,
    onClose,
    insights,
    isLoading,
    error,
    onApplyInsight,
    onDismissInsight
}: AiConsultantModalProps) {
    return (
        <SummoModal
            isOpen={isOpen}
            onClose={onClose}
            title="💡 Consultor IA"
            size="lg"
        >
            <div className="space-y-4">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Analisando produto...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* Insights List */}
                {!isLoading && !error && insights.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Encontrei <strong>{insights.length}</strong> {insights.length === 1 ? 'insight' : 'insights'} para melhorar seu produto:
                        </p>
                        {insights.map(insight => (
                            <AiInsightCard
                                key={insight.id}
                                insight={insight}
                                onApply={onApplyInsight}
                                onDismiss={onDismissInsight}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && insights.length === 0 && (
                    <div className="text-center py-12 space-y-3">
                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Nenhum insight disponível no momento
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="
              px-4 py-2 text-sm font-medium
              text-gray-700 dark:text-gray-300
              hover:text-gray-900 dark:hover:text-gray-100
              transition-colors duration-200
            "
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </SummoModal>
    );
}
