
import { z } from 'zod';

// --- HELPER REGEX ---
const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const PHONE_REGEX = /^(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/;

// --- PRODUCT SCHEMA ---
export const ChannelConfigSchema = z.object({
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

export const ProductSchema = z.object({
    id: z.string(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'PAUSED', 'DRAFT', 'draft']).default('ACTIVE').optional(),
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
    name: z.string().min(2, "O nome do produto deve ter pelo menos 2 caracteres").nullish().default('Produto Sem Nome'),
    category: z.string().min(1, "A categoria é obrigatória").nullish().default('Geral'),
    cost: z.number().min(0, "O custo não pode ser negativo").nullish().default(0),
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
    keywords: z.array(z.string()).default([]),
    imageFit: z.enum(['contain', 'cover']).optional(),
    ownerUid: z.string().optional() // Made optional for legacy data compatibility
});

// --- SETTINGS SCHEMA ---
export const FinancialSettingsSchema = z.object({
    taxRate: z.number().min(0).max(100),
    fixedCostRate: z.number().min(0).max(100),
    packagingAvgCost: z.number().min(0)
});

export const DeliverySettingsSchema = z.object({
    baseFee: z.number().min(0),
    minOrderValue: z.number().min(0),
    freeShippingThreshold: z.number().min(0)
});

export const DigitalMenuSettingsSchema = z.object({
    layout: z.enum(['FEED', 'LIST', 'GRID']).optional(),
    showComments: z.boolean().optional(),
    showShare: z.boolean().optional(),
    branding: z.any().optional(),
    categoryImages: z.record(z.string()).optional(),
});

export const StoreSettingsSchema = z.object({
    brandName: z.string().min(2, "Nome Fantasia muito curto").or(z.literal('')).optional(),
    name: z.string().min(2, "Razão Social muito curta").or(z.literal('')).optional(),
    // Optional or stricter depending on business rules. Assuming required for now.
    // Making checks slightly loose to allow saving drafts, but enforcing formats if present
    cnpj: z.string().regex(CNPJ_REGEX, "Formato de CNPJ inválido (00.000.000/0000-00)").or(z.literal('')).optional(),
    phone: z.string().min(8, "Telefone inválido").or(z.literal('')).optional(),
    address: z.string().min(5, "Endereço muito curto").or(z.literal('')).optional(),
    storefront: z.object({
        storeName: z.string().optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").or(z.literal('')).optional(),
    }).optional(),

    financial: FinancialSettingsSchema.optional(),
    delivery: DeliverySettingsSchema.optional(),
    digitalMenu: DigitalMenuSettingsSchema.optional(),
});

// --- ORDER SCHEMA ---
export const PaymentTransactionSchema = z.object({
    id: z.string(),
    method: z.string(), // Could be enum if strict
    amount: z.number(),
    description: z.string().optional(),
    timestamp: z.any() // Firestore Timestamp or Date
});

export const OrderItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    price: z.number(),
    notes: z.string().optional(),
    isTakeout: z.boolean().optional(),
});

export const OrderSchema = z.object({
    id: z.string(),
    customerName: z.string(),
    customerPhone: z.string().optional(),
    items: z.array(OrderItemSchema),
    total: z.number(),
    status: z.string(), // OrderStatus enum
    type: z.string(),   // OrderType enum
    origin: z.string(),
    payments: z.array(PaymentTransactionSchema).optional(),
    createdAt: z.any(),
    tenantId: z.string(),
    ownerUid: z.string().min(1, "Owner UID obrigatório") // SECURITY: ENFORCED
});

// --- USER & PERMISSIONS SCHEMA ---
export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    permissions: z.array(z.string())
});

export const SystemUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    tenantId: z.string(),
    roleId: z.string(),
    role: RoleSchema.optional(),
    active: z.boolean(),
    // Master User Fields (optional)
    businessName: z.string().optional(),
    cnpj: z.string().optional(),
    isMasterUser: z.boolean().optional()
});

// --- INGREDIENT SCHEMA ---
export const IngredientSchema = z.object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
    currentStock: z.number().nullish().default(0),
    minStock: z.number().nullish().default(0),
    cost: z.number().nullish().default(0),
    // Enhanced fields
    costPerUnit: z.number().optional(),
    isActive: z.boolean().optional(),
    supplier: z.string().optional(),
    averageCost: z.number().optional(),
    lastPurchasePrice: z.number().optional(),
    category: z.string().optional(),
    purchaseUnit: z.string().optional(),
    conversionFactor: z.number().optional(),
    ownerUid: z.string().min(1, "Owner UID obrigatório") // SECURITY: ENFORCED
});

// --- SECURITY SCHEMAS (Phase 2) ---

// Authentication & Login Validation
export const LoginSchema = z.object({
    email: z.string()
        .email("Email inválido")
        .min(5, "Email muito curto")
        .max(100, "Email muito longo")
        .transform(val => val.toLowerCase().trim()),
    password: z.string()
        .min(6, "Senha deve ter no mínimo 6 caracteres")
        .max(100, "Senha muito longa")
});

// Customer Data Validation (Public Forms)
export const CustomerDataSchema = z.object({
    name: z.string()
        .min(2, "Nome muito curto")
        .max(100, "Nome muito longo")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras")
        .transform(val => val.trim()),
    phone: z.string()
        .regex(PHONE_REGEX, "Telefone inválido")
        .transform(val => val.replace(/\D/g, '')), // Remove non-digits
    email: z.string()
        .email("Email inválido")
        .max(100, "Email muito longo")
        .transform(val => val.toLowerCase().trim())
        .optional(),
    address: z.string()
        .min(10, "Endereço muito curto")
        .max(200, "Endereço muito longo")
        .transform(val => val.trim())
        .optional()
});

// Enhanced Order Creation Validation (matches Firestore rules)
export const CreateOrderSchema = z.object({
    tenantId: z.string().min(1, "Tenant ID obrigatório"),
    customerName: z.string()
        .min(1, "Nome do cliente obrigatório")
        .max(100, "Nome muito longo")
        .transform(val => val.trim()),
    customerPhone: z.string()
        .regex(PHONE_REGEX, "Telefone inválido")
        .optional(),
    items: z.array(OrderItemSchema)
        .min(1, "Pedido deve ter pelo menos 1 item")
        .max(50, "Máximo de 50 itens por pedido"),
    total: z.number()
        .min(0.01, "Total deve ser maior que zero")
        .max(10000, "Total máximo de R$ 10.000 por pedido"),
    type: z.enum(['DELIVERY', 'TAKEOUT', 'DINE_IN']),
    origin: z.enum(['POS', 'DIGITAL_MENU', 'IFOOD', 'WHATSAPP']),
    deliveryAddress: z.string().max(200).optional(),
    notes: z.string().max(500).optional()
});

// Input Sanitization Helper
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>"']/g, '') // Remove potentially dangerous characters
        .substring(0, 1000); // Hard limit
}

// Validate and sanitize user input
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
}
