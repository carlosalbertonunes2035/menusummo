
/**
 * Ironclad Session Manager for SUMMO Multi-tenancy
 * Ensures that localStorage is purged and validated to prevent data leakage between tenants.
 */

const COLLECTIONS = [
    'products', 'ingredients', 'recipes', 'orders',
    'customers', 'stock_movements', 'drivers', 'stories',
    'option_groups', 'coupons', 'daily_logs', 'printer_jobs',
    'notifications', 'expenses', 'shopping_list', 'settings', 'cash_register'
];

export const sessionManager = {
    /**
     * Completely clears all data related to ANY tenant from localStorage
     */
    purgeAllTenantData() {
        console.warn('[SessionManager] Executing full tenant data purge...');

        // Find all keys starting with summo_db_ or summo_tenant_id_
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('summo_db_') || key.startsWith('summo_tenant_id_'))) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('summo_active_tenant');
        console.log(`[SessionManager] Purged ${keysToRemove.length} keys.`);
    },

    /**
     * Clears only data for a specific tenant
     */
    purgeTenant(tenantId: string) {
        if (!tenantId) return;
        console.log(`[SessionManager] Purging data for tenant: ${tenantId}`);

        COLLECTIONS.forEach(col => {
            localStorage.removeItem(`summo_db_${col}_${tenantId}`);
        });

        localStorage.removeItem(`summo_tenant_id_${tenantId}`);
    },

    /**
     * Validates that the current localStorage state matches the active user's tenant.
     * If a mismatch is found, it purges and reloads to prevent cross-contamination.
     */
    validateSession(activeTenantId: string) {
        if (!activeTenantId) return true;

        const storedTenantId = localStorage.getItem('summo_active_tenant');

        if (storedTenantId && storedTenantId !== activeTenantId) {
            console.error('[SessionManager] Tenant mismatch detected! Security Purge triggered.');
            this.purgeAllTenantData();
            return false;
        }

        return true;
    }
};
