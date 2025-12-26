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

/**
 * Strict Visual Analysis for "Food Porn" Enhancement.
 * Extracts ONLY what is visible to prevent hallucination of ingredients.
 */
export async function analyzeForVisualEnhancement(fileUrl: string) {
    console.log(`[VisionAgent] 🖼️ Analisando estrutura visual para aprimoramento...`);

    const prompt = `
        ATUE COMO UM DIRETOR DE FOTOGRAFIA DE ALIMENTOS (Fidelity Inspector).

        OBJETIVO: Descrever esta imagem para que uma IA possa "refazê-la" com maior qualidade, mas SEM alterar os ingredientes.

        TAREFA:
        1. Liste os INGREDIENTES VISÍVEIS (Seja rígido. Se não vê, não liste).
        2. Descreva o EMPRATAMENTO (Prato, Tábua, Copo, etc).
        3. Descreva o ÂNGULO (Top-down, 45 graus, Macro).
        4. Descreva a ILUMINAÇÃO ATUAL (Natural, Escura, Flash estourado).
        5. ANALISE O CONTEXTO/VIBE (Ex: "Bar Rústico", "Jantar Romântico", "Street Food", "Café Manhã").
        6. SUGIRA A ILUMINAÇÃO DE ESTÚDIO IDEAL PARA ESSE TIPO DE COMIDA (Ex: "Luz quente e dramática para bar", "Luz natural difusa para salada").

        SAÍDA ESPERADA (JSON):
        {
            "visibleIngredients": "lista de ingredientes",
            "platingStyle": "descrição do suporte e organização",
            "cameraAngle": "ângulo da foto",
            "lighting": "condição de luz atual",
            "marketingVibe": "atmosfera sugerida",
            "lightingSuggestion": "sugestão técnica de luz"
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
                visibleIngredients: z.string(),
                platingStyle: z.string(),
                cameraAngle: z.string(),
                lighting: z.string(),
                marketingVibe: z.string().describe("A vibe comercial do produto (ex: Rústico, Gourmet, Vegano Fresh)"),
                lightingSuggestion: z.string().describe("Sugestão de iluminação para food porn (ex: Softbox lateral, Golden Hour)")
            })
        },
        config: { temperature: 0.2 } // Slightly higher temp for creative vibe detection
    });

    return result.output;
}
