import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { extractRawMenuFromMedia } from "../ai/agents/visionAgent";
// Agents removed for Skeleton Loading Strategy
// import { engineerProductRecipe } from "../ai/agents/engineerAgent";
// import { generateProductMarketing } from "../ai/agents/marketingAgent";
// import { createFullProductTree } from "../tools/tools";

/**
 * Menu Import Orchestrator (The Gerente)
 * Triggered when a new job is created in tenants/{tenantId}/import_jobs/{jobId}
 * Using v1 for stability in southamerica-east1
 */
export const onMenuImportCreated = functions
    .region("southamerica-east1")
    .runWith({
        timeoutSeconds: 540, // 9 minutes limit
        memory: "2GB"
    })
    .firestore
    .document("tenants/{tenantId}/import_jobs/{jobId}")
    .onCreate(async (snap, context) => {
        const job = snap.data();
        const { tenantId, jobId } = context.params;
        const db = admin.firestore();
        const jobRef = snap.ref;

        // Only process pending jobs
        if (job.status !== 'pending') return;

        try {
            // 1. UPDATE STATUS TO PROCESSING
            await jobRef.update({
                status: 'processing',
                progress: 10,
                message: 'Analisando imagem com Visão Computacional...'
            });

            // 2. STAGE 1: VISION (Extract raw items)
            const rawItems = await extractRawMenuFromMedia(job.fileUrl, job.mimeType);

            if (!rawItems || rawItems.length === 0) {
                await jobRef.update({
                    status: 'error',
                    progress: 0,
                    message: 'Não foi possível identificar itens no cardápio. Tente uma imagem mais clara.'
                });
                return;
            }

            const restaurantName = rawItems[0]?.restaurantName || "";
            const totalItems = rawItems.length;

            await jobRef.update({
                status: 'processing',
                progress: 40,
                totalItems,
                message: `Identifiquei ${totalItems} itens${restaurantName ? ' do ' + restaurantName : ''}! Organizando catálogo...`
            });

            await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for UX "feeling"

            // 3. FAST IMPORT: Save Drafts directly (Batch Write)
            const batch = db.batch();
            const productsRef = db.collection('products');
            const categoriesRef = db.collection('tenants').doc(tenantId).collection('categories');

            // 3.1 Fetch Existing Categories for Fuzzy Matching
            const existingCategoriesSnap = await categoriesRef.get();
            const existingCategories = existingCategoriesSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name.toLowerCase().trim()
            }));

            const categoryMap = new Map<string, string>(); // Name -> ID

            // Helper to find or create category ID
            const getCategoryId = (name: string): string => {
                const cleanName = (name || 'Geral').trim();
                const lowerName = cleanName.toLowerCase();

                // Check local map first (for items in same batch)
                if (categoryMap.has(lowerName)) return categoryMap.get(lowerName)!;

                // Check database existing
                const found = existingCategories.find(c => c.name === lowerName);
                if (found) {
                    categoryMap.set(lowerName, found.id);
                    return found.id;
                }

                // Create NEW Category (Virtual for now, will batch commit)
                const newCatRef = categoriesRef.doc();
                batch.set(newCatRef, {
                    name: cleanName,
                    description: 'Importada via IA',
                    isActive: true,
                    order: 99,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Update local lookups
                existingCategories.push({ id: newCatRef.id, name: lowerName });
                categoryMap.set(lowerName, newCatRef.id);

                return newCatRef.id;
            };

            rawItems.forEach((item) => {
                const finalCategoryId = getCategoryId(item.categoryName || 'Geral');

                const newProductRef = productsRef.doc();
                batch.set(newProductRef, {
                    tenantId,
                    name: item.name,
                    price: Number(item.price) || 0,
                    description: item.originalDescription || '',
                    categoryId: finalCategoryId,
                    categoryName: item.categoryName || 'Geral',
                    category: item.categoryName || 'Geral', // FIX: Sync with Frontend Schema
                    status: 'DRAFT',
                    enrichmentStatus: 'pending',
                    channels: [
                        { channel: 'pos', isAvailable: true, price: Number(item.price) || 0, displayName: item.name },
                        { channel: 'digital-menu', isAvailable: true, price: Number(item.price) || 0, displayName: item.name, description: item.originalDescription || '' },
                        { channel: 'ifood', isAvailable: false, price: Number(item.price) || 0, displayName: item.name } // Default to inactive
                    ],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await jobRef.update({
                status: 'processing',
                progress: 80,
                message: `Salvando ${rawItems.length} rascunhos no banco de dados...`
            });

            await batch.commit();

            // 4. FINALIZATION (Instant)
            await jobRef.update({
                status: 'completed',
                progress: 100,
                message: 'Leitura concluída! Seus produtos estão prontos.'
            });

        } catch (error: any) {
            console.error('[Orchestrator] Erro Fatal:', error);
            await jobRef.update({
                status: 'error',
                message: `Erro crítico: ${error.message}`
            });
        }
    });
