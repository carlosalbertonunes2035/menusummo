/**
 * CRITICAL SECURITY: Tenant Data Isolation
 * Prevents cross-tenant data leakage during login/logout
 */

export class TenantValidator {
    /**
     * Validates that localStorage data belongs to current tenant
     */
    static validateLocalStorageKey(key: string, currentTenantId: string): boolean {
        if (!currentTenantId) return false;
        if (!key.includes('_')) return false;

        const parts = key.split('_');
        const keyTenantId = parts[parts.length - 1];

        return keyTenantId === currentTenantId;
    }

    /**
     * Clears ALL localStorage data for a specific tenant
     * Called during logout to prevent data leakage
     */
    static clearTenantData(tenantId: string): void {
        if (!tenantId) return;

        const keys = Object.keys(localStorage);
        const tenantKeys = keys.filter(key => key.includes(`_${tenantId}`));

        let clearedCount = 0;
        tenantKeys.forEach(key => {
            localStorage.removeItem(key);
            clearedCount++;
        });

        console.log(`[Security] Cleared ${clearedCount} keys for tenant: ${tenantId}`);
    }

    /**
     * Clears specific collection data for a tenant
     */
    static clearTenantCollection(tenantId: string, collection: string): void {
        if (!tenantId || !collection) return;

        const key = `summo_db_${collection}_${tenantId}`;
        localStorage.removeItem(key);
        console.log(`[Security] Cleared collection: ${collection} for tenant: ${tenantId}`);
    }

    /**
     * Clears ALL tenant data from localStorage (nuclear option)
     * Use with caution - typically only needed for debugging
     */
    static clearAllTenantData(): void {
        const keys = Object.keys(localStorage);
        const tenantKeys = keys.filter(key =>
            key.startsWith('summo_db_') ||
            key.startsWith('summo_tenant_')
        );

        tenantKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`[Security] Cleared ${tenantKeys.length} tenant keys (all tenants)`);
    }

    /**
     * Gets all localStorage keys for a specific tenant
     */
    static getTenantKeys(tenantId: string): string[] {
        if (!tenantId) return [];

        const keys = Object.keys(localStorage);
        return keys.filter(key => key.includes(`_${tenantId}`));
    }
}
