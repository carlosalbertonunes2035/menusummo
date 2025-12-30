import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * Vision Agent (O Olheiro)
 * Role: Extract raw text and structure from Menu Photos/PDFs.
 */
export async function extractRawMenuFromMedia(fileUrl: string, mimeType: string) {
    console.log(`[VisionAgent] 📸 Analisando mídia: ${mimeType}`);

    const visionPrompt = `
        ATUE COMO UM TRANSCRITOR ESPECIALISTA EM CARDÁPIOS.
        
        Sua tarefa é extrair TODOS os produtos visíveis neste cardápio (Imagem ou PDF), independente do layout.
        
        DIRETRIZES DE EXTRAÇÃO (ROBUSTAS):
        1. HIERARQUIA VISUAL E CATEGORIAS (OBRIGATÓRIO):
           - TENTE identificar Cabeçalhos de Seção (ex: "Burgers", "Bebidas").
           - SE NÃO HOUVER cabeçalhos, CLASSIFIQUE pelo bom senso (ex: Cerveja -> "Bebidas", Picanha -> "Espetos").
           - PREENCHA SEMPRE O CAMPO categoryName. Não retorne null ou vazio. Use "Geral" apenas em último caso.

        2. FIDELIDADE x INFERÊNCIA:
           - Nome: Use o nome exato.
           - Descrição: Use a descrição exata se houver. Se for óbvio (ex: X-Bacon), pode preencher "Pão, carne, queijo e bacon".
           - Preço: Procure números próximos ao item (R$, $, pares 00,00). Converta para número puro.
           
        3. FOCO TOTAL:
           - Extraia TUDO o que parecer um item vendável.
           - Se a imagem estiver ruim, faça o seu MELHOR palpite.
        
        RETORNE APENAS UM JSON ARRAY: [{ name, price, categoryName, originalDescription, restaurantName }].
    `;

    const result = await ai.generate({
        model: MODELS.fast, // Gemini 2.0 Flash (Fast & Capable)
        prompt: [
            { text: visionPrompt },
            { media: { url: fileUrl, contentType: mimeType } }
        ],
        output: {
            format: 'json',
            schema: z.object({
                items: z.array(z.object({
                    name: z.string(),
                    price: z.number().optional(),
                    categoryName: z.string().describe("Categoria do item. Ex: 'Espetos', 'Bebidas'. NUNCA NULO."),
                    originalDescription: z.string().optional(),
                    restaurantName: z.string().optional()
                }))
            })
        },
        config: { temperature: 0.1 }
    });

    return result.output?.items || [];
}

/**
 * Extract items from a bulk receipt image/PDF.
 */
export async function analyzeBulkReceipt(fileUrl: string, mimeType: string) {
    console.log(`[VisionAgent] 🧾 Analisando nota: ${mimeType}`);

    const prompt = `
        ATUE COMO UM ASSISTENTE CONTÁBIL.
        
        Sua tarefa é ler esta NOTA FISCAL ou RECIBO DE COMPRA.
        
        EXTRAIA OS ITENS COMPRADOS:
        1. Nome do produto (rawName)
        2. Quantidade (quantity)
        3. Custo Total do item (totalCost)
        4. Unidade de medida (unit) - se disponível (kg, un, cx)
        
        RETORNE JSON ARRAY:
        [{ "rawName": "...", "quantity": 1, "totalCost": 10.50, "unit": "kg" }]
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt: [
            { text: prompt },
            { media: { url: fileUrl, contentType: mimeType } }
        ],
        output: {
            format: 'json',
            schema: z.array(z.object({
                rawName: z.string(),
                quantity: z.number(),
                totalCost: z.number(),
                unit: z.string().optional()
            }))
        },
        config: { temperature: 0.1 }
    });
    return result.output || [];
}

/**
 * Strict Visual Analysis for "Food Porn" Enhancement.
 * Extracts ONLY what is visible to prevent hallucination of ingredients.
 */
export async function analyzeForVisualEnhancement(fileUrl: string) {
    console.log(`[VisionAgent] 🖼️ Analisando estrutura visual para aprimoramento...`);

    const prompt = `
        ATUE COMO UM DESCRITOR VISUAL PARA IA (Blind Assistant).

        OBJETIVO: Descrever a imagem em termos de FORMAS, CORES e TEXTURAS.

        TAREFA (PRIMITIVAS VISUAIS):
        1. Descreva os OBJETOS PRINCIPAIS por sua geometria e textura (Ex: "Tiras alongadas douradas e crocantes", "Cubos marrons suculentos").
        2. NÃO USE NOMES DE PRATOS. (Evite "Strogonoff", "Sushi").
        3. Descreva a organização no prato (Ex: "Pilha centralizada").
        4. Descreva a Luz e a Vibe.

        SAÍDA ESPERADA (JSON):
        {
            "visualPrimitives": "descrição física detalhada",
            "platingGeometry": "descrição da posição",
            "lightingCondition": "descrição da luz",
            "sceneVibe": "atmosfera visual"
        }
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt: [
            { text: prompt },
            { media: { url: fileUrl, contentType: 'image/jpeg' } }
        ],
        output: {
            format: 'json',
            schema: z.object({
                visualPrimitives: z.string(),
                platingGeometry: z.string(),
                lightingCondition: z.string(),
                sceneVibe: z.string()
            })
        },
        config: { temperature: 0.1 }
    });

    // Return extended object to support both new and legacy fields if needed
    // But mainly targeting new schema
    if (!result.output) {
        return {
            visualPrimitives: '',
            platingGeometry: '',
            lightingCondition: '',
            sceneVibe: '',
            visibleIngredients: '',
            platingStyle: '',
            lightingSuggestion: '',
            marketingVibe: '',
            lighting: '',
            cameraAngle: "N/A"
        };
    }

    return {
        ...result.output,
        // Legacy mapping for safety if any other code uses it, though MarketingAgent is updated
        visibleIngredients: result.output.visualPrimitives,
        platingStyle: result.output.platingGeometry,
        lightingSuggestion: result.output.lightingCondition,
        marketingVibe: result.output.sceneVibe,
        lighting: result.output.lightingCondition,
        cameraAngle: "N/A"
    };
}
