
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { db } from '@/lib/firebase/client';
import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Product, OptionGroupLibraryItem, StoreSettings } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ProductSchema } from '@/lib/schemas';
import { GET_DEFAULT_SETTINGS } from '@/constants';
import { useState, useEffect } from 'react';
import { collection, query, where, doc, onSnapshot } from '@firebase/firestore';

interface PublicDataContextProps {
    isLoading: boolean;
    products: Product[];
    optionGroups: OptionGroupLibraryItem[];
    settings: StoreSettings;
    tenantId: string;
}

const PublicDataContext = createContext<PublicDataContextProps | undefined>(undefined);

export const PublicDataProvider: React.FC<{ children: ReactNode; tenantId: string }> = ({ children, tenantId: slug }) => {
    const { isMockMode } = useAuth();
    const [realTenantId, setRealTenantId] = useState<string>(slug);
    const [settings, setSettings] = useState<StoreSettings>(GET_DEFAULT_SETTINGS(slug));
    const [settingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        if (isMockMode || !slug) {
            if (!slug) setSettingsLoading(false);
            return;
        }

        setSettingsLoading(true);

        // 1. Listen by storefront.slug field
        const q = query(collection(db, 'settings'), where('storefront.slug', '==', slug));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data() as StoreSettings;
                setSettings(docData);
                setRealTenantId(docData.tenantId || snapshot.docs[0].id);
                setSettingsLoading(false);
            } else {
                // 2. Fallback: Try document ID directly
                const settingsDocRef = doc(db, 'settings', slug);
                onSnapshot(settingsDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const docData = docSnap.data() as StoreSettings;
                        setSettings(docData);
                        setRealTenantId(docData.tenantId || docSnap.id);
                    } else {
                        setSettings(GET_DEFAULT_SETTINGS(slug));
                        setRealTenantId(slug);
                    }
                    setSettingsLoading(false);
                });
            }
        });

        return () => unsubscribe();
    }, [slug, isMockMode]);

    // Isolated Mock Mode logic for clarity
    useEffect(() => {
        if (!isMockMode) return;

        const resolveMock = () => {
            let stored = localStorage.getItem(`summo_db_settings_${slug}`);
            if (!stored) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('summo_db_settings_')) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || '{}');
                            if (data.storefront?.slug === slug) {
                                stored = JSON.stringify(data);
                                break;
                            }
                        } catch (e) { }
                    }
                }
            }

            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings(parsed);
                setRealTenantId(parsed.tenantId || slug);
            } else {
                setSettings(GET_DEFAULT_SETTINGS(slug));
                setRealTenantId(slug);
            }
            setSettingsLoading(false);
        };
        resolveMock();
    }, [slug, isMockMode]);

    // Inject Brand Colors
    useEffect(() => {
        const branding = settings?.digitalMenu?.branding;
        if (branding?.primaryColor) {
            document.documentElement.style.setProperty('--summo-primary', branding.primaryColor);
        } else {
            document.documentElement.style.removeProperty('--summo-primary');
        }

        if (branding?.backgroundColor) {
            document.documentElement.style.setProperty('--summo-bg', branding.backgroundColor);
            // Also update surface color to be a slightly lighter/different version of background if needed
            // For now, just letting background be dynamic is enough as per user request
        } else {
            document.documentElement.style.removeProperty('--summo-bg');
        }
    }, [settings?.digitalMenu?.branding]);

    // Listen for storage changes in Mock Mode to reflect Admin saves immediately in public view
    useEffect(() => {
        if (!isMockMode) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.startsWith('summo_db_settings_')) {
                try {
                    const data = JSON.parse(e.newValue || '{}');
                    // Check if this settings object belongs to our shop slug
                    if (data.storefront?.slug === slug || e.key === `summo_db_settings_${realTenantId}`) {
                        setSettings(prev => ({ ...prev, ...data }));
                        if (data.tenantId && data.tenantId !== realTenantId) {
                            setRealTenantId(data.tenantId);
                        }
                    }
                } catch (err) {
                    console.warn("Storage sync failed:", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isMockMode, realTenantId, slug]);

    // Load only public-facing collections using the REAL tenantId
    const { data: products, loading: productsLoading } = useFirestoreCollection<Product>(
        'products',
        realTenantId,
        undefined,
        ProductSchema
    );



    const { data: optionGroups, loading: optionGroupsLoading } = useFirestoreCollection<OptionGroupLibraryItem>(
        'option_groups',
        realTenantId
    );

    const isLoading = productsLoading || optionGroupsLoading || settingsLoading;

    const value = useMemo(() => ({
        isLoading,
        products,
        optionGroups,
        settings,
        tenantId: realTenantId
    }), [
        isLoading,
        products,
        optionGroups,
        settings,
        realTenantId
    ]);

    return <PublicDataContext.Provider value={value}>{children}</PublicDataContext.Provider>;
};

export const usePublicData = () => {
    const context = useContext(PublicDataContext);
    if (context === undefined) {
        throw new Error('usePublicData must be used within a PublicDataProvider');
    }
    return context;
};
