import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * POS Agent (O Garçom Digital)
 * Role: Parse natural language orders into structured product items.
 */
export async function parseOrderText(text: string, products: any[]) {
    console.log(`[POSAgent] 📝 Analisando pedido: "${text}"`);

    // Create a simplified product list for context window efficiency
    const contextProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.channels?.find((c: any) => c.channel === 'pos')?.price || 0
    }));

    const prompt = `
        ATUE COMO UM GARÇOM DIGITAL EXPERIENTE.
        
        PEDIDO DO CLIENTE: "${text}"
        
        CARDÁPIO DISPONÍVEL (ID, NOME, PREÇO):
        ${JSON.stringify(contextProducts)}

        SUA TAREFA:
        1. Identifique os produtos do cardápio mencionados no pedido.
        2. Extraia a quantidade de cada item. Se não especificado, assuma 1.
        3. Identifique observações ou modificações (ex: "sem cebola").
        4. Associe ao ID correto do produto.
        
        RETORNE EM JSON (Array):
        [
          { "productId": "ID_DO_PRODUTO", "quantity": 1, "notes": "observacao" }
        ]
    `;

    const result = await ai.generate({
        model: MODELS.fast, // Gemini 1.5 Flash is enough for this
        prompt,
        output: {
            format: 'json',
            schema: z.array(z.object({
                productId: z.string(),
                quantity: z.number(),
                notes: z.string()
            }))
        },
        config: { temperature: 0.1 } // Low temperature for precision
    });

    return result.output;
}

/**
 * Suggests a product to upsell based on rules (Deterministic & Fast).
 * REPLACED AI: Significantly faster (< 5ms) and zero cost.
 */
export async function suggestUpsell(addedProduct: any, allProducts: any[]) {
    // console.log(`[POSAgent] 💡 Buscando upsell (Algo) para: ${addedProduct.name}`);

    // 1. Define Complementary Categories
    // If user bought Burger -> Suggest Drink or Fries
    // If user bought Drink -> Suggest Dessert
    const categoryRules: Record<string, string[]> = {
        'Lanche': ['Bebida', 'Acompanhamento', 'Sobremesa'],
        'Pizza': ['Bebida', 'Borda', 'Sobremesa'],
        'Prato': ['Bebida', 'Salada', 'Sobremesa'],
        'Bebida': ['Sobremesa', 'Porção'],
        'default': ['Bebida', 'Sobremesa']
    };

    // Normalize category
    const mainCategory = normalizeCategory(addedProduct.category);
    const targetCategories = categoryRules[mainCategory] || categoryRules['default'];

    // 2. Find Candidates
    const candidates = allProducts.filter(p =>
        p.id !== addedProduct.id && // Not the same product
        p.isAvailable !== false &&
        targetCategories.some(cat => normalizeCategory(p.category) === normalizeCategory(cat))
    );

    // 3. Fallback: If no match, try "Populares" or High Margin (simplified to Price here)
    // In a real scenario, use 'salesCount' or 'margin'.
    let chosen = candidates.sort((a, b) => (b.price || 0) - (a.price || 0))[0];

    // If still nothing, pick any different item
    if (!chosen) {
        chosen = allProducts.find(p => p.id !== addedProduct.id);
    }

    if (!chosen) return null;

    return {
        suggestedProductId: chosen.id,
        reason: `Combina bem com ${addedProduct.name} (Oferta Especial)`
    };
}

// Helper for fuzzy string matching
function normalizeCategory(cat: string = ''): string {
    const s = cat.toLowerCase();
    if (s.includes('lanche') || s.includes('burger') || s.includes('sandu')) return 'Lanche';
    if (s.includes('pizza')) return 'Pizza';
    if (s.includes('bebida') || s.includes('suco') || s.includes('refrigerante')) return 'Bebida';
    if (s.includes('doce') || s.includes('sobremesa')) return 'Sobremesa';
    return cat;
}
