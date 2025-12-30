
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from '@firebase/firestore';
import { Order, StoreSettings, CashRegister, OrderStatus } from '@/types';
import { GET_DEFAULT_SETTINGS, INITIAL_CASH_REGISTER } from '@/constants';
import { ToastMessage, ToastType } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { setCollection } from '@/lib/localStorage';
import { useToast } from './ToastContext';
import { CollectionName } from '@/types/collections';
import { useSettingsQuery } from '@/lib/react-query/queries/useSettingsQuery';
import { logger } from '@/lib/logger';

interface AppContextProps {
    tenantId: string;
    switchTenant: (id: string) => void;

    settings: StoreSettings;
    setSettings: (settings: StoreSettings) => void;
    cashRegister: CashRegister;
    setCashRegister: (register: CashRegister) => void;
    onPlaceOrder: (orderData: Omit<Order, 'id' | 'createdAt'> & { tableNumber?: string }) => Promise<string>;
    resetTenantData: () => Promise<void>;
    deduplicateTenantData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { systemUser, isMockMode } = useAuth();
    const tenantId = systemUser?.tenantId || '';
    const { showToast } = useToast();




    // -------------------------------------------------------------------------
    // 🚀 PHASE 2: DATA LAYER (TanStack Query)
    // -------------------------------------------------------------------------
    const {
        settings,
        updateSettings: triggerUpdateSettings,
        isLoading: isSettingsLoading
    } = useSettingsQuery(tenantId);

