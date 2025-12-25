import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * Marketing Agent (O Marketeiro)
 * Role: Generate high-conversion descriptions và technical SEO.
 */
export async function generateProductMarketing(productName: string, ingredientsSummary: string, restaurantName: string = "") {
    console.log(`[MarketingAgent] 📣 Gerando marketing para: ${productName} (${restaurantName})`);

    const prompt = `
        ATUE COMO COPYWRITER DE GASTRONOMIA.
        
        ESTABELECIMENTO: ${restaurantName || "Restaurante"}
        PRODUTO: ${productName}
        INGREDIENTES: ${ingredientsSummary}

        TAREFA:
        1. Gere um SLUG de URL amigável.
        2. Crie uma DESCRIÇÃO IFOOD: Siga o tom de voz do ${restaurantName}. Se for um bar de espetaria, use um tom direto, convidativo e focado na brasa. Se for gourmet, use sofisticação.
        3. Crie uma DESCRIÇÃO SITE: Mais detalhada.
        4. Gere Meta-Title e Meta-Description para Google.
        
        RETORNE EM JSON.
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.object({
                slug: z.string(),
                ifoodDescription: z.string(),
                siteDescription: z.string(),
                seo: z.object({
                    title: z.string(),
                    description: z.string()
                })
            })
        },
        config: { temperature: 0.7 }
    });

    return result.output;
}

/**
 * Generates social media content ideas based on a user prompt.
 */
export async function generateSocialMediaContent(userPrompt: string) {
    console.log(`[MarketingAgent] 📱 Criando conteúdo social para: "${userPrompt}"`);

    const prompt = `
        ATUE COMO UM SOCIAL MEDIA EXPERT PARA RESTAURANTES.
        
        TEMA SOLICITADO: "${userPrompt}"

        SUA TAREFA:
        Crie 3 ideias de conteúdo (Posts ou Stories) criativas, engajadoras e focadas em conversão.
        
        RETORNE EM JSON (Array de objetos):
        [
          { "title": "Título Curto", "content": "Legenda completa com emojis", "type": "FEED ou STORY" }
        ]
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.array(z.object({
                title: z.string(),
                content: z.string(),
                type: z.string()
            }))
        },
        config: { temperature: 0.8 }
    });

    return result.output;
}

/**
 * Generates SEO metadata for the store based on brand name and top products.
 */
export async function generateStoreSeo(brandName: string, topProducts: string[]) {
    console.log(`[MarketingAgent] 🔍 Otimizando SEO para: ${brandName}`);

    const prompt = `
        ATUE COMO UM ESPECIALISTA EM SEO LOCAL.
        
        MARCA: ${brandName}
        PRINCIPAIS PRODUTOS: ${topProducts.join(', ')}

        SUA TAREFA:
        1. Crie um Meta Title atraente (max 60 chars).
        2. Crie uma Meta Description persuasiva (max 160 chars).
        3. Gere 10 palavras-chave relevantes separadas por vírgula.

        RETORNE EM JSON.
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.object({
                title: z.string(),
                description: z.string(),
                keywords: z.string()
            })
        },
        config: { temperature: 0.7 }
    });


    return result.output;
}

/**
 * Generates a photorealistic image for a product.
 * Note: Requires Imagen model enabled in Vertex AI.
 */
export async function generateProductImage(productName: string) {
    console.log(`[MarketingAgent] 🎨 Gerando imagem para: ${productName}`);

    // SAFE FALLBACK: Return a high-quality Unsplash search URL based on the product name.
    const query = encodeURIComponent(productName);
    return `https://source.unsplash.com/800x600/?${query},food`;
}
