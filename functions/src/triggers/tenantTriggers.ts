import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

/**
 * Tenant Validation Trigger
 * Logs errors for documents missing tenantId.
 */
export const validateTenantId = onDocumentCreated(
    {
        document: '{collection}/{docId}',
        region: 'southamerica-east1'
    },
    async (event) => {
        const db = admin.firestore();
        const collection = event.params.collection;
        const docId = event.params.docId;
        const data = event.data?.data();

        if (!data) return;

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
    }
);

/**
 * Centralized Error Logging
 */
export const logFirestoreError = onCall(
    {
        region: 'southamerica-east1'
    },
    async (request) => {
        const db = admin.firestore();
        const { error, operation, userId, metadata } = request.data;
        const context = request;

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
    }
);
