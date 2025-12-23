import { collection, query, where, getDocs } from '@firebase/firestore';
import { db } from '../lib/firebase/client';

/**
 * Generates a URL-friendly slug from a store name
 * 
 * Example: "My Store" → "my-store"
 * 
 * @param storeName - The store name to convert
 * @returns A URL-friendly slug
 */
export const generateSlugFromName = (storeName: string): string => {
    return storeName
        .toLowerCase()
        .normalize('NFD') // Normalize to decomposed form
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Checks if a slug is available (not already in use)
 * 
 * @param slug - The slug to check
 * @param excludeTenantId - Optional tenant ID to exclude from check (for updates)
 * @returns true if slug is available, false otherwise
 */
export const isSlugAvailable = async (slug: string, excludeTenantId?: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, 'settings'),
            where('storefront.slug', '==', slug)
        );

        const snapshot = await getDocs(q);

        // No documents found = slug is available
        if (snapshot.empty) return true;

        // If excludeTenantId is provided, check if the found document is the same tenant
        if (excludeTenantId) {
            return snapshot.docs.every(doc => doc.id === excludeTenantId);
        }

        // Slug is already in use
        return false;
    } catch (error) {
        console.error('Error checking slug availability:', error);
        return false;
    }
};

/**
 * Generates a unique slug by adding a numeric suffix if needed
 * 
 * Example: If "my-store" exists, generates "my-store-2"
 * 
 * @param storeName - The store name
 * @param tenantId - Optional tenant ID (for updates)
 * @returns A unique slug
 */
export const generateUniqueSlug = async (storeName: string, tenantId?: string): Promise<string> => {
    let slug = generateSlugFromName(storeName);
    let counter = 2;

    // Keep trying until we find an available slug
    while (!(await isSlugAvailable(slug, tenantId))) {
        slug = `${generateSlugFromName(storeName)}-${counter}`;
        counter++;
    }

    return slug;
};

/**
 * Validates a slug format
 * 
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export const validateSlug = (slug: string): { valid: boolean; error?: string } => {
    // Minimum 3 characters
    if (slug.length < 3) {
        return { valid: false, error: 'Slug deve ter no mínimo 3 caracteres' };
    }

    // Maximum 50 characters
    if (slug.length > 50) {
        return { valid: false, error: 'Slug deve ter no máximo 50 caracteres' };
    }

    // Only lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { valid: false, error: 'Slug deve conter apenas letras minúsculas, números e hífens' };
    }

    // Cannot start or end with hyphen
    if (slug.startsWith('-') || slug.endsWith('-')) {
        return { valid: false, error: 'Slug não pode começar ou terminar com hífen' };
    }

    // Cannot have consecutive hyphens
    if (slug.includes('--')) {
        return { valid: false, error: 'Slug não pode ter hífens consecutivos' };
    }

    return { valid: true };
};

/**
 * Gets tenant ID from slug by querying Firestore
 * 
 * @param slug - The slug to look up
 * @returns The tenant ID or null if not found
 */
export const getTenantIdFromSlug = async (slug: string): Promise<string | null> => {
    try {
        const q = query(
            collection(db, 'settings'),
            where('storefront.slug', '==', slug)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn(`No tenant found for slug: ${slug}`);
            return null;
        }

        // Return the first matching tenant ID
        return snapshot.docs[0].id;
    } catch (error) {
        console.error('Error fetching tenant by slug:', error);
        return null;
    }
};

/**
 * Gets all slugs for a given tenant
 * 
 * @param tenantId - The tenant ID
 * @returns The slug or null if not found
 */
export const getSlugForTenant = async (tenantId: string): Promise<string | null> => {
    try {
        const q = query(
            collection(db, 'settings'),
            where('__name__', '==', tenantId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const data = snapshot.docs[0].data();
        return data.storefront?.slug || null;
    } catch (error) {
        console.error('Error fetching slug for tenant:', error);
        return null;
    }
};
