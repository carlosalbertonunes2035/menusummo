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
export const generateMarketingCopy = onCall({ region: 'us-central1' }, async (request) => {
    // Adapter: Frontend expects "generateMarketingCopy" but we map to "generateProductMarketing"
    return generateProductMarketing(request.data.productName, request.data.ingredients, request.data.restaurantName);
});
import { HttpsError } from 'firebase-functions/v2/https';

import * as logger from "firebase-functions/logger";

export const enhanceProductImage = onCall({
    region: 'us-central1',
    cors: true,          // CORRIGE CORS
    timeoutSeconds: 120, // IA precisa de tempo
    memory: '1GiB',      // IA precisa de memória
    invoker: 'public'    // Permite acesso público ao gatilho (necessário para CORS funcionar antes do Auth)
}, async (request) => {
    // 1. Verificação de Autenticação
    if (!request.auth) {
        logger.warn("[enhanceProductImage] Unauthenticated request blocked.");
        throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    const { fileUrl, productName, mimeType } = request.data;

    // Compatibility: Support both new 'fileUrl' and legacy 'originalImageUrl'
    const targetUrl = fileUrl || request.data.originalImageUrl;

    if (!targetUrl) {
        throw new HttpsError("invalid-argument", "URL da imagem não fornecida.");
    }

    try {
        logger.info(`[enhanceProductImage] Request received`, {
            productName,
            targetUrl,
            mimeType,
            hasAuth: !!request.auth,
            uid: request.auth?.uid
        });

        // 2. Chama o Agente de Marketing (que orquestra Visão + Geração)
        const result = await enhanceProductImageAgent(productName || 'Produto', targetUrl);
        logger.info("[enhanceProductImage] Success", { result });
        return result;
    } catch (error: any) {
        logger.error('[enhanceProductImage] CRITICAL ERROR:', {
            message: error.message,
            stack: error.stack,
            details: error
        });
        // Rethrow as HttpsError with detailed message for client visibility
        throw new HttpsError('internal', `Backend AI Failure: ${error.message}`, error);
    }
});
