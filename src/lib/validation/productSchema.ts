import { z } from 'zod';

/**
 * Product Validation Schema
 */
export const productValidationSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    type: z.enum(['NORMAL', 'COMBO', 'INGREDIENT'], {
        errorMap: () => ({ message: 'Tipo inválido' })
    }),
    cost: z.number().min(0, 'Custo deve ser positivo').optional(),
    channels: z.array(z.object({
        channel: z.string(),
        price: z.number().min(0, 'Preço deve ser positivo'),
        isActive: z.boolean()
    })).min(1, 'Pelo menos um canal deve estar configurado')
});

/**
 * Validate product data
 */
export const validateProduct = (product: any) => {
    return productValidationSchema.safeParse(product);
};

/**
 * Combo Validation Schema
 */
export const comboValidationSchema = productValidationSchema.extend({
    type: z.literal('COMBO'),
    comboItems: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1)
    })).min(1, 'Combo deve ter pelo menos um item fixo'),
    comboSteps: z.array(z.object({
        name: z.string(),
        min: z.number().min(1),
        max: z.number().min(1),
        items: z.array(z.object({
            productId: z.string(),
            overridePrice: z.number().optional()
        }))
    })).optional()
});

/**
 * Validate combo product
 */
export const validateCombo = (combo: any) => {
    return comboValidationSchema.safeParse(combo);
};
