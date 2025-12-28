
import { auth, db } from '@/lib/firebase/client';
import { doc, setDoc, getDoc, collection, query, where, getDocs, runTransaction, serverTimestamp } from '@firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from '@firebase/auth';
import { geocodeAddress } from '@/services/googleMapsService';

export interface RegistrationData {
    // Owner Info
    ownerName: string;
    email: string;
    phone: string;
    password: string;

    // Company Info
    businessName: string; // "Nome Fantasia"
    legalName: string; // "Razão Social"
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

    // Business Profile
    segment: string; // e.g. "Hamburgueria", "Pizzaria"
    monthlyRevenue: string; // e.g. "Até R$ 10k", "R$ 10k - R$ 30k"
    deliveryChannels: {
        ownDelivery: boolean;
        ifood: boolean;
        rappi: boolean;
        aiqfome: boolean;
        others: boolean;
    };
    digitalMenu: {
        hasOwn: boolean;
        platform?: string; // e.g. "Goomer", "AnotaAI"
    };
    serviceTypes: string[]; // e.g. ["delivery", "takeaway", "indoor"]
}

export const registrationService = {
    /**
     * Generates a unique tenantId slug from business name
     */
    async generateUniqueTenantId(businessName: string): Promise<string> {
        console.log('[Registration] Generating unique tenantId for:', businessName);
        let slug = businessName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove accents
            .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with hyphen
            .replace(/-+/g, '-') // collapse hyphens
            .replace(/^-|-$/g, ''); // trim hyphens

        if (!slug) slug = 'store-' + Math.random().toString(36).substring(2, 7);

        // Check if exists using direct getDoc (more robust than query for existence check)
        const settingsRef = doc(db, 'settings', slug);
        const snapshot = await getDoc(settingsRef);

        if (!snapshot.exists()) {
            console.log('[Registration] Slug available:', slug);
            return slug;
        }

        // If exists, add random suffix
        const finalSlug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
        console.log('[Registration] Slug exists, using suffix:', finalSlug);
        return finalSlug;
    },

    /**
     * Registers a new owner and initializes their tenant
     * ENTERPRISE VERSION: Uses atomic transaction to guarantee data consistency
     */
    async registerNewBusiness(data: RegistrationData) {
        const {
            email, password, businessName, ownerName, phone,
            cnpj, legalName, address,
            segment, serviceTypes, monthlyRevenue, deliveryChannels, digitalMenu
        } = data;

        console.log('[Registration] Starting enterprise registration flow...');

        // 1. Generate TenantId FIRST (before creating user)
        const tenantId = await this.generateUniqueTenantId(businessName);
        console.log('[Registration] Generated tenantId:', tenantId);

        // 2. Store hint IMMEDIATELY (before Firebase Auth creation)
        localStorage.setItem('summo_pending_tenant_id', tenantId);
        localStorage.setItem(`summo_tenant_id_${email}`, tenantId); // Email-based fallback

        // 3. Try Geocoding (before transaction, non-critical)
        let location = undefined;
        const fullAddressString = `${address.street}, ${address.number}${address.neighborhood ? ' , ' + address.neighborhood : ''}, ${address.city} - ${address.state}, ${address.zip}`;

        try {
            const geocodeResult = await geocodeAddress(fullAddressString);
            if (geocodeResult) {
                location = { lat: geocodeResult.lat, lng: geocodeResult.lng };
                console.log('[Registration] Geocoding successful:', location);
            }
        } catch (error) {
            console.warn('[Registration] Geocoding failed, continuing without coordinates:', error);
        }

        // 4. Create Auth User
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('[Registration] Firebase Auth user created:', userCredential.user.uid);
        } catch (error: any) {
            console.error('[Registration] Failed to create auth user:', error);
            throw new Error(`Falha ao criar usuário: ${error.message}`);
        }

        const user = userCredential.user;

        // 5. Update Auth Profile
        try {
            await updateProfile(user, { displayName: ownerName });
        } catch (error) {
            console.warn('[Registration] Failed to update profile, continuing...', error);
        }

        // 6. ATOMIC TRANSACTION: Create all Firestore documents
        try {
            await runTransaction(db, async (transaction) => {
                console.log('[Registration] Starting atomic transaction...');

                // 6.1 Create User Document (RBAC)
                const userRef = doc(db, 'users', user.uid);
                const userData = {
                    id: user.uid,
                    name: ownerName,
                    email: email,
                    phone: phone,
                    tenantId: tenantId,
                    roleId: 'OWNER',
                    active: true,
                    createdAt: serverTimestamp(),
                    businessName: businessName,
                    cnpj: cnpj,
                    isMasterUser: true,
                    ownerUid: user.uid
                };
                transaction.set(userRef, userData);
                console.log('[Registration] Transaction: users document queued for UID:', user.uid);

                // 6.2 Create System User Document (Profile)
                const systemUserRef = doc(db, 'system_users', user.uid);
                const systemUserData = {
                    id: user.uid,
                    name: ownerName,
                    email: email,
                    tenantId: tenantId,
                    roleId: 'OWNER',
                    active: true,
                    createdAt: serverTimestamp(),
                    ownerUid: user.uid
                };
                transaction.set(systemUserRef, systemUserData);
                console.log('[Registration] Transaction: system_users document queued');

                // 6.3 Create Settings Document (Tenant)
                const settingsRef = doc(db, 'settings', tenantId);
                const settingsData: any = {
                    tenantId: tenantId,
                    brandName: businessName,
                    company: {
                        legalName: legalName,
                        cnpj: cnpj,
                        phone: phone,
                        address: address
                    },
                    address: fullAddressString,
                    businessProfile: {
                        segment,
                        serviceTypes,
                        monthlyRevenue,
                        deliveryChannels,
                        digitalMenu
                    },
                    interface: {
                        navigationMode: 'SIDEBAR',
                        primaryColor: '#FF6B00'
                    },
                    orderModes: {
                        delivery: serviceTypes.includes('delivery'),
                        takeaway: serviceTypes.includes('takeaway'),
                        dineIn: serviceTypes.includes('indoor')
                    },
                    onboarding: {
                        step1_config: true,
                        step2_product: false,
                        step3_ingredient: false,
                        step4_sale: false,
                        isCompleted: false
                    },
                    createdAt: serverTimestamp(),
                    ownerUid: user.uid
                };

                // Add location if available
                if (location) {
                    settingsData.company.location = location;
                }

                transaction.set(settingsRef, settingsData);
                console.log('[Registration] Transaction: settings document queued');

                // 6.4 Create Default Categories
                const defaultCategories = ['Entradas', 'Pratos Principais', 'Bebidas', 'Sobremesas'];
                for (const catName of defaultCategories) {
                    const catRef = doc(collection(db, 'option_groups'));
                    transaction.set(catRef, {
                        id: catRef.id,
                        tenantId: tenantId,
                        name: catName,
                        type: 'CATEGORY',
                        active: true,
                        createdAt: serverTimestamp(),
                        ownerUid: user.uid
                    });
                }
                console.log('[Registration] Transaction: option_groups queued');

                console.log('[Registration] Transaction: All documents queued, committing...');
            });

            console.log('[Registration] ✅ Transaction committed successfully!');

        } catch (transactionError: any) {
            console.error('[Registration] ❌ Transaction failed:', transactionError);

            // ROLLBACK: Delete auth user if transaction fails
            try {
                await user.delete();
                console.log('[Registration] Rollback: Auth user deleted');
            } catch (deleteError) {
                console.error('[Registration] Rollback failed:', deleteError);
            }

            // Clear localStorage hints
            localStorage.removeItem('summo_pending_tenant_id');
            localStorage.removeItem(`summo_tenant_id_${email}`);

            throw new Error(`Falha ao criar empresa: ${transactionError.message}`);
        }

        // 7. Create System Roles (outside transaction, non-critical)
        try {
            const { STANDARD_ROLES } = await import('@/constants/roles');
            for (const role of STANDARD_ROLES) {
                const roleRef = doc(db, 'roles', role.id);
                const existingRole = await getDoc(roleRef);
                if (!existingRole.exists()) {
                    await setDoc(roleRef, {
                        ...role,
                        createdAt: new Date().toISOString()
                    });
                }
            }
            console.log('[Registration] System roles created');
        } catch (rolesError) {
            console.warn('[Registration] Failed to create system roles (non-critical):', rolesError);
        }

        // 8. Store final hint with UID
        localStorage.setItem(`summo_tenant_id_${user.uid}`, tenantId);
        console.log('[Registration] ✅ Registration completed successfully!');

        return { user, tenantId };
    }
};
