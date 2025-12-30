/**
 * useAiConsultant Hook
 * React hook for managing AI consultant state and interactions
 */

import { useState, useCallback } from 'react';
import { AiInsight, ProductInsightsRequest } from '../types';
import { getProductInsights } from '../services/aiConsultantService';
import { Product } from '../../../types';

interface UseAiConsultantReturn {
    insights: AiInsight[];
    isLoading: boolean;
    error: string | null;
    getInsights: (product: Partial<Product>, context?: any) => Promise<void>;
    dismissInsight: (insightId: string) => void;
    applyInsight: (insight: AiInsight) => void;
    clearInsights: () => void;
}

export function useAiConsultant(): UseAiConsultantReturn {
    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getInsights = useCallback(async (
        product: Partial<Product>,
        context?: any
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const request: ProductInsightsRequest = {
                product,
                context
            };

            const result = await getProductInsights(request);
            setInsights(result);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar insights');
            console.error('[useAiConsultant] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const dismissInsight = useCallback((insightId: string) => {
        setInsights(prev => prev.filter(i => i.id !== insightId));
    }, []);

    const applyInsight = useCallback((insight: AiInsight) => {
        console.log('[useAiConsultant] Applying insight:', insight);
        // This will be handled by the parent component (ProductEditor)
        // We just dismiss it from the list
        dismissInsight(insight.id);
    }, [dismissInsight]);

    const clearInsights = useCallback(() => {
        setInsights([]);
        setError(null);
    }, []);

    return {
        insights,
        isLoading,
        error,
        getInsights,
        dismissInsight,
        applyInsight,
        clearInsights
    };
}
