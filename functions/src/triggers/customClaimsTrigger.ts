import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * CRITICAL: Set tenantId custom claim when user document is created/updated
 * This is required for the new Firestore security rules to work
 */
export const setTenantCustomClaim = functions.firestore.onDocumentWritten(
    {
        document: 'system_users/{userId}',
        region: 'southamerica-east1'
    },
    async (event) => {
        const userId = event.params.userId;
        const data = event.data?.after?.data();

        if (!data) {
            console.log(`[setTenantCustomClaim] User ${userId} deleted, skipping`);
            return;
        }

        const tenantId = data.tenantId;

        if (!tenantId) {
            console.warn(`[setTenantCustomClaim] ⚠️ User ${userId} has no tenantId!`);
            return;
        }

        try {
            // Get current custom claims
            const user = await admin.auth().getUser(userId);
            const currentClaims = user.customClaims || {};

            // Only update if tenantId changed
            if (currentClaims.tenantId === tenantId) {
                console.log(`[setTenantCustomClaim] tenantId already set for ${userId}`);
                return;
            }

            // Set custom claim
            await admin.auth().setCustomUserClaims(userId, {
                ...currentClaims,
                tenantId: tenantId
            });

            console.log(`[setTenantCustomClaim] ✅ Set tenantId custom claim for ${userId}: ${tenantId}`);
        } catch (error) {
            console.error(`[setTenantCustomClaim] ❌ Error setting custom claim for ${userId}:`, error);
        }
    }
);
