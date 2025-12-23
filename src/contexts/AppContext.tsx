
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from '@firebase/firestore';
import { Order, StoreSettings, CashRegister, OrderStatus, Ingredient, StockMovementType, Customer } from '@/types';
import { GET_DEFAULT_SETTINGS, INITIAL_CASH_REGISTER } from '@/constants';
import { ToastMessage, ToastType } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getCollection, setCollection } from '@/lib/localStorage';
import { useToast } from './ToastContext';
import { CollectionName } from '@/types/collections';
import { orderService } from '@/services/OrderService';
import { productService } from '@/services/ProductService';
import { customerService } from '@/services/CustomerService';
import { stockService } from '@/services/StockService';

interface AppContextProps {
    tenantId: string;
    switchTenant: (id: string) => void;

    settings: StoreSettings;
    setSettings: (settings: StoreSettings) => void;
    cashRegister: CashRegister;
    setCashRegister: (register: CashRegister) => void;
    toasts: ToastMessage[];
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
    handleAction: (collectionName: CollectionName, action: 'add' | 'update' | 'delete', id?: string, data?: any) => Promise<void>;
    onPlaceOrder: (orderData: Omit<Order, 'id' | 'createdAt'> & { tableNumber?: string }) => Promise<string>;
    handleUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    handleAssignDriver: (orderId: string, driverId: string) => Promise<void>;
    resetTenantData: () => Promise<void>;
    deduplicateTenantData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { systemUser, isMockMode } = useAuth();
    const tenantId = systemUser?.tenantId || '';
    const { showToast, removeToast, toasts } = useToast();

    // Service Instances (memoized with isMockMode)
    const orders = useMemo(() => orderService(isMockMode), [isMockMode]);
    const products = useMemo(() => productService(isMockMode), [isMockMode]);
    const customers = useMemo(() => customerService(isMockMode), [isMockMode]);
    const stock = useMemo(() => stockService(isMockMode), [isMockMode]);



    const [settings, setSettingsState] = useState<StoreSettings>(GET_DEFAULT_SETTINGS(tenantId || 'global'));
    const [cashRegister, setCashRegisterState] = useState<CashRegister>(INITIAL_CASH_REGISTER);

    useEffect(() => {
        const loadInitialData = async () => {
            // CRITICAL SECURITY: Only load if we have a valid tenantId
            if (!tenantId) {
                console.warn('[AppContext] No tenantId, using default settings');
                setSettingsState(GET_DEFAULT_SETTINGS('global'));
                setCashRegisterState(INITIAL_CASH_REGISTER);
                return;
            }

            // CRITICAL SECURITY: Validate localStorage keys match current tenant
            const validateTenantKey = (key: string): boolean => {
                return key.endsWith(`_${tenantId}`);
            };

            // 1. Try Firestore First (Production Mode)
            if (!isMockMode && tenantId) {
                try {
                    const settingsDoc = await getDoc(doc(db, 'settings', tenantId));
                    if (settingsDoc.exists()) {
                        setSettingsState(settingsDoc.data() as StoreSettings);
                    } else {
                        setSettingsState(GET_DEFAULT_SETTINGS(tenantId));
                    }
                } catch (e) {
                    console.error("Error loading settings from Firestore:", e);
                    setSettingsState(GET_DEFAULT_SETTINGS(tenantId));
                }
            } else {
                // 2. Fallback to LocalStorage (Mock Mode or Offline)
                const settingsKey = `summo_db_settings_${tenantId}`;
                const storedSettings = localStorage.getItem(settingsKey);

                // CRITICAL: Validate before parsing to prevent cross-tenant data leak
                if (storedSettings && validateTenantKey(settingsKey)) {
                    try {
                        setSettingsState(JSON.parse(storedSettings));
                    } catch (e) {
                        console.error('[Security] Invalid settings data, using defaults');
                        setSettingsState(GET_DEFAULT_SETTINGS(tenantId));
                    }
                } else {
                    setSettingsState(GET_DEFAULT_SETTINGS(tenantId));
                }
            }

            // Load Cash Register (always from localStorage)
            const cashKey = `summo_db_cash_register_${tenantId}`;
            const storedCash = localStorage.getItem(cashKey);

            // CRITICAL: Validate before parsing
            if (storedCash && validateTenantKey(cashKey)) {
                try {
                    setCashRegisterState(JSON.parse(storedCash));
                } catch (e) {
                    console.error('[Security] Invalid cash register data, using defaults');
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
                loadGoogleMapsScript(apiKey).catch(err => console.error('Failed to load Google Maps:', err));
            });
        }
    }, [settings.integrations?.google?.apiKey]);



    const switchTenant = useCallback((newId: string) => {
        localStorage.setItem('summo_active_tenant', newId);
        window.location.reload();
    }, []);

    const setSettings = useCallback(async (newSettings: StoreSettings) => {
        setSettingsState(newSettings);
        localStorage.setItem(`summo_db_settings_${tenantId}`, JSON.stringify(newSettings));

        if (!isMockMode && tenantId) {
            try {
                await setDoc(doc(db, 'settings', tenantId), newSettings, { merge: true });
                showToast("Configurações sincronizadas na nuvem", 'success');
            } catch (e: any) {
                console.error("Error saving settings to Firestore:", e);
                showToast(`Erro na nuvem: ${e.message || 'Sem conexão'}`, 'error');
                throw e;
            }
        } else if (isMockMode) {
            showToast("Salvo apenas localmente (Modo Simulado)", 'info');
        }
    }, [tenantId, isMockMode, showToast]);

