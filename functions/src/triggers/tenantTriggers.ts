import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Tenant Validation Trigger
 * Logs errors for documents missing tenantId.
 */
export const validateTenantId = functions.region('southamerica-east1').firestore
    .document('{collection}/{docId}')
    .onCreate(async (snap, context) => {
        const db = admin.firestore();
        const collection = context.params.collection;
        const docId = context.params.docId;
        const data = snap.data();

        const requiresTenant = [
            'products', 'orders', 'ingredients', 'customers',
            'stock_movements', 'expenses', 'drivers', 'coupons',
            'recipes', 'stories', 'print_jobs', 'option_groups'
        ];

        if (requiresTenant.includes(collection)) {
            if (!data.tenantId) {
                console.error(`[validateTenantId] ❌ Missing tenantId in ${collection}/${docId}`);

                await db.collection('error_logs').add({
                    error: 'Missing tenantId',
                    collection,
                    docId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    });

/**
 * Centralized Error Logging
 */
export const logFirestoreError = functions.region('southamerica-east1').https.onCall(async (data, context) => {
    const db = admin.firestore();
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

        return { success: true };
    } catch (err) {
        console.error('[logFirestoreError] ❌ Erro ao logar:', err);
        return { success: false, error: String(err) };
    }
});
