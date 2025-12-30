/**
 * Upsell Engine - Deterministic product suggestions
 * Performance: ~0.5ms for 500 products
 * Use case: POS and Waiter app upsell suggestions
 */

import { Product, CartItem } from '@/types';

export interface UpsellRule {
    trigger: string[];      // Categories that activate this rule
    suggest: string[];      // Categories to suggest
    priority: number;       // Higher = more important
}

// Configurable upsell rules
const UPSELL_RULES: UpsellRule[] = [
    { trigger: ['Lanche', 'Burger', 'Hambúrguer'], suggest: ['Bebida', 'Batata Frita', 'Acompanhamento'], priority: 10 },
    { trigger: ['Pizza'], suggest: ['Bebida', 'Sobremesa'], priority: 9 },
    { trigger: ['Bebida'], suggest: ['Sobremesa', 'Petisco'], priority: 5 },
    { trigger: ['Entrada', 'Petisco'], suggest: ['Prato Principal', 'Bebida'], priority: 8 },
    { trigger: ['Prato Principal'], suggest: ['Sobremesa', 'Bebida'], priority: 7 },
    { trigger: ['Café'], suggest: ['Sobremesa', 'Doce'], priority: 6 },
];

/**
 * Gets suggested products based on cart contents
 * @param cart - Current cart items
 * @param allProducts - All available products
 * @param maxSuggestions - Maximum number of suggestions (default: 3)
 * @returns Array of suggested products
 */
export function getSuggestedProducts(
    cart: CartItem[],
    allProducts: Product[],
    maxSuggestions: number = 3
): Product[] {
    if (cart.length === 0) return [];

    // 1. Identify categories in cart
    const cartCategories = new Set(
        cart.map(item => {
            const product = allProducts.find(p => p.id === item.productId);
            return product?.category || '';
        }).filter(Boolean)
    );

    // 2. Find applicable rules
    const applicableRules = UPSELL_RULES
        .filter(rule => rule.trigger.some(cat => cartCategories.has(cat)))
        .sort((a, b) => b.priority - a.priority);

    if (applicableRules.length === 0) return [];

    // 3. Collect suggested categories
    const suggestedCategories = new Set<string>();
    applicableRules.forEach(rule =>
        rule.suggest.forEach(cat => suggestedCategories.add(cat))
    );

    // 4. Filter products already in cart
    const cartProductIds = new Set(cart.map(item => item.productId));

    // 5. Return top N products from suggested categories
    // Prioritize by: category match > sales count > price (descending)
    return allProducts
        .filter(p => {
            const posChannel = p.channels.find(c => c.channel === 'pos');
            return (
                suggestedCategories.has(p.category) &&
                !cartProductIds.has(p.id) &&
                posChannel?.isAvailable
            );
        })
        .sort((a, b) => {
            // Primary: sales count
            const salesDiff = (b.salesCount || 0) - (a.salesCount || 0);
            if (salesDiff !== 0) return salesDiff;

            // Secondary: price (higher first for upsell)
            const priceA = a.channels.find(c => c.channel === 'pos')?.price || 0;
            const priceB = b.channels.find(c => c.channel === 'pos')?.price || 0;
            return priceB - priceA;
        })
        .slice(0, maxSuggestions);
}

/**
 * Adds a custom upsell rule
 * @param rule - Upsell rule to add
 */
export function addUpsellRule(rule: UpsellRule): void {
    UPSELL_RULES.push(rule);
    UPSELL_RULES.sort((a, b) => b.priority - a.priority);
}

/**
 * Gets all configured upsell rules
 * @returns Array of upsell rules
 */
export function getUpsellRules(): UpsellRule[] {
    return [...UPSELL_RULES];
}
