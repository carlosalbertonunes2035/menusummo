import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * Vision Agent (O Olheiro)
 * Role: Extract raw text and structure from Menu Photos/PDFs.
 */
export async function extractRawMenuFromMedia(fileUrl: string, mimeType: string) {
    console.log(`[VisionAgent] 📸 Analisando mídia: ${mimeType}`);

    const visionPrompt = `
        ATUE COMO UM TRANSCRITOR ESPECIALISTA EM CARDÁPIOS DE ALTA PRECISÃO.
        
        Sua tarefa é extrair TODOS os produtos visíveis neste cardápio (Imagem ou PDF).
        
        DIRETRIZES DE EXTRAÇÃO:
        1. CONTEXTO: Identifique o nome do estabelecimento (ex: "JC Bar - Espetaria"). Use isso para entender a simplicidade ou sofisticação dos itens.
        2. FIDELIDADE: Capture o nome exato do produto. NÃO adicione palavras que não estão escritas.
        3. DESCRIÇÃO RÍGIDA: Capture a descrição EXATA que está abaixo ou ao lado do item. Se não houver descrição, deixe em branco. NÃO INVENTE INGREDIENTES.
        4. PREÇO E CATEGORIA: Capture o preço numérico e a categoria (ex: "ESPETOS", "PORÇÕES FRITAS").
        
        RETORNE APENAS UM JSON ARRAY: [{ name, price, categoryName, originalDescription, restaurantName }].
    `;

    const result = await ai.generate({
        model: MODELS.fast, // Gemini 1.5 Flash is excellent for this
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
                    categoryName: z.string().optional(),
                    originalDescription: z.string().optional(),
                    restaurantName: z.string().optional()
                }))
            })
        },
        config: { temperature: 0.1 }
    });

    return result.output.items;
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

    return result.output;
}
