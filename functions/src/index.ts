import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * Secure Checkout Function
 * Recalculates totals and validates order before persisting to Firestore.
 */
export const secureCheckout = functions.https.onCall(async (data, context) => {
    const { tenantId, items, customerInfo } = data;

    if (!tenantId || !items || !Array.isArray(items)) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    try {
        let serverTotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const productDoc = await db.collection('products').doc(item.id || item.productId).get();
            if (!productDoc.exists) continue;

            const productData = productDoc.data();
            const realPrice = productData?.price || 0;

            serverTotal += realPrice * (item.quantity || 1);

            validatedItems.push({
                productId: item.id || item.productId,
                name: productData?.name,
                price: realPrice,
                quantity: item.quantity
            });
        }

        const orderData = {
            tenantId,
            items: validatedItems,
            total: serverTotal,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const orderRef = await db.collection('orders').add(orderData);

        return {
            success: true,
            orderId: orderRef.id,
            total: serverTotal
        };

    } catch (error) {
        console.error('Checkout Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process checkout.');
    }
});

/**
 * CRM Auto-Update Trigger
 * Updates the customer hub (customers collection) whenever a new order is placed.
 */
export const onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snapshot, context) => {
        const orderData = snapshot.data();
        const { tenantId, customerPhone, customerName, total, deliveryAddress, location } = orderData;

        if (!customerPhone || customerName === 'Cliente Balcão') return null;

        const cleanPhone = customerPhone.replace(/\D/g, '');
        if (cleanPhone.length < 8) return null;

        const customerRef = db.collection('customers').doc(`cust-${cleanPhone}`);

        return db.runTransaction(async (transaction) => {
            const customerDoc = await transaction.get(customerRef);

            if (customerDoc.exists) {
                const data = customerDoc.data();
                transaction.update(customerRef, {
                    totalSpent: (data?.totalSpent || 0) + total,
                    totalOrders: (data?.totalOrders || 0) + 1,
                    lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
                    address: deliveryAddress || data?.address || '',
                    location: location || data?.location || null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                transaction.set(customerRef, {
                    id: `cust-${cleanPhone}`,
                    tenantId,
                    name: customerName,
                    phone: customerPhone,
                    address: deliveryAddress || '',
                    totalSpent: total,
                    totalOrders: 1,
                    lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
                    location: location || null,
                    segments: ['NEW'],
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    });

/**
 * Stock Deduction Trigger
 * Deducts ingredients from stock when an order is moved to COMPLETED.
 */
export const onOrderStatusUpdated = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (newData.status === 'COMPLETED' && oldData.status !== 'COMPLETED') {
            const { tenantId, items } = newData;
            if (!items || !Array.isArray(items)) return null;

            for (const item of items) {
                await processStockDeduction(item.productId, item.quantity, tenantId, change.after.id);
            }
        }
        return null;
    });

async function processStockDeduction(id: string, quantity: number, tenantId: string, orderId: string) {
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

// ============================================================================
// NOVAS FUNÇÕES: Sincronização e Validação
// ============================================================================

/**
 * Sincronização automática: users <-> system_users
 * Garante que ambas coleções estejam sempre em sync
 */
export const syncUserToSystemUser = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
        const userId = context.params.userId;

        try {
            if (!change.after.exists) {
                // Usuário deletado - deletar de system_users também
                console.log(`[syncUserToSystemUser] Deletando user ${userId} de system_users`);
                await db.collection('system_users').doc(userId).delete();
                return;
            }

            const userData = change.after.data();

            // Atualizar system_users
            console.log(`[syncUserToSystemUser] Sincronizando user ${userId} para system_users`);
            await db.collection('system_users').doc(userId).set(userData, { merge: true });

            console.log(`[syncUserToSystemUser] ✅ Sincronização concluída para ${userId}`);
        } catch (error) {
            console.error(`[syncUserToSystemUser] ❌ Erro ao sincronizar ${userId}:`, error);
        }
    });

/**
 * Validação de tenantId em documentos
 * Previne criação de documentos sem tenantId
 */
export const validateTenantId = functions.firestore
    .document('{collection}/{docId}')
    .onCreate(async (snap, context) => {
        const collection = context.params.collection;
        const docId = context.params.docId;
        const data = snap.data();

        // Coleções que DEVEM ter tenantId
        const requiresTenant = [
            'products', 'orders', 'ingredients', 'customers',
            'stock_movements', 'expenses', 'drivers', 'coupons',
            'recipes', 'stories', 'print_jobs', 'option_groups'
        ];

        if (requiresTenant.includes(collection)) {
            if (!data.tenantId) {
                console.error(`[validateTenantId] ❌ Missing tenantId in ${collection}/${docId}`);

                // Deletar documento inválido
                await snap.ref.delete();

                // Logar erro
                await db.collection('error_logs').add({
                    error: 'Missing tenantId',
                    collection,
                    docId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log(`[validateTenantId] Documento ${collection}/${docId} deletado (sem tenantId)`);
            } else {
                console.log(`[validateTenantId] ✅ tenantId válido em ${collection}/${docId}`);
            }
        }
    });

/**
 * Logging centralizado de erros do Firestore
 * Chamado pelo frontend via HTTP
 */
export const logFirestoreError = functions.https.onCall(async (data, context) => {
    const { error, operation, userId, metadata } = data;

    try {
        await db.collection('error_logs').add({
            error: error || 'Unknown error',
            operation: operation || 'Unknown operation',
            userId: userId || context.auth?.uid || 'Anonymous',
            metadata: metadata || {},
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: context.rawRequest?.headers?.['user-agent'] || 'Unknown'
        });

        console.log(`[logFirestoreError] ✅ Erro logado: ${operation}`);
        return { success: true };
    } catch (err) {
        console.error('[logFirestoreError] ❌ Erro ao logar:', err);
        return { success: false, error: String(err) };
    }
});

/**
 * Cleanup de dados órfãos
 * Remove documentos de system_users que não têm correspondente em users
 */
export const cleanupOrphanedSystemUsers = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        console.log('[cleanupOrphanedSystemUsers] Iniciando limpeza...');

        const systemUsersSnapshot = await db.collection('system_users').get();

        let deletedCount = 0;

        for (const systemUserDoc of systemUsersSnapshot.docs) {
            const userId = systemUserDoc.id;

            // Verificar se existe em users
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                // Deletar órfão
                await systemUserDoc.ref.delete();
                deletedCount++;
                console.log(`[cleanupOrphanedSystemUsers] Deletado órfão: ${userId}`);
            }
        }

        console.log(`[cleanupOrphanedSystemUsers] ✅ Limpeza concluída. ${deletedCount} órfãos deletados.`);
    });
