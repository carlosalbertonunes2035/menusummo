/**
 * SUMMO Product Consultant Flow
 * Provides AI-powered insights for product creation/editing
 */
import { onCall } from 'firebase-functions/v2/https';
import { z } from 'genkit';
import {
    analyzePricing,
    suggestDescription,
    checkCompleteness
} from '../ai/agents/productConsultantAgent';

// Input schema
const ProductInsightsRequestSchema = z.object({
    product: z.object({
        name: z.string(),
        price: z.number(),
        cost: z.number().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        category: z.string().optional()
    }),
    context: z.object({
        restaurantName: z.string().optional(),
        restaurantType: z.string().optional()
    }).optional()
});

// Output schema
const InsightSchema = z.object({
    id: z.string(),
    type: z.enum(['pricing', 'description', 'photo', 'margin']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    message: z.string(),
    confidence: z.number(),
    suggestedAction: z.object({
        label: z.string(),
        value: z.any()
    }).optional(),
    createdAt: z.string()
});

const ProductInsightsResponseSchema = z.object({
    insights: z.array(InsightSchema),
    totalInsights: z.number(),
    processingTime: z.number()
});

/**
 * Get Product Insights
 * Callable function that analyzes a product and returns actionable insights
 */
export const getProductInsights = onCall({
    memory: '512MiB',
    timeoutSeconds: 60,
    region: 'southamerica-east1',
}, async (request) => {
    const startTime = Date.now();

    // Authentication check
    if (!request.auth) {
        throw new Error('Não autorizado');
    }

    // Validate input
    const validatedData = ProductInsightsRequestSchema.parse(request.data);
    const { product, context } = validatedData;

    console.log(`[ProductConsultantFlow] 🤖 Analisando produto: ${product.name}`);

    const insights: any[] = [];

    try {
        // 1. Pricing Analysis
        if (product.price && product.cost) {
            const pricingInsight = await analyzePricing(
                product.name,
                product.price,
                product.cost,
                product.category || 'Geral',
                context?.restaurantType || 'Restaurante'
            );

            insights.push({
                ...pricingInsight,
                id: `pricing-${Date.now()}`,
                createdAt: new Date().toISOString()
            });
        }

        // 2. Description Suggestion
        const descriptionInsight = await suggestDescription(
            product.name,
            product.category || 'Geral',
            product.description,
            context?.restaurantType || 'Restaurante'
        );

        insights.push({
            ...descriptionInsight,
            id: `description-${Date.now()}`,
            createdAt: new Date().toISOString()
        });

        // 3. Completeness Check (photo, etc)
        const completenessInsights = await checkCompleteness(
            product.name,
            !!product.image,
            !!product.description
        );

        completenessInsights.forEach((insight, index) => {
            insights.push({
                ...insight,
                id: `completeness-${Date.now()}-${index}`,
                createdAt: new Date().toISOString()
            });
        });

        // Sort by priority (critical > high > medium > low)
        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        insights.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

        const processingTime = Date.now() - startTime;

        console.log(`[ProductConsultantFlow] ✅ ${insights.length} insights gerados em ${processingTime}ms`);

        return {
            insights,
            totalInsights: insights.length,
            processingTime
        };

    } catch (error) {
        console.error('[ProductConsultantFlow] ❌ Erro:', error);
        throw new Error(`Erro ao gerar insights: ${error.message}`);
    }
});
