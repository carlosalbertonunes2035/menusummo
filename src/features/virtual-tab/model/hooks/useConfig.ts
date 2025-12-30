import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SERVICE_CHARGE_PERCENTAGE } from '../../constants';

/**
 * Configuration Hook
 * Manages operation settings and configurations
 */

export interface OperationConfig {
    // Service Charge
    serviceChargeEnabled: boolean;
    serviceChargePercentage: number;
    serviceChargeOptional: boolean;

    // Peak Hours
    peakHoursEnabled: boolean;
    peakHours: Array<{
        dayOfWeek: number; // 0-6 (Sunday-Saturday)
        startTime: string; // "HH:mm"
        endTime: string; // "HH:mm"
        multiplier: number; // 1.2 = 20% increase
    }>;

    // Table Management
    maxTablesPerWaiter: number;
    autoAssignTables: boolean;
    allowSelfService: boolean;

    // Customer Experience
    showServiceChargeWarning: boolean;
    allowCustomerCallWaiter: boolean;
    allowCustomerRequestBill: boolean;
    requireCustomerPhone: boolean;

    // Waiter Management
    requireWaiterAcceptance: boolean;
    waiterTimeout: number; // minutes
    autoReassignOnTimeout: boolean;

    // Kitchen & Delivery
    sendToKDS: boolean;
    printOnOrder: boolean;
    notifyOnReady: boolean;

    // Financial
    trackPaymentLocation: boolean;
    trackPaymentDuration: boolean;
    allowSplitBill: boolean;

    // Security
    requireManagerApproval: boolean;
    maxInactivityMinutes: number;
    enableLossTracking: boolean;
    enableBlacklist: boolean;
}

const DEFAULT_CONFIG: OperationConfig = {
    serviceChargeEnabled: true,
    serviceChargePercentage: SERVICE_CHARGE_PERCENTAGE,
    serviceChargeOptional: false,

    peakHoursEnabled: false,
    peakHours: [],

    maxTablesPerWaiter: 8,
    autoAssignTables: true,
    allowSelfService: true,

    showServiceChargeWarning: true,
    allowCustomerCallWaiter: true,
    allowCustomerRequestBill: true,
    requireCustomerPhone: true,

    requireWaiterAcceptance: false,
    waiterTimeout: 5,
    autoReassignOnTimeout: true,

    sendToKDS: false,
    printOnOrder: false,
    notifyOnReady: true,

    trackPaymentLocation: true,
    trackPaymentDuration: true,
    allowSplitBill: false,

    requireManagerApproval: true,
    maxInactivityMinutes: 30,
    enableLossTracking: true,
    enableBlacklist: true,
};

export function useConfig() {
    const { currentUser } = useAuth();
    const [config, setConfig] = useState<OperationConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load configuration
    const loadConfig = useCallback(async () => {
        if (!currentUser?.tenantId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const configDoc = await getDoc(
                doc(db, 'tenants', currentUser.tenantId, 'config', 'virtualTab')
            );

            if (configDoc.exists()) {
                setConfig({ ...DEFAULT_CONFIG, ...configDoc.data() as OperationConfig });
            } else {
                // Create default config
                await setDoc(
                    doc(db, 'tenants', currentUser.tenantId, 'config', 'virtualTab'),
                    DEFAULT_CONFIG
                );
                setConfig(DEFAULT_CONFIG);
            }
        } catch (err) {
            console.error('Error loading config:', err);
            setError('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.tenantId]);

    // Update configuration
    const updateConfig = useCallback(async (updates: Partial<OperationConfig>) => {
        if (!currentUser?.tenantId) return;

        try {
            await updateDoc(
                doc(db, 'tenants', currentUser.tenantId, 'config', 'virtualTab'),
                updates
            );
            setConfig(prev => ({ ...prev, ...updates }));
        } catch (err) {
            console.error('Error updating config:', err);
            throw new Error('Erro ao atualizar configurações');
        }
    }, [currentUser?.tenantId]);

    // Get service charge amount
    const getServiceCharge = useCallback((subtotal: number): number => {
        if (!config.serviceChargeEnabled) return 0;

        // Check if in peak hours
        if (config.peakHoursEnabled) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const peakHour = config.peakHours.find(ph =>
                ph.dayOfWeek === dayOfWeek &&
                currentTime >= ph.startTime &&
                currentTime <= ph.endTime
            );

            if (peakHour) {
                return Math.round(subtotal * config.serviceChargePercentage * peakHour.multiplier * 100) / 100;
            }
        }

        return Math.round(subtotal * config.serviceChargePercentage * 100) / 100;
    }, [config]);

    // Check if should charge service fee
    const shouldChargeServiceFee = useCallback((): boolean => {
        return config.serviceChargeEnabled;
    }, [config.serviceChargeEnabled]);

    // Get operation settings
    const getOperationSettings = useCallback(() => {
        return config;
    }, [config]);

    // Check if in peak hours
    const isInPeakHours = useCallback((): boolean => {
        if (!config.peakHoursEnabled) return false;

        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        return config.peakHours.some(ph =>
            ph.dayOfWeek === dayOfWeek &&
            currentTime >= ph.startTime &&
            currentTime <= ph.endTime
        );
    }, [config]);

    // Load config on mount
    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    return {
        config,
        loading,
        error,
        loadConfig,
        updateConfig,
        getServiceCharge,
        shouldChargeServiceFee,
        getOperationSettings,
        isInPeakHours,
    };
}
