
import { auth } from '@/lib/firebase/client';
import { signInWithCustomToken } from '@firebase/auth';

export interface RegistrationData {
    // === STEP 1: Personal Identity ===
    ownerName: string;
    ownerRole: 'owner' | 'manager' | 'chef' | 'other';
    email: string;
    phone: string;
    password: string;

    // === STEP 2: Business & Security ===
    businessName: string;
    establishmentType: 'restaurant' | 'snack_bar' | 'food_truck' | 'bakery' | 'confectionery' | 'other';
    operationTime: 'new' | '1-2y' | '3-5y' | '5y+';
    legalName: string;
    cnpj: string;
    address: {
        zip: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        complement?: string;
    };

    // === STEP 3: Business Intelligence ===
    segment: string;
    monthlyRevenue: string;
    salesChannels: {
        ownDelivery: boolean;
        counter: boolean;
        dineIn: boolean;
        ifood: boolean;
        rappi: boolean;
        aiqfome: boolean;
        otherApps: string[];
    };
    digitalMenu: {
        hasOwn: boolean;
        platform?: string;
    };
    currentSystem: 'paper' | 'spreadsheet' | 'other_system' | 'none';
    currentSystemName?: string;
    goals: ('cost_control' | 'inventory' | 'orders' | 'team' | 'sales' | 'loyalty' | 'professionalize')[];
    mainChallenge: 'waste' | 'profit' | 'orders' | 'team' | 'customers' | 'retention' | 'manual';

    // Legacy compatibility
    deliveryChannels: {
        ownDelivery: boolean;
        ifood: boolean;
        rappi: boolean;
        aiqfome: boolean;
        others: boolean;
    };
    serviceTypes: string[];
}

export const registrationService = {
    /**
     * Registers a new owner and initializes their tenant
     * ENTERPRISE VERSION: Uses Server-Side Cloud Function for atomic registration
     */
    async registerNewBusiness(data: RegistrationData) {
        console.log('[Registration] Starting SERVER-SIDE enterprise registration flow...');

        // Ensure phone is E.164 compliant before sending to Cloud Function
        const { toE164Phone } = await import('@/utils/validations');
        const sanitizedData = {
            ...data,
            phone: toE164Phone(data.phone)
        };

        try {
            // 1. Call Cloud Function (Gold Standard)
            const { getFunctions, httpsCallable } = await import('@firebase/functions');
            const functions = getFunctions(undefined, 'southamerica-east1');
            const createTenantFn = httpsCallable(functions, 'createTenant');

            console.log('[Registration] Calling cloud function createTenant...');
            const result = await createTenantFn(sanitizedData) as any;

            if (!result.data.success) {
                throw new Error(result.data.error || 'Falha desconhecida no registro.');
            }

            const { token, tenantId } = result.data;
            console.log('[Registration] Cloud function success! TenantId:', tenantId);

            // 2. Store hint
            localStorage.setItem('summo_pending_tenant_id', tenantId);
            localStorage.setItem(`summo_tenant_id_${data.email}`, tenantId);

            // 3. Authenticate
            if (token) {
                console.log('[Registration] Signing in with custom token...');
                const userCredential = await signInWithCustomToken(auth, token);
                const user = userCredential.user;
                // Store final hint
                localStorage.setItem(`summo_tenant_id_${user.uid}`, tenantId);
                console.log('[Registration] ✅ Registration & Login (Token) completed!');
                return { user, tenantId };
            } else {
                console.log('[Registration] Custom token missing, falling back to password sign-in...');
                const { signInWithEmailAndPassword } = await import('@firebase/auth');
                const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
                const user = userCredential.user;

                // CRITICAL: Force ID token refresh to get latest custom claims (tenantId)
                // without this, Firestore rules might fail for several minutes
                await user.getIdToken(true);
                console.log('[Registration] ID Token refreshed with custom claims.');

                // Store final hint
                localStorage.setItem(`summo_tenant_id_${user.uid}`, tenantId);
                console.log('[Registration] ✅ Registration & Login (Password) completed!');
                return { user, tenantId };
            }

        } catch (error: any) {
            console.error('[Registration] ❌ Registration failed:', error);
            // Improve error message for user
            if (error.message.includes('email-already-in-use') || error.message.includes('já está em uso')) {
                throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
            }
            throw new Error(`Erro no registro: ${error.message}`);
        }
    }
};
