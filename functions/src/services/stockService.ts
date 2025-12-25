import * as admin from 'firebase-admin';

/**
 * Stock Deduction Service
 * Deducts ingredients from stock when an order is completed.
 */
export async function processStockDeduction(id: string, quantity: number, tenantId: string, orderId: string) {
    const db = admin.firestore();
    const ingredientRef = db.collection('ingredients').doc(id);
    const ingredientSnap = await ingredientRef.get();

    if (ingredientSnap.exists) {
        const data = ingredientSnap.data();
        const currentStock = data?.currentStock || 0;

        await ingredientRef.update({
            currentStock: currentStock - quantity,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('stock_movements').add({
            tenantId,
            ingredientId: id,
            ingredientName: data?.name,
            type: 'SALE',
            quantity: quantity,
            date: admin.firestore.FieldValue.serverTimestamp(),
            reason: `Pedido #${orderId}`,
            orderId: orderId
        });
        return;
    }

    const recipesRef = db.collection('recipes');
    const recipeQuery = await recipesRef.where('tenantId', '==', tenantId).where('productId', '==', id).limit(1).get();

    if (!recipeQuery.empty) {
        const recipeData = recipeQuery.docs[0].data();
        const factor = quantity / (recipeData.yield || 1);

        for (const component of recipeData.ingredients) {
            const subQuantity = (component.quantity || component.amount) * factor;
            await processStockDeduction(component.ingredientId, subQuantity, tenantId, orderId);
        }
    }
}
