import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { User } from '@firebase/auth';
import { SystemUser, Role } from '@/types';
import { logger } from '@/lib/logger';
import { STANDARD_ROLES } from '@/constants/roles';

const ROLES_MAP: Record<string, Role> = STANDARD_ROLES.reduce((acc, role) => {
    acc[role.id] = role;
    return acc;
}, {} as Record<string, Role>);

export const userService = {
    /**
     * Attempts to recover a user registration if they authenticated but have no document.
     */
    async recoverUser(firebaseUser: User, pendingTenantId: string): Promise<boolean> {
        try {
            logger.info("Attempting user recovery", { uid: firebaseUser.uid, pendingTenantId });

            const recoveryUserData = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                tenantId: pendingTenantId,
                roleId: 'OWNER',
                active: true,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), recoveryUserData);
            await setDoc(doc(db, 'system_users', firebaseUser.uid), {
                ...recoveryUserData,
                createdAt: new Date().toISOString()
            });

            return true;
        } catch (error) {
            logger.error("User recovery failed", error);
            return false;
        }
    },

    /**
     * Updates the user's tenantId if missing but found in local storage.
     */
    async updateUserTenant(uid: string, tenantId: string): Promise<void> {
        try {
            await setDoc(doc(db, 'users', uid), { tenantId }, { merge: true });
            await setDoc(doc(db, 'system_users', uid), { tenantId }, { merge: true });
            logger.info("User tenant updated", { uid, tenantId });
        } catch (error) {
            logger.error("Failed to update user tenant", error);
            throw error;
        }
    },

    /**
     * Fetches the comprehensive system user profile.
     */
    async getSystemUser(firebaseUser: User): Promise<{ systemUser: SystemUser; role: Role } | null> {
        try {
            // 1. Fetch from users collection
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (!userDoc.exists()) {
                logger.warn("User document not found", { uid: firebaseUser.uid });
                return null;
            }

            const userData = userDoc.data();

            // 2. Validate Tenant
            if (!userData.tenantId) {
                // Let the consumer handle the missing tenant logic (recovery)
                // We return partial data or null to indicate incomplete profile
                return null;
            }

            // 3. Fetch Role
            let role = ROLES_MAP['OWNER'];
            if (userData.roleId && ROLES_MAP[userData.roleId]) {
                role = ROLES_MAP[userData.roleId];
            }

            // 4. Fetch extra system profile data
            let systemProfile = {};
            try {
                const systemUserDoc = await getDoc(doc(db, 'system_users', firebaseUser.uid));
                if (systemUserDoc.exists()) {
                    systemProfile = systemUserDoc.data();
                }
            } catch (e) {
                logger.warn("Could not fetch system_users doc", e as any);
            }

            // 5. Construct final object
            const finalSystemUser: SystemUser = {
                id: firebaseUser.uid,
                tenantId: userData.tenantId,
                name: (systemProfile as any).name || userData.name || firebaseUser.displayName || userData.email,
                email: userData.email,
                roleId: userData.roleId,
                role,
                permissions: role.permissions,
                active: userData.active !== false,
                profileImage: (systemProfile as any).profileImage
            };

            return { systemUser: finalSystemUser, role };

        } catch (error) {
            logger.error("Error getting system user", error);
            throw error;
        }
    },

    getRole(roleId: string): Role {
        return ROLES_MAP[roleId] || ROLES_MAP['OWNER'];
    },

    async updateProfile(uid: string, data: { name: string; phone: string; profileImage: string }): Promise<void> {
        try {
            await setDoc(doc(db, 'users', uid), data, { merge: true });
            await setDoc(doc(db, 'system_users', uid), data, { merge: true });
            logger.info("User profile updated", { uid });
        } catch (error) {
            logger.error("Failed to update user profile", error);
            throw error;
        }
    },

    async updateCompanyData(uid: string, data: { businessName: string; cnpj: string }): Promise<void> {
        try {
            await setDoc(doc(db, 'users', uid), data, { merge: true });
            await setDoc(doc(db, 'system_users', uid), data, { merge: true });
            logger.info("User company data updated", { uid });
        } catch (error) {
            logger.error("Failed to update company data", error);
            throw error;
        }
    }
};
