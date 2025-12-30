/**
 * AI Consultant Types
 * Type definitions for AI-powered product insights
 */

import type { Product } from '@/types';

export type InsightType = 'pricing' | 'description' | 'photo' | 'margin';
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AiInsight {
    id: string;
    type: InsightType;
    title: string;
    message: string;
    confidence: number; // 0-1
    priority: InsightPriority;
    suggestedAction?: {
        label: string;
        value: any;
    };
    createdAt: string;
}

export interface ProductInsightsRequest {
    product: Partial<Product>;
    context?: {
        restaurantName?: string;
        restaurantType?: string;
    };
}

export interface ProductInsightsResponse {
    insights: AiInsight[];
    totalInsights: number;
    processingTime: number;
}
