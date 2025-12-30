
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// Zod Schema for strict validation
const RegistrationSchema = z.object({
    ownerName: z.string().min(2),
    ownerRole: z.string(),
    email: z.string().email(),
    phone: z.string(),
    password: z.string().min(6), // Password will be handled by Admin SDK
    businessName: z.string().min(2),
    establishmentType: z.string(),
    operationTime: z.string(),
    legalName: z.string(),
    cnpj: z.string(),
    address: z.object({
        zip: z.string(),
        street: z.string(),
        number: z.string(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string(),
        complement: z.string().optional()
    }),
    segment: z.string(),
    monthlyRevenue: z.string(),
    salesChannels: z.any(), // Flexible object
    digitalMenu: z.any(),   // Flexible object
    currentSystem: z.string(),
    currentSystemName: z.string().optional().nullable(),
    goals: z.array(z.string()).optional(),
    mainChallenge: z.string(),
    // Legacy fields
    deliveryChannels: z.any().optional(),
    serviceTypes: z.array(z.string()).optional()
});

/**
 * Generates a unique tenantId slug from business name
 */
async function generateUniqueTenantId(db: admin.firestore.Firestore, businessName: string): Promise<string> {
    let slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    if (!slug) slug = 'store-' + Math.random().toString(36).substring(2, 7);

    // Check availability (Atomic-like check)
    // In a high-concurrency real scenario, we might want a transaction for reservation,
    // but for onboarding, a direct check is sufficient given the random suffix fallback.
    const doc = await db.collection('settings').doc(slug).get();
    if (!doc.exists) return slug;

    // Retry with random suffix
    return `${slug}-${Math.random().toString(36).substring(2, 6)}`;
}

export const createTenant = onCall({
    region: 'southamerica-east1',
    memory: '512MiB',
    timeoutSeconds: 60,
    cors: true, // Allow direct calls/public
}, async (request) => {
    // 1. Validation
    const parseResult = RegistrationSchema.safeParse(request.data);
    if (!parseResult.success) {
        throw new HttpsError('invalid-argument', 'Invalid registration data', parseResult.error);
    }
    const data = parseResult.data;
    const db = admin.firestore();

    try {
        console.log(`[createTenant] Starting registration for: ${data.email}`);

        // 2. Generate TenantId
        const tenantId = await generateUniqueTenantId(db, data.businessName);
        console.log(`[createTenant] Generated tenantId: ${tenantId}`);

        // 3. Create Auth User
        // Check if user exists first to catch error early
        try {
            await admin.auth().getUserByEmail(data.email);
            throw new HttpsError('already-exists', 'Este e-mail já está em uso.');
        } catch (e: any) {
            if (e.code !== 'auth/user-not-found') throw e;
        }

        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.ownerName,
            phoneNumber: data.phone.length >= 13 ? data.phone : undefined // Requires E.164
        });
        const uid = userRecord.uid;
        console.log(`[createTenant] Auth User created: ${uid}`);

        // 4. Atomic Transaction: Create All Docs
        await db.runTransaction(async (transaction) => {
            // A. User (RBAC)
            const userRef = db.collection('users').doc(uid);
            transaction.set(userRef, {
                id: uid,
                name: data.ownerName,
                email: data.email,
                phone: data.phone,
                tenantId: tenantId,
                roleId: 'OWNER',
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                businessName: data.businessName,
                cnpj: data.cnpj,
                isMasterUser: true,
                ownerUid: uid
            });

            // B. System User (Profile)
            const systemUserRef = db.collection('system_users').doc(uid);
            transaction.set(systemUserRef, {
                id: uid,
                name: data.ownerName,
                email: data.email,
                tenantId: tenantId,
                roleId: 'OWNER',
                active: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                ownerUid: uid
            });

            // C. Settings (Tenant)
            const settingsRef = db.collection('settings').doc(tenantId);
            const fullAddress = `${data.address.street}, ${data.address.number} - ${data.address.city}/${data.address.state}`;

            // Intelligent Module Activation Logic
            const modules = {
                inventory: { enabled: data.goals?.includes('inventory') || data.mainChallenge === 'waste', autoActivated: true },
                team: { enabled: data.goals?.includes('team') || data.mainChallenge === 'team', autoActivated: true },
                crm: { enabled: data.goals?.includes('loyalty') || data.mainChallenge === 'retention', autoActivated: true },
                integrations: { enabled: data.salesChannels?.ifood || data.salesChannels?.rappi, autoActivated: true }
            };

            const settingsData = {
                tenantId: tenantId,
                brandName: data.businessName,
                company: {
                    legalName: data.legalName,
                    cnpj: data.cnpj,
                    phone: data.phone,
                    address: data.address
                },
                address: fullAddress,
                businessProfile: {
                    segment: data.segment,
                    monthlyRevenue: data.monthlyRevenue,
                    establishmentType: data.establishmentType,
                    operationTime: data.operationTime,
                    salesChannels: data.salesChannels
                },
                businessIntelligence: {
                    currentSystem: data.currentSystem,
                    currentSystemName: data.currentSystemName,
                    goals: data.goals,
                    mainChallenge: data.mainChallenge,
                    ownerRole: data.ownerRole,
                    capturedAt: admin.firestore.FieldValue.serverTimestamp()
                },
                interface: {
                    navigationMode: 'SIDEBAR',
                    primaryColor: '#FF6B00'
                },
                modules,
                onboarding: { isCompleted: false, step1_config: true },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                ownerUid: uid
            };
            transaction.set(settingsRef, settingsData);

            // D. Default Categories
            const categories = ['Entradas', 'Pratos Principais', 'Bebidas', 'Sobremesas'];
            categories.forEach(cat => {
                const catRef = db.collection('option_groups').doc();
                transaction.set(catRef, {
                    id: catRef.id,
                    tenantId,
                    name: cat,
                    type: 'CATEGORY',
                    active: true,
                    ownerUid: uid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
        });

        console.log('[createTenant] Transaction committed.');

        // 5. Set Custom Claims (Immediate Access)
        await admin.auth().setCustomUserClaims(uid, {
            tenantId: tenantId,
            role: 'OWNER'
        });

        // 6. Generate Custom Token (Optional Fallback)
        let token = '';
        try {
            token = await admin.auth().createCustomToken(uid);
        } catch (e: any) {
            console.warn('[createTenant] Custom token creation failed. Client will fallback to password login.', e.message);
        }

        return {
            success: true,
            tenantId,
            token
        };

    } catch (error: any) {
        console.error('[createTenant] Error:', error);

        // Cleanup if Auth created but DB failed (Rollback-ish)
        // Note: Transaction ensures DB is atomic. We only need to cleanup Auth if DB fails.
        // We can try to delete the user.
        if (error.code !== 'already-exists') {
            // Try to find if user was created and delete
            try {
                const user = await admin.auth().getUserByEmail(data.email);
                await admin.auth().deleteUser(user.uid);
                console.log('[createTenant] Rolled back Auth User.');
            } catch { }
        }

        throw new HttpsError('internal', error.message || 'Falha ao criar conta.');
    }
});
