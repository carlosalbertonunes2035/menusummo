import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const db = getFirestore();

// Helper functions for data fetching
export async function getStore(storeSlug: string) {
    const storesSnapshot = await db
        .collection('tenants')
        .where('slug', '==', storeSlug)
        .limit(1)
        .get();

    if (storesSnapshot.empty) {
        return null;
    }

    const storeDoc = storesSnapshot.docs[0];
    return {
        id: storeDoc.id,
        ...storeDoc.data(),
    };
}

export async function getProducts(tenantId: string) {
    const productsSnapshot = await db
        .collection('products')
        .where('tenantId', '==', tenantId)
        .where('status', '==', 'ACTIVE')
        .get();

    return productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function getProduct(tenantId: string, productSlug: string) {
    const productsSnapshot = await db
        .collection('products')
        .where('tenantId', '==', tenantId)
        .where('slug', '==', productSlug)
        .limit(1)
        .get();

    if (productsSnapshot.empty) {
        return null;
    }

    const productDoc = productsSnapshot.docs[0];
    return {
        id: productDoc.id,
        ...productDoc.data(),
    };
}
