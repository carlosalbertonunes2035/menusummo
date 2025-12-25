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
 * Suggests a product to upsell based on the current cart item.
 */
export async function suggestUpsell(addedProduct: any, allProducts: any[]) {
    console.log(`[POSAgent] 💡 Buscando upsell para: ${addedProduct.name}`);

    // Context: simplified product list
    const menuContext = allProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price || 0 }));

    const prompt = `
        ATUE COMO UM GARÇOM EXPERIENTE.
        
        CLIENTE ADICIONOU: "${addedProduct.name}" (${addedProduct.category})
        
        CARDÁPIO:
        ${JSON.stringify(menuContext)}

        SUA TAREFA:
        1. Escolha 1 item do cardápio que combine PERFEITAMENTE com o item adicionado (ex: Bebida com Lanche, Sobremesa com Prato).
        2. Não sugira itens da mesma categoria principal (ex: não sugerir outro lanche se ele pediu lanche).
        3. Priorize itens de alta margem ou populares.
        
        RETORNE EM JSON:
        { "suggestedProductId": "ID_DO_PRODUTO", "reason": "Motivo curto" }
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.object({
                suggestedProductId: z.string(),
                reason: z.string()
            })
        },
        config: { temperature: 0.6 }
    });

    return result.output;
}
