/**
 * AiInsightBadge Component
 * Badge notification for available insights
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiInsightBadgeProps {
    count: number;
    onClick?: () => void;
}

export function AiInsightBadge({ count, onClick }: AiInsightBadgeProps) {
    if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className="
        relative inline-flex items-center gap-1.5
        px-2.5 py-1 text-xs font-medium
        bg-primary-100 dark:bg-primary-900/30
        text-primary-700 dark:text-primary-300
        rounded-full
        hover:bg-primary-200 dark:hover:bg-primary-900/50
        transition-all duration-200
        animate-pulse
      "
            title="Ver insights da IA"
        >
            <Sparkles className="w-3 h-3" />
            <span>{count} {count === 1 ? 'insight' : 'insights'}</span>
        </button>
    );
}