    const [cashRegister, setCashRegisterState] = useState<CashRegister>(INITIAL_CASH_REGISTER);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!tenantId) {
                setCashRegisterState(INITIAL_CASH_REGISTER);
                return;
            }

            // CRITICAL SECURITY: Validate localStorage keys match current tenant
            const validateTenantKey = (key: string): boolean => {
                return key.endsWith(`_${tenantId}`);
            };

            // Load Cash Register (always from localStorage)
            const cashKey = `summo_db_cash_register_${tenantId}`;
            const storedCash = localStorage.getItem(cashKey);

            if (storedCash && validateTenantKey(cashKey)) {
                try {
                    setCashRegisterState(JSON.parse(storedCash));
                } catch (_e) {
                    logger.error('[Security] Invalid cash register data, using defaults');
                    setCashRegisterState(INITIAL_CASH_REGISTER);
                }
            } else {
                setCashRegisterState(INITIAL_CASH_REGISTER);
            }
        };

        loadInitialData();
    }, [tenantId, isMockMode]);

    // GLOBAL MAPS SCRIPT LOADING
    useEffect(() => {
        const apiKey = settings.integrations?.google?.apiKey;
        if (apiKey && !window.google?.maps) {
            import('../services/googleMapsService').then(({ loadGoogleMapsScript }) => {
                loadGoogleMapsScript(apiKey).catch(err => logger.error('Failed to load Google Maps:', err));
            });
        }
    }, [settings.integrations?.google?.apiKey]);



    const switchTenant = useCallback((newId: string) => {
        localStorage.setItem('summo_active_tenant', newId);
        window.location.reload();
    }, []);

    const setSettings = useCallback(async (newSettings: StoreSettings) => {
        if (isMockMode) {
            showToast("Salvo apenas localmente (Modo Simulado)", 'info');
            return;
        }

        try {
            await triggerUpdateSettings(newSettings);
            showToast("Configurações sincronizadas na nuvem", 'success');
        } catch (e: any) {
            logger.error("Error saving settings via Query:", e);
            showToast(`Erro na nuvem: ${e.message || 'Sem conexão'}`, 'error');
            throw e;
        }
    }, [triggerUpdateSettings, isMockMode, showToast]);

    const setCashRegister = useCallback((newRegister: CashRegister) => {
        setCashRegisterState(newRegister);
        localStorage.setItem(`summo_db_cash_register_${tenantId}`, JSON.stringify(newRegister));
    }, [tenantId]);


    // --- SECURE ORDER PLACEMENT ---
    const onPlaceOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        logger.info(`[onPlaceOrder] Initiated. MockMode: ${isMockMode}`);

        if (isMockMode === true) {
            logger.error("Critical: Mock Mode attempted in Production Build.");
            throw new Error("Simulation Mode is disabled in this environment.");
        }

        if (!isMockMode) {
            try {
                // Dynamic import to avoid circular dependencies
                const { functions } = await import('@/lib/firebase/client');
                const { httpsCallable } = await import('@firebase/functions');

                const secureCheckout = httpsCallable(functions, 'secureCheckout');

                // Flattening complex objects if needed
                const payload = {
                    ...orderData,
                    tenantId,
                    status: undefined,
                    createdAt: undefined,
                    id: undefined
                };

                const result = await secureCheckout(payload);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = result.data as any; // Using explicit-any suppression for Cloud Function response until strict type is shared

                if (data.success) {
                    return data.orderId;
                } else {
                    throw new Error(data.message || 'Falha desconhecida no checkout.');
                }
            } catch (error) {
                const err = error as Error;
                logger.error('[onPlaceOrder] Secure Checkout Error:', err);
                showToast(`Erro no servidor: ${err.message || 'Tente novamente.'}`, 'error');
                throw err;
            }
        }
        throw new Error("Invalid execution state");
    }, [tenantId, isMockMode, showToast]);


    const resetTenantData = useCallback(async () => {
        if (!tenantId) return;

        const confirm = window.confirm("ATENÇÃO: Isso apagará TODOS os dados (produtos, pedidos, clientes) deste Tenant.\n\nEsta ação é IRREVERSÍVEL. Deseja continuar?");
        if (!confirm) return;

        showToast("Iniciando limpeza profunda de dados...", 'info');
        try {
            const collectionsToWipe = [
                'products', 'ingredients', 'recipes', 'stories', 'option_groups',
                'orders', 'stock_movements', 'drivers', 'coupons', 'customers', 'daily_logs',
                'printer_jobs', 'notifications'
            ];

            for (const collName of collectionsToWipe) {
                if (isMockMode) {
                    setCollection(tenantId, collName as any, []);
                } else {
                    const q = query(collection(db, collName), where("tenantId", "==", tenantId));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) continue;

                    // Delete in chunks of 500 (Firestore limit for batches, though we use individual deletes)
                    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id)));
                    await Promise.all(deletePromises);
                    logger.info(`[Reset] Limpo: ${collName} (${snapshot.size} docs)`);
                }
            }

            showToast("Dados resetados! Reiniciando sistema...", 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            logger.error("Reset failed:", error);
            showToast("Falha crítica ao resetar dados.", 'error');
        }
    }, [tenantId, isMockMode, showToast]);

    const deduplicateTenantData = useCallback(async () => {
        if (!tenantId) return;
        showToast("Iniciando faxina de duplicatas...", 'info');
        try {
            const collections = ['products', 'ingredients', 'recipes'];
            let totalDeleted = 0;

            for (const collName of collections) {
                const q = query(collection(db, collName), where("tenantId", "==", tenantId));
                const snapshot = await getDocs(q);
                const docs = snapshot.docs.map(d => ({
                    id: d.id,
                    ...(d.data() as any),
                    createdAt: d.data().createdAt?.toDate?.() || new Date(0) // Safe date handling
                }));

                const seen = new Map<string, string>(); // Name -> ID of the first (oldest) we keep
                const toDelete: string[] = [];

                // Sort by createdAt to keep the oldest one
                docs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

                for (const docObj of docs) {
                    const nameKey = docObj.name?.toLowerCase().trim();
                    if (!nameKey) continue;

                    if (seen.has(nameKey)) {
                        toDelete.push(docObj.id);
                    } else {
                        seen.set(nameKey, docObj.id);
                    }
                }

                if (toDelete.length > 0) {
                    const deletePromises = toDelete.map(id => deleteDoc(doc(db, collName, id)));
                    await Promise.all(deletePromises);
                    totalDeleted += toDelete.length;
                    logger.info(`[Deduplicate] ${collName}: ${toDelete.length} removidos.`);
                }
            }

            if (totalDeleted > 0) {
                showToast(`${totalDeleted} duplicatas removidas com sucesso!`, 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast("Nenhuma duplicata encontrada.", 'info');
            }
        } catch (error) {
            logger.error("Deduplication failed:", error);
            showToast("Falha na limpeza de duplicatas.", 'error');
        }
    }, [tenantId, showToast]);

    const value = useMemo(() => ({
        tenantId,
        switchTenant,

        settings,
        setSettings,
        cashRegister,
        setCashRegister,
        onPlaceOrder,
        resetTenantData,
        deduplicateTenantData,
    }), [
        tenantId, switchTenant, settings, cashRegister,
        setSettings, setCashRegister,
        onPlaceOrder, resetTenantData, deduplicateTenantData
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
