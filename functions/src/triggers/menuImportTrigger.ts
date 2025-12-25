import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { extractRawMenuFromMedia } from "../ai/agents/visionAgent";
import { engineerProductRecipe } from "../ai/agents/engineerAgent";
import { generateProductMarketing } from "../ai/agents/marketingAgent";
import { createFullProductTree } from "../tools/tools";

/**
 * Menu Import Orchestrator (The Gerente)
 * Triggered when a new job is created in tenants/{tenantId}/import_jobs/{jobId}
 */
export const onMenuImportCreated = onDocumentCreated({
    document: "tenants/{tenantId}/import_jobs/{jobId}",
    timeoutSeconds: 540, // 9 minutes limit
    memory: "2GiB",
    region: "southamerica-east1"
}, async (event) => {
    const snap = event.data;
    if (!snap) return;

    const job = snap.data();
    const { tenantId, jobId } = event.params;
    const db = admin.firestore();
    const jobRef = snap.ref;

    // Only process pending jobs
    if (job.status !== 'pending') return;

    try {
        // 1. UPDATE STATUS TO PROCESSING
        await jobRef.update({
            status: 'processing',
            progress: 5,
            message: 'Iniciando leitura do cardápio...'
        });

        // 2. STAGE 1: VISION (Extract raw items)
        const rawItems = await extractRawMenuFromMedia(job.fileUrl, job.mimeType);

        if (!rawItems || rawItems.length === 0) {
            await jobRef.update({ status: 'error', message: 'Nenhum item identificado no cardápio.' });
            return;
        }

        const restaurantName = rawItems[0]?.restaurantName || "Restaurante";
        const totalItems = rawItems.length;

        await jobRef.update({
            progress: 15,
            totalItems,
            message: `Visão: ${totalItems} itens detectados em ${restaurantName}. Preparando engenharia...`
        });

        // 3. GET EXISTING INGREDIENTS FOR CONTEXT (RAG)
        const ingredientsSnap = await db.collection('ingredients')
            .where('tenantId', '==', tenantId)
            .limit(500)
            .get();

        const ingredientsContext = ingredientsSnap.docs.map(doc => {
            const d = doc.data();
            return `${d.name} (ID: ${doc.id}, Unidade: ${d.unit})`;
        }).join('\n');

        // 4. STAGE 2 & 3: ENRICHMENT LOOP (Engineer + Marketing)
        let processedCount = 0;

        for (const item of rawItems) {
            try {
                // A. Engineer Recipe
                const recipe = await engineerProductRecipe(
                    item.name,
                    item.price || 0,
                    item.originalDescription || "",
                    restaurantName
                );

                // B. Generate Marketing & SEO
                const marketing = await generateProductMarketing(
                    item.name,
                    recipe.ingredients.map((i: any) => i.name).join(', '),
                    restaurantName
                );

                // C. Persist using existing tool
                await createFullProductTree.run({
                    tenantId,
                    products: [{
                        name: item.name,
                        price: item.price || 0,
                        category: item.categoryName || 'Importado',
                        description: marketing.siteDescription || item.originalDescription || '',
                        ingredients: recipe.ingredients.map((i: any) => ({
                            name: i.name,
                            quantity: i.quantity,
                            unit: i.unit,
                            estimatedCost: i.estimatedCost
                        }))
                    }]
                });

                processedCount++;
                const progress = Math.round(15 + ((processedCount / totalItems) * 80));

                await jobRef.update({
                    progress,
                    message: `Processado: ${item.name} (${processedCount}/${totalItems})`
                });

            } catch (err: any) {
                console.error(`[Orchestrator] Erro no item ${item.name}:`, err.message);
                // Continue with next items
            }
        }

        // 5. FINALIZATION
        await jobRef.update({
            status: 'completed',
            progress: 100,
            message: 'Importação concluída com sucesso!'
        });

    } catch (error: any) {
        console.error('[Orchestrator] Erro Fatal:', error);
        await jobRef.update({
            status: 'error',
            message: `Erro crítico: ${error.message}`
        });
    }
});
