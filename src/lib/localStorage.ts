
import { GET_INITIAL_PRODUCTS, GET_INITIAL_INGREDIENTS, INITIAL_DRIVERS, OPTION_GROUP_LIBRARY, INITIAL_SYSTEM_USERS } from '../constants';
import { STANDARD_ROLES } from '../constants/roles';
import { Product, Ingredient, Driver, OptionGroupLibraryItem, SystemUser, Role } from '../types';

// Type definition for our collections to ensure type safety
type CollectionMap = {
    products: Product[];
    ingredients: Ingredient[];
    drivers: Driver[];
    option_groups: OptionGroupLibraryItem[];
    system_users: SystemUser[];
    roles: Role[]; // Added roles collection
    [key: string]: any[]; // For other collections like orders, expenses, etc.
};

const getFallbackData = (tenantId: string, collectionName: keyof CollectionMap): any[] => {
    switch (collectionName) {
        case 'products': return GET_INITIAL_PRODUCTS(tenantId);
        case 'ingredients': return GET_INITIAL_INGREDIENTS(tenantId);
        case 'option_groups': return OPTION_GROUP_LIBRARY;
        case 'drivers': return INITIAL_DRIVERS.filter(d => d.tenantId === tenantId);
        case 'system_users': return INITIAL_SYSTEM_USERS.filter(u => u.tenantId === tenantId);
        case 'roles': return STANDARD_ROLES; // Roles are tenant-agnostic for now
        default: return [];
    }
};

const getKey = (collectionName: string, tenantId: string): string => `summo_db_${collectionName}_${tenantId}`;

/**
 * Retrieves a collection from localStorage for a specific tenant.
 * Hydrates date strings back into Date objects.
 * If the collection doesn't exist, it seeds it with fallback data.
 */
export const getCollection = <T extends keyof CollectionMap>(
    tenantId: string,
    collectionName: T
): CollectionMap[T] => {
    const key = getKey(String(collectionName), tenantId);
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            // JSON reviver function to automatically convert ISO strings to Date objects
            return JSON.parse(stored, (key, value) => {
                if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        }

        // If no data, load and set fallback
        const fallbackData = getFallbackData(tenantId, collectionName);
        if (fallbackData.length > 0) {
            localStorage.setItem(key, JSON.stringify(fallbackData));
            return fallbackData as CollectionMap[T];
        }

        return [] as CollectionMap[T];

    } catch (e) {
        console.error(`Failed to read collection "${collectionName}" from localStorage.`, e);
        // Return fallback data on error to prevent crashes
        return getFallbackData(tenantId, collectionName) as CollectionMap[T];
    }
};

/**
 * Writes an entire collection to localStorage for a specific tenant
 * and dispatches an event to notify hooks to update their state.
 */
export const setCollection = <T extends keyof CollectionMap>(
    tenantId: string,
    collectionName: T,
    data: CollectionMap[T]
): void => {
    const key = getKey(String(collectionName), tenantId);
    try {
        localStorage.setItem(key, JSON.stringify(data));
        // Notify hooks that the local DB has been updated
        window.dispatchEvent(new Event('local-db-updated'));
    } catch (e) {
        console.error(`Failed to write collection "${collectionName}" to localStorage.`, e);
    }
};
