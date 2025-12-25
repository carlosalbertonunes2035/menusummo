
import { z } from 'zod';

const ChannelConfigSchema = z.object({
    channel: z.enum(['pos', 'digital-menu', 'ifood']),
    displayName: z.string().optional(),
    price: z.number().min(0, "O preço não pode ser negativo"),
    promotionalPrice: z.number().min(0, "O preço promocional não pode ser negativo").optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isAvailable: z.boolean(),
    videoUrl: z.string().optional(),
    category: z.string().optional(),
    sortOrder: z.number().optional(),
});

const ProductSchema = z.object({
    id: z.string(),
    type: z.enum(['SIMPLE', 'COMBO']).default('SIMPLE').optional(),
    comboItems: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1, "Quantidade mínima de 1"),
        overridePrice: z.number().optional()
    })).optional(),
    comboSteps: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        min: z.number(),
        max: z.number(),
        items: z.array(z.object({
            productId: z.string(),
            overridePrice: z.number().optional()
        }))
    })).optional(),
    name: z.string().min(2, "O nome do produto deve ter pelo menos 2 caracteres").optional().default('Produto Sem Nome'),
    category: z.string().min(1, "A categoria é obrigatória").optional().default('Geral'),
    cost: z.number().min(0, "O custo não pode ser negativo").optional().default(0),
    tags: z.array(z.string()).default([]),
    ingredients: z.array(z.object({
        ingredientId: z.string(),
        amount: z.number().min(0.001, "A quantidade do ingrediente deve ser maior que zero")
    })).default([]),
    optionGroupIds: z.array(z.string()).default([]),
    channels: z.array(ChannelConfigSchema).default([]),
    image: z.string().optional(),
    description: z.string().optional(),
    realCost: z.number().optional(),
    recipeId: z.string().optional(),
    preparationTime: z.number().optional(),
    likes: z.number().optional(),
    tenantId: z.string().optional(),
    slug: z.string().optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).default([])
});

const testData = {
    id: '',
    updatedAt: new Date(),
    createdAt: new Date(),
    tenantId: 'negocio-teste',
    channels: []
};

try {
    const result = ProductSchema.parse(testData);
    console.log("Validation Successful:", result);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.log("Zod Error:", JSON.stringify(error.issues, null, 2));
    } else {
        console.log("Other Error:", error);
    }
}
