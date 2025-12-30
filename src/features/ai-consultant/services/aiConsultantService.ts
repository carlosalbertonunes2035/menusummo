/**
 * AI Consultant Service
 * Handles communication with Firebase Functions for product insights
 */

import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase';
import { ProductInsightsRequest, ProductInsightsResponse, AiInsight } from '../types';

// Cache for insights (24h TTL)
const insightsCache = new Map<string, { insights: AiInsight[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get product insights from AI
 */
export async function getProductInsights(
    request: ProductInsightsRequest
): Promise<AiInsight[]> {
    // Generate cache key
    const cacheKey = `${request.product.name}-${request.product.price}-${request.product.cost}`;

    // Check cache
    const cached = insightsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('[AiConsultantService] 📦 Cache hit:', cacheKey);
        return cached.insights;
    }

    console.log('[AiConsultantService] 🚀 Calling getProductInsights function...');

    try {
        const getInsightsFn = httpsCallable<ProductInsightsRequest, ProductInsightsResponse>(
            functions,
            'getProductInsights'
        );

        const result = await getInsightsFn(request);
        const insights = result.data.insights;

        // Update cache
        insightsCache.set(cacheKey, {
            insights,
            timestamp: Date.now()
        });

        console.log(`[AiConsultantService] ✅ ${insights.length} insights received`);
        return insights;

    } catch (error: any) {
        console.error('[AiConsultantService] ❌ Error:', error);
        throw new Error(`Erro ao buscar insights: ${error.message}`);
    }
}

/**
 * Clear insights cache
 */
export function clearInsightsCache(): void {
    insightsCache.clear();
    console.log('[AiConsultantService] 🗑️ Cache cleared');
}
