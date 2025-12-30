export type SalesChannel = 'pos' | 'digital-menu' | 'ifood';

export interface ChannelConfig {
    channel: SalesChannel;
    displayName?: string;
    price: number;
    promotionalPrice?: number;
    description?: string;
    image?: string;
    isAvailable: boolean;
    videoUrl?: string; // Inferred from usage in utils.ts
    category?: string; // Override base product category for this channel
    sortOrder?: number; // New: Sort order for product within the category
}

export interface Ingredient {
    id: string;
    name: string;
    cost: number;
    unit: string;
    minStock: number;
    currentStock: number;
    costPerUnit?: number; // Added to fix errors
    isActive?: boolean;   // Added to fix errors
    supplier?: string;
    lastUpdated?: Date;
    image?: string;
    // Enhanced inventory fields
    averageCost?: number;
    lastPurchasePrice?: number;
    lastPurchaseDate?: Date;
    category?: string; // e.g., 'Meat', 'Vegetable', 'Packaging'
    purchaseUnit?: string; // e.g., 'Fardo', 'Caixa'
    conversionFactor?: number; // e.g., 12
    tenantId?: string;
    ownerUid?: string;
}

export interface Product {
    id: string;
    status?: 'ACTIVE' | 'ARCHIVED' | 'PAUSED'; // Global availability status
    type?: 'SIMPLE' | 'COMBO';
    comboItems?: {
        productId: string;
        quantity: number;
        overridePrice?: number;
    }[];
    comboSteps?: {
        name: string;
        description?: string;
        min: number;
        max: number;
        items: {
            productId: string;
            overridePrice?: number; // Internal price for reference/analytics
        }[];
    }[];
    name: string;
    category: string;
    cost: number;
    tags: string[];
    ingredients: { ingredientId: string; amount: number }[]; // Inferred
    optionGroupIds: string[];
    channels: ChannelConfig[];
    image?: string;
    imageAlt?: string; // SEO alt text for accessibility
    imageFit?: 'cover' | 'contain';
    description?: string;
    realCost?: number; // Added to fix useProductPricing error
    trackStock?: boolean; // New: If false, stock won't be deducted on sale
    // New inventory & recipe fields
    recipeId?: string;
    preparationTime?: number; // In minutes
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    slug?: string;
    likes?: number;
    tenantId?: string;
    ownerUid?: string;
    // Legacy/Migration fields
    price?: number; // Root price for simple products
    categoryId?: string; // Reference to category doc
    categoryName?: string; // Denormalized category name
}
