/**
 * SUMMO AI Schemas
 * Zod schemas for structured AI outputs - Anti-hallucination enforcement
 */
import { z } from 'zod';

// ============================================
// INGREDIENT SCHEMA
// ============================================
export const IngredientEstimateSchema = z.object({
    name: z.string().describe('Nome do ingrediente em português'),
    quantity: z.number().describe('Quantidade numérica'),
    unit: z.enum(['g', 'ml', 'un', 'kg', 'l']).describe('Unidade de medida'),
    estimatedCost: z.number().describe('Custo estimado em R$ baseado em preços de atacado'),
});

// ============================================
// RECIPE SCHEMA (Full product recipe)
// ============================================
export const RecipeSchema = z.object({
    ingredients: z.array(IngredientEstimateSchema),
    totalCost: z.number().describe('Soma de todos os custos de ingredientes'),
    suggestedMargin: z.number().describe('Margem de lucro sugerida em porcentagem (ex: 150 = 150%)'),
    suggestedPrice: z.number().describe('Preço de venda sugerido em R$'),
    aiObservation: z.string().describe('Conselho curto (máx 2 frases) sobre como aumentar lucro'),
});

// ============================================
// MENU ITEM INPUT SCHEMA
// ============================================
export const MenuItemInputSchema = z.object({
    productName: z.string(),
    description: z.string().optional(),
    currentPrice: z.number().optional(),
    restaurantType: z.string().default('Restaurante'),
    category: z.string().optional(),
});

// ============================================
// MENU ANALYSIS SCHEMA
// ============================================
export const MenuAnalysisSchema = z.object({
    totalItems: z.number(),
    averageMargin: z.number(),
    topPerformers: z.array(z.object({
        name: z.string(),
        estimatedMargin: z.number(),
    })),
    improvements: z.array(z.string()),
    summary: z.string(),
});

// ============================================
// PROFIT ADVICE SCHEMA
// ============================================
export const ProfitAdviceSchema = z.object({
    advice: z.string().describe('Conselho de lucro em 1-2 frases'),
    potentialSaving: z.number().optional().describe('Economia potencial em R$'),
    priority: z.enum(['low', 'medium', 'high']),
});

// ============================================
// FULL PRODUCT TREE SCHEMA (For intelligent import)
// ============================================
export const FullProductTreeSchema = z.object({
    tenantId: z.string().describe('ID do tenant (obrigatório para isolamento)'),
    products: z.array(z.object({
        name: z.string().describe('Nome do prato ou produto'),
        price: z.number().describe('Preço de venda base'),
        category: z.string().describe('Categoria do produto'),
        description: z.string().optional().describe('Descrição do produto'),
        ingredients: z.array(z.object({
            existingId: z.string().optional().describe('ID do insumo se já existir no banco'),
            name: z.string().describe('Nome do insumo'),
            quantity: z.number().describe('Quantidade utilizada na receita'),
            unit: z.string().describe('Unidade de medida (g, ml, un, kg, l)'),
            estimatedCost: z.number().optional().describe('Custo unitário estimado se for um novo insumo'),
        }))
    }))
});

// Type exports for TypeScript
export type IngredientEstimate = z.infer<typeof IngredientEstimateSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type MenuItemInput = z.infer<typeof MenuItemInputSchema>;
export type MenuAnalysis = z.infer<typeof MenuAnalysisSchema>;
export type ProfitAdvice = z.infer<typeof ProfitAdviceSchema>;
export type FullProductTree = z.infer<typeof FullProductTreeSchema>;
