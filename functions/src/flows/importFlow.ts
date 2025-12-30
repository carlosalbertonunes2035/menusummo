/**
 * SUMMO Smart Import Flow - Multimodal v4.0 (Genkit + Gemini 1.5 Flash)
 * Supports: iFood Scraper (Batch) + Photo/PDF (Vision)
 * Implements "Match & Create" strategy to prevent inventory duplication.
 */
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'genkit';
import { ai, MODELS } from '../ai/config';
import { createFullProductTree } from '../tools/tools';

// Cloud Function: Smart Import (Multimodal)
export const startSmartImport = onCall({
    memory: '1GiB',
    timeoutSeconds: 540,
    region: 'southamerica-east1',
}, async (request) => {
    console.log('[SmartImport] 🚀 Iniciando importação multimodal v4.0...');

    // Auth check
    if (!request.auth) {
        throw new Error('Não autorizado. Faça login para continuar.');
    }

    const { items, fileUrl, mimeType, tenantId } = request.data;
    const db = admin.firestore();

    if (!tenantId) {
        throw new Error('tenantId é obrigatório.');
    }

    // 1. Carregar Insumos Existentes para contexto da IA (RAG leve)
    const ingredientsSnap = await db.collection('ingredients')
        .where('tenantId', '==', tenantId)
        .limit(500)
        .get();

    const existingIngredientsList = ingredientsSnap.docs.map(doc => {
        const d = doc.data();
        return `${d.name} (ID: ${doc.id}, Unidade: ${d.unit}, Custo/Un: R$ ${d.costPerUnit || d.cost || 0})`;
    }).join('\n');

    const rulesPrompt = `
        ATUE COMO UM CHEF EXECUTIVO E CONSULTOR FINANCEIRO DE RESTAURANTES (Nível Michelin).

        REGRA DE OURO DOS INSUMOS (MATCHING INTELIGENTE):
        Abaixo está a lista de insumos JÁ CADASTRADOS no estoque:
        ---
        ${existingIngredientsList || 'Nenhum insumo cadastrado.'}
        ---

        SUA MISSÃO - PARA CADA PRODUTO:
        1.  **Decomposição Culinária Profunda:** Não crie apenas "Pão e Carne". Imagine a receita real completa. Ex: "Pão Brioche, Blend Angus 150g, Queijo Cheddar Fatiado, Maionese da Casa, Bacon Crocante".
        2.  **Estimativa Financeira Precisa (Hallucination Controlada):**
            - Para insumos NOVOS, você DEVE "imaginar" o Custo de Mercado atual (ex: R$ 40,00/kg para Carne, R$ 0,80/un para Pão).
            - Seja realista. O custo total (CMV) deve girar em torno de 25-35% do preço de venda.
        3.  **Matching:** Se encontrar um insumo similar na lista acima, USE-O (ID e Nome). Caso contrário, crie um novo.
        4.  **Canais de Venda:** Marque o produto como disponível para 'pos', 'digital-menu' e 'ifood'.
        5.  **Controle de Estoque:** Defina o campo 'trackStock' como ${request.data.trackStock ?? true}.

        SAÍDA ESPERADA:
        Use a ferramenta 'createFullProductTree' para estruturar esses dados.
        O tenantId é: ${tenantId}
    `;

    try {
        if (fileUrl && mimeType) {
            // Cenario A: Importação via FOTO / PDF (Vision)
            console.log(`[SmartImport] 📸 Processando arquivo multimodal: ${mimeType}`);

            await ai.generate({
                model: MODELS.fast, // Gemini 1.5 Flash supports multimodal
                prompt: [
                    { text: `Analise este cardápio (Imagem/PDF) e extraia todos os produtos e suas receitas.\n\n${rulesPrompt}` },
                    { media: { url: fileUrl, contentType: mimeType } }
                ],
                tools: [createFullProductTree],
                config: { temperature: 0.1 }
            });

        } else if (items && Array.isArray(items)) {
            // Cenario B: Importação via Scraper (JSON Items)
            console.log(`[SmartImport] 🕸️ Processando ${items.length} itens do scraper`);

            const scraperPrompt = `
                Converta a seguinte lista de itens extraídos do iFood em produtos estruturados com ficha técnica.
                
                DADOS DOS ITENS:
                ${JSON.stringify(items)}

                ${rulesPrompt}
            `;

            await ai.generate({
                model: MODELS.fast,
                prompt: scraperPrompt,
                tools: [createFullProductTree],
                config: { temperature: 0.1 }
            });
        } else {
            throw new Error('Nenhum dado de entrada válido (items ou fileUrl).');
        }

        return {
            success: true,
            message: 'Importação concluída com sucesso! Os produtos estão sendo criados no banco de dados.'
        };

    } catch (error: any) {
        console.error('[SmartImport] ❌ Erro Fatal:', error.message);
        throw new Error(`Falha na importação: ${error.message}`);
    }
});
