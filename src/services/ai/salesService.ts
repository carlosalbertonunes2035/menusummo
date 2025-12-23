import { Type } from "@google/genai";
import { Product } from "../../types";
import { filterRelevantProducts, getProductChannel } from "../../lib/utils";
import { getGenAIClient } from "./core";

const localParseOrder = (text: string, products: Product[]): any[] | null => {
    const lines = text.split(/[\n,]/);
    const results: any[] = [];
    for (const line of lines) {
        const match = line.match(/^\s*(\d+)?x?\s*(.*?)\s*(\d+)?\s*$/i);
        if (!match) continue;
        const qty = parseInt(match[1] || match[3] || "1");
        const namePart = match[2].trim();
        if (namePart.length < 2) continue;
        const product = products.find(p => p.name.toLowerCase() === namePart.toLowerCase());
        if (product) {
            results.push({ productId: product.id, quantity: qty });
        } else {
            return null;
        }
    }
    return results.length > 0 ? results : null;
};

export const parseOrderText = async (text: string, allProducts: Product[]): Promise<any[]> => {
    const localResults = localParseOrder(text, allProducts);
    if (localResults) return localResults;

    const ai = getGenAIClient();
    if (!ai) return [];

    const relevantProducts = filterRelevantProducts(text, allProducts, 20);
    const productList = relevantProducts.map(p => {
        const channel = getProductChannel(p, 'pos');
        return `"${p.name}" (ID:${p.id}, R$${channel.price})`;
    }).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `
          CONTEXT (Menu):
          ${productList}
          
          ORDER: "${text}"
          
          Extract items matching Menu IDs. Return JSON array: [{ productId, quantity, notes }].
        `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productId: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            notes: { type: Type.STRING }
                        },
                        required: ["productId", "quantity"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error("AI Parse Error", e);
        return [];
    }
};

export const suggestUpsell = async (targetProduct: Product, allProducts: Product[]): Promise<string | null> => {
    const ai = getGenAIClient();
    if (!ai) return null;

    const contextProducts = allProducts
        .filter(p => p.id !== targetProduct.id && getProductChannel(p, 'digital-menu').isAvailable)
        .slice(0, 30);

    const menuContext = contextProducts.map(p => `- ${p.name} (ID: ${p.id}, Categoria: ${p.category})`).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `
            MENU:
            ${menuContext}

            O cliente adicionou: "${targetProduct.name}" (Categoria: ${targetProduct.category}).
            
            Analise o cardápio e sugira UM único produto complementar (upsell/cross-sell) que aumente o ticket médio ou melhore a experiência.
            Exemplo: Se adicionou Hambúrguer, sugira Batata ou Bebida.
            
            Responda APENAS com o ID do produto sugerido.
            `,
            config: {
                responseMimeType: "text/plain"
            }
        });

        const suggestedId = response.text?.trim();
        return allProducts.find(p => p.id === suggestedId)?.id || null;
    } catch (e) {
        console.error("Upsell Suggestion Error", e);
        return null;
    }
};