    const setCashRegister = useCallback((newRegister: CashRegister) => {
        setCashRegisterState(newRegister);
        localStorage.setItem(`summo_db_cash_register_${tenantId}`, JSON.stringify(newRegister));
    }, [tenantId]);

    // --- DATA ACTIONS (Legacy + Generic) ---
    // --- DATA ACTIONS (Standardized) ---
    const handleAction = useCallback(async (collectionName: CollectionName, action: 'add' | 'update' | 'delete', id?: string, data?: any): Promise<void> => {
        if (!tenantId) {
            showToast("Erro: Sessão inválida (Sem Tenant ID)", 'error');
            return;
        }

        try {
            switch (collectionName) {
                case 'orders':
                    if (action === 'add') await orders.save(data, tenantId);
                    else if (action === 'update' && id) await orders.save({ ...data, id }, tenantId);
                    else if (action === 'delete' && id) await orders.remove(id, tenantId);
                    break;
                case 'products':
                    if (action === 'add') await products.save(data, tenantId);
                    else if (action === 'update' && id) await products.save({ ...data, id }, tenantId);
                    else if (action === 'delete' && id) await products.remove(id, tenantId);
                    break;
                case 'customers':
                    if (action === 'add') await customers.save(data, tenantId);
                    else if (action === 'update' && id) await customers.save({ ...data, id }, tenantId);
                    else if (action === 'delete' && id) await customers.remove(id, tenantId);
                    break;
                case 'settings':
                    if (action === 'update') await setSettings(data);
                    break;
                default:
                    // Fallback for collections without specific services yet
                    if (isMockMode) {
                        const currentData = getCollection(tenantId, collectionName as any);
                        let newData = [...currentData];
                        if (action === 'add') newData.push({ ...data, tenantId, id: id || Date.now().toString() });
                        else if (action === 'update' && id) newData = newData.map(item => item.id === id ? { ...item, ...data } : item);
                        else if (action === 'delete' && id) newData = newData.filter(item => item.id !== id);
                        setCollection(tenantId, collectionName as any, newData);
                    } else {
                        const docId = id || data?.id || Date.now().toString();
                        const docRef = doc(db, collectionName, docId);
                        if (action === 'add' || action === 'update') await setDoc(docRef, { ...data, tenantId }, { merge: true });
                        else if (action === 'delete' && id) await deleteDoc(doc(db, collectionName, id));
                    }
            }
        } catch (e) {
            console.error(`Error in handleAction(${collectionName}, ${action}):`, e);
            showToast("Erro ao processar ação nos dados.", 'error');
            throw e;
        }
    }, [tenantId, showToast, isMockMode, orders, products, customers, setSettings]);

    // --- REDACTED: updateCustomerFromOrder is now handled by Cloud Functions trigger (onOrderCreated) ---

    const onPlaceOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        const orderId = Date.now().toString();

        const newOrder: Order = {
            ...orderData,
            id: orderId,
            createdAt: new Date(),
            tenantId
        };
        await orders.save(newOrder, tenantId);

        // CRM Update is now handled by Cloud Functions onOrderCreated trigger
        return orderId;
    }, [orders, customers, tenantId]);

    const handleUpdateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        const order = await orders.getById(orderId, tenantId);
        if (order) {
            await orders.save({ ...order, status }, tenantId);

            if (status === OrderStatus.COMPLETED) {
                // Stock deduction is now handled by Cloud Functions onOrderStatusUpdated trigger
                console.log("[AppContext] Order completed. Stock deduction triggered in Cloud.");
            }
        }
        showToast("Status atualizado", 'info');
    }, [orders, stock, showToast, tenantId, systemUser]);

    const handleAssignDriver = useCallback(async (orderId: string, driverId: string) => {
        const order = await orders.getById(orderId, tenantId);
        if (order) {
            await orders.save({ ...order, driverId, status: OrderStatus.DELIVERING }, tenantId);
            await handleAction('drivers', 'update', driverId, { status: 'BUSY' });
            showToast("Motorista atribuído", 'info');
        }
    }, [orders, handleAction, showToast, tenantId]);

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
                    console.log(`[Reset] Limpo: ${collName} (${snapshot.size} docs)`);
                }
            }

            showToast("Dados resetados! Reiniciando sistema...", 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Reset failed:", error);
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
                    console.log(`[Deduplicate] ${collName}: ${toDelete.length} removidos.`);
                }
            }

            if (totalDeleted > 0) {
                showToast(`${totalDeleted} duplicatas removidas com sucesso!`, 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast("Nenhuma duplicata encontrada.", 'info');
            }
        } catch (error) {
            console.error("Deduplication failed:", error);
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
        toasts,
        showToast,
        removeToast,
        handleAction,
        onPlaceOrder,
        handleUpdateStatus,
        handleAssignDriver,
        resetTenantData,
        deduplicateTenantData,
    }), [
        tenantId, switchTenant, settings, cashRegister, toasts,
        setSettings, setCashRegister, showToast, removeToast,
        handleAction, onPlaceOrder, handleUpdateStatus, handleAssignDriver, resetTenantData, deduplicateTenantData
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
