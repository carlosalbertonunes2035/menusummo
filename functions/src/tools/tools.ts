import { ai } from '../ai/config';
import * as admin from 'firebase-admin';
import { FullProductTreeSchema } from '../shared/schemas';

/**
 * createFullProductTree
 * Atomic tool to create multiple Products, their Recipes, and any missing Ingredients.
 * Implements the "Match & Create" strategy for precise inventory tracking.
 */
export const createFullProductTree = ai.defineTool({
    name: 'createFullProductTree',
    description: 'Cria uma lista de produtos completos com fiches técnicas e ingredientes, vinculando a insumos existentes ou criando novos.',
    inputSchema: FullProductTreeSchema,
}, async (input) => {
    const db = admin.firestore();
    const batch = db.batch();
    const tenantId = input.tenantId;

    console.log(`[Tool] 🛠️ Processando lote de ${input.products.length} produtos para Tenant: ${tenantId}`);

    const summary = [];

    for (const prod of input.products) {
        const recipeIngredients = [];
        let totalRecursiveCost = 0;

        // 1. Processar Insumos
        for (const item of prod.ingredients) {
            let ingredientId = item.existingId;
            let currentUnitCost = item.estimatedCost || 0;
            let finalName = item.name;

            if (ingredientId) {
                // Buscar custo real se o ID for fornecido (Matching)
                const ingDoc = await db.collection('ingredients').doc(ingredientId).get();
                if (ingDoc.exists) {
                    const data = ingDoc.data();
                    currentUnitCost = data?.costPerUnit || data?.cost || currentUnitCost;
                    finalName = data?.name || finalName;
                }
            } else {
                // Criar novo insumo se não houver match
                const newIngRef = db.collection('ingredients').doc();
                ingredientId = newIngRef.id;

                const costPerUnit = (item.estimatedCost || 0) / (item.unit === 'kg' || item.unit === 'l' ? 1000 : 1);

                batch.set(newIngRef, {
                    id: ingredientId,
                    tenantId: tenantId,
                    name: item.name,
                    unit: item.unit,
                    cost: item.estimatedCost || 0,
                    costPerUnit: costPerUnit,
                    minStock: 0,
                    currentStock: 0,
                    isActive: true,
                    category: 'Importado via IA',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                currentUnitCost = costPerUnit;
            }

            const itemCost = item.quantity * currentUnitCost;
            totalRecursiveCost += itemCost;

            recipeIngredients.push({
                ingredientId,
                name: finalName,
                quantity: item.quantity,
                unit: item.unit,
                cost: itemCost // Snapshot do custo para a receita
            });
        }

        // 2. Criar Receita
        const recipeRef = db.collection('recipes').doc();
        const productRef = db.collection('products').doc();

        batch.set(recipeRef, {
            id: recipeRef.id,
            tenantId: tenantId,
            productId: productRef.id,
            name: `Receita: ${prod.name}`,
            description: `Ficha técnica gerada via importação inteligente para ${prod.name}`,
            ingredients: recipeIngredients,
            steps: [],
            yield: 1,
            yieldUnit: 'porção',
            totalCost: totalRecursiveCost,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 3. Criar Produto
        batch.set(productRef, {
            id: productRef.id,
            tenantId: tenantId,
            name: prod.name,
            description: prod.description || '',
            category: prod.category,
            type: 'SIMPLE',
            cost: totalRecursiveCost,
            recipeId: recipeRef.id,
            status: 'draft',
            tags: ['importado', 'ia-match'],
            channels: [
                { channel: 'pos', price: prod.price, isAvailable: true, displayName: prod.name },
                { channel: 'digital-menu', price: prod.price, isAvailable: true, displayName: prod.name },
                { channel: 'ifood', price: prod.price, isAvailable: true, displayName: prod.name }
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        summary.push(prod.name);
    }

    await batch.commit();

    return `Sucesso: Lote de ${input.products.length} produtos criado (${summary.join(', ')}).`;
});
