import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, Timestamp, limit as firestoreLimit, orderBy } from '@firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { getCollection } from '@/lib/localStorage';
import { CollectionName } from '@/types/collections';
import { z } from 'zod';

/**
 * Recursively converts Firestore Timestamps to JavaScript Dates
 */
const convertTimestamps = (data: unknown): any => {
    if (data === null || data === undefined) return data;

    // Handle Firestore Timestamp
    if (data instanceof Timestamp) {
        return data.toDate();
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => convertTimestamps(item));
    }

    // Handle Objects
    if (typeof data === 'object') {
        const converted: Record<string, any> = {};
        for (const key in data) {
            // @ts-ignore - we know it's an object key iteration
            converted[key] = convertTimestamps((data as Record<string, unknown>)[key]);
        }
        return converted;
    }

    return data;
};

/**
 * Query Cache System
 */
const queryCache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedQuery = <T>(key: string, ttl: number = DEFAULT_CACHE_TTL): T[] | null => {
    const cached = queryCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttl;
    if (isExpired) {
        queryCache.delete(key);
        return null;
    }

    return cached.data as T[];
};

export const setCachedQuery = <T>(key: string, data: T[]) => {
    queryCache.set(key, { data, timestamp: Date.now() });
};

export const clearQueryCache = (pattern?: string) => {
    if (!pattern) {
        queryCache.clear();
        return;
    }

    const keysToDelete: string[] = [];
    queryCache.forEach((_, key) => {
        if (key.includes(pattern)) {
            keysToDelete.push(key);
        }
    });

    keysToDelete.forEach(key => queryCache.delete(key));
};

/**
 * Hook to fetch a collection with caching support.
 * Switches between Firebase Firestore and LocalStorage based on API Key validity.
 * Optionally validates data against a Zod schema.
 */
export const useFirestoreCollection = <T>(
    collectionName: CollectionName,
    tenantId?: string,
    filters?: { field: string, op: any, value: any }[],
    schema?: z.ZodSchema<any>,
    options?: {
        enableCache?: boolean;
        cacheTTL?: number;
        limit?: number;
        orderBy?: { field: string; direction: 'asc' | 'desc' };
    }
) => {
    const enableCache = options?.enableCache ?? true;
    const cacheTTL = options?.cacheTTL ?? DEFAULT_CACHE_TTL;
    const limitCount = options?.limit;
    const orderByConfig = options?.orderBy;

    const cacheKey = useMemo(() =>
        `${collectionName}_${tenantId}_${JSON.stringify(filters)}_${limitCount}_${JSON.stringify(orderByConfig)}`,
        [collectionName, tenantId, filters, limitCount, orderByConfig]
    );

    const [data, setData] = useState<T[]>(() => {
        if (enableCache) {
            return getCachedQuery<T>(cacheKey, cacheTTL) || [];
        }
        return [];
    });
    const [loading, setLoading] = useState(!enableCache || !getCachedQuery<T>(cacheKey, cacheTTL));
    const [error, setError] = useState<string | null>(null);
    const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now());

    // Determine if we are in Mock Mode based on the API Key
    const isMockMode = !auth.app.options.apiKey || auth.app.options.apiKey === "AIzaSyDMoFirhePgU3lm91hyNVFugDEIjao93lY";
    const effectiveTenantId = tenantId || ''; // No hardcoded fallback

    useEffect(() => {
        // Check cache first
        if (enableCache) {
            const cached = getCachedQuery<T>(cacheKey, cacheTTL);
            if (cached) {
                setData(cached);
                setLoading(false);
                // Do NOT return here. We still want to listen for live updates
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);

        const validateData = (rawData: any[]): T[] => {
            if (!schema) return rawData as T[];

            return rawData.map(item => {
                try {
                    return schema.parse(item);
                } catch (err) {
                    console.error(`Validation Error in ${collectionName}:`, err, item);
                    return item; // Fallback to original item if validation fails but don't crash
                }
            }) as T[];
        };

        if (isMockMode) {
            // --- LOCAL STORAGE MODE ---
            const loadLocalData = () => {
                const localData = getCollection(effectiveTenantId, collectionName);
                let processed = localData;

                // Apply simple filtering
                if (filters && filters.length > 0) {
                    processed = localData.filter((item: any) => {
                        return filters.every(f => {
                            if (f.op === '==') return item[f.field] === f.value;
                            return true;
                        });
                    });
                }

                // Apply ordering
                if (orderByConfig) {
                    processed = [...processed].sort((a: any, b: any) => {
                        const aVal = a[orderByConfig.field];
                        const bVal = b[orderByConfig.field];
                        if (orderByConfig.direction === 'asc') {
                            return aVal > bVal ? 1 : -1;
                        } else {
                            return aVal < bVal ? 1 : -1;
                        }
                    });
                }

                // Apply limit
                if (limitCount) {
                    processed = processed.slice(0, limitCount);
                }

                const validated = validateData(processed);
                setData(validated);
                setUpdateTimestamp(Date.now()); // ✨ Force re-render
                if (enableCache) {
                    setCachedQuery(cacheKey, validated);
                }
                setLoading(false);
            };

            loadLocalData();

            const handleLocalUpdate = () => loadLocalData();
            window.addEventListener('local-db-updated', handleLocalUpdate);

            return () => {
                window.removeEventListener('local-db-updated', handleLocalUpdate);
            };

        } else {
            // --- FIREBASE MODE ---
            // Only query if we have a valid tenantId. If not, we are likely not logged in or loading.
            if (!effectiveTenantId) {
                setData([]);
                setLoading(false);
                return;
            }

            try {
                let q = query(collection(db, collectionName));
                q = query(q, where('tenantId', '==', effectiveTenantId));

                if (filters) {
                    filters.forEach(f => {
                        q = query(q, where(f.field, f.op, f.value));
                    });
                }

                if (orderByConfig) {
                    q = query(q, orderBy(orderByConfig.field, orderByConfig.direction));
                }

                if (limitCount) {
                    q = query(q, firestoreLimit(limitCount));
                }

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const docs = snapshot.docs.map(doc => {
                        const rawData = doc.data();
                        const convertedData = convertTimestamps(rawData);
                        return { id: doc.id, ...convertedData };
                    });
                    const validated = validateData(docs);
                    setData(validated);
                    setUpdateTimestamp(Date.now()); // ✨ Force re-render on every update
                    if (enableCache) {
                        setCachedQuery(cacheKey, validated);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error(`Firestore Error (${collectionName}):`, err);
                    setError(err.message);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (err: any) {
                console.error("Setup Error:", err);
                setError(err.message);
                setLoading(false);
            }
        }
    }, [cacheKey, collectionName, effectiveTenantId, isMockMode, enableCache, cacheTTL, limitCount, schema]);

    return { data, loading, error, updateTimestamp };
};

