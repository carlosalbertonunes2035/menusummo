/**
 * AiInsightCard Component
 * Individual card displaying a single AI insight
 */

import React from 'react';
import { AiInsight } from '../types';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Sparkles } from 'lucide-react';

interface AiInsightCardProps {
    insight: AiInsight;
    onApply?: (insight: AiInsight) => void;
    onDismiss?: (insightId: string) => void;
}

const priorityConfig = {
    critical: {
        icon: AlertCircle,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        badgeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    },
    high: {
        icon: AlertTriangle,
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        iconColor: 'text-orange-600 dark:text-orange-400',
        badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    },
    medium: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    },
    low: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        badgeColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    }
};

export function AiInsightCard({ insight, onApply, onDismiss }: AiInsightCardProps) {
    const config = priorityConfig[insight.priority];
    const Icon = config.icon;

    return (
        <div
            className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg p-4 space-y-3
        transition-all duration-200 hover:shadow-md
      `}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {insight.title}
                        </h4>
                        <span className={`${config.badgeColor} text-xs px-2 py-0.5 rounded-full font-medium`}>
                            {insight.priority}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.message}
                    </p>
                </div>
            </div>

            {/* Confidence */}
            {insight.confidence && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Confiança: {(insight.confidence * 100).toFixed(0)}%</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
                {insight.suggestedAction && onApply && (
                    <button
                        onClick={() => onApply(insight)}
                        className="
              px-3 py-1.5 text-sm font-medium
              bg-primary-600 hover:bg-primary-700
              text-white rounded-md
              transition-colors duration-200
            "
                    >
                        {insight.suggestedAction.label}
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={() => onDismiss(insight.id)}
                        className="
              px-3 py-1.5 text-sm font-medium
              text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-gray-100
              transition-colors duration-200
            "
                    >
                        Dispensar
                    </button>
                )}
            </div>
        </div>
    );
}
