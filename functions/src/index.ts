import * as admin from 'firebase-admin';

// Initialize Admin for all functions
admin.initializeApp();

// Export AI Flows
export { startSmartImport } from './flows/importFlow';
export { getProfitInsights } from './flows/profitFlow';
export { secureCheckout } from './flows/checkoutFlow';


// Export Triggers
export {
    onOrderCreated,
    onOrderStatusUpdated
} from './triggers/orderTriggers';

export { syncUserToSystemUser } from './triggers/userTriggers';

export {
    validateTenantId,
    logFirestoreError
} from './triggers/tenantTriggers';

export { cleanupOrphanedSystemUsers } from './triggers/cronTriggers';

export { onMenuImportCreated } from './triggers/menuImportTrigger';

// Export Marketing AI Flows
import { onCall } from 'firebase-functions/v2/https';
import { generateSocialMediaContent, generateStoreSeo as generateStoreSeoAgent } from './ai/agents/marketingAgent';

export const generateSocialMedia = onCall({ region: 'southamerica-east1' }, async (request) => {
    return generateSocialMediaContent(request.data.prompt);
});

export const generateStoreSeo = onCall({ region: 'southamerica-east1' }, async (request) => {
    return generateStoreSeoAgent(request.data.brandName, request.data.products);
});

// Export POS Agent
import { parseOrderText, suggestUpsell } from './ai/agents/posAgent';
export const parseOrder = onCall({ region: 'southamerica-east1' }, async (request) => {
    return parseOrderText(request.data.text, request.data.products);
});
export const suggestUpsellFn = onCall({ region: 'southamerica-east1' }, async (request) => {
    return suggestUpsell(request.data.addedProduct, request.data.allProducts);
});

// Export Logistics Agent
import { calculateShippingFee, optimizeDeliveryRoute, getDeliveryRouteInfo } from './ai/agents/logisticsAgent';
export const calculateShippingFeeFn = onCall({ region: 'southamerica-east1' }, async (request) => {
    return calculateShippingFee(request.data.origin, request.data.destination, request.data.settings);
});
export const optimizeDeliveryRouteFn = onCall({ region: 'southamerica-east1' }, async (request) => {
    return optimizeDeliveryRoute(request.data.origin, request.data.destinations);
});
export const getDeliveryRouteInfoFn = onCall({ region: 'southamerica-east1' }, async (request) => {
    return getDeliveryRouteInfo(request.data.origin, request.data.destination);
});

// Export CRM Agent

import { getRetentionLoyaltyInsights } from './ai/agents/crmAgent';
export const getRetentionInsights = onCall({ region: 'southamerica-east1' }, async (request) => {
    return getRetentionLoyaltyInsights(request.data.customers);
});

// Export Vision Agent (Receipts)
import { analyzeBulkReceipt } from './ai/agents/visionAgent';
export const analyzeReceipt = onCall({ region: 'southamerica-east1' }, async (request) => {
    return analyzeBulkReceipt(request.data.fileUrl, request.data.mimeType);
});

// Export Marketing Agent (Copy & Image)
// Export Marketing Agent (Copy & Image)
import { generateProductMarketing, enhanceProductImage as enhanceProductImageAgent } from './ai/agents/marketingAgent';
export const generateMarketingCopy = onCall({ region: 'southamerica-east1' }, async (request) => {
    // Adapter: Frontend expects "generateMarketingCopy" but we map to "generateProductMarketing"
    return generateProductMarketing(request.data.productName, request.data.ingredients, request.data.restaurantName);
});
import { HttpsError } from 'firebase-functions/v2/https';

export const enhanceProductImageFn = onCall({
    region: 'southamerica-east1',
    cors: true, // Explicit CORS
    timeoutSeconds: 60, // Give AI time to think
    memory: '1GiB'
}, async (request) => {
    try {
        console.log(`[enhanceProductImage] Request received for: ${request.data.productName}`);
        return await enhanceProductImageAgent(request.data.productName, request.data.originalImageUrl);
    } catch (error: any) {
        console.error('[enhanceProductImage] Implementation Error:', error);
        // Return a structured error that the client SDK can parse
        throw new HttpsError('internal', error.message || 'Falha interna na IA', error);
    }
});
export const enhanceProductImage = enhanceProductImageFn;
