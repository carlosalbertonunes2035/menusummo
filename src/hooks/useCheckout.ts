
import { useCallback, useState } from 'react';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Order } from '@/types';
import { logger } from '@/lib/logger';

export const useCheckout = () => {
    const { systemUser } = useAuth();
    const { showToast } = useToast();
    const tenantId = systemUser?.tenantId || '';
    const [isProcessing, setIsProcessing] = useState(false);

    const placeOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        setIsProcessing(true);
        logger.info('[useCheckout] Initiating secure checkout', { tenantId });

        try {
            const secureCheckout = httpsCallable(functions, 'secureCheckout');

            // Defensive Helper: Avoid JSON-encoding errors by cleaning NaN values
            const sanitizePayload = (obj: any): any => {
                if (obj === null || obj === undefined) return null; // Firestore doesn't like undefined
                if (typeof obj === 'number') return isNaN(obj) ? 0 : obj;
                if (Array.isArray(obj)) return obj.map(sanitizePayload);
                if (typeof obj === 'object') {
                    return Object.fromEntries(
                        Object.entries(obj).map(([k, v]) => [k, sanitizePayload(v)])
                    );
                }
                return obj;
            };

            const payload = sanitizePayload({
                ...orderData,
                tenantId,
                status: undefined,
                createdAt: undefined,
                id: undefined
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await secureCheckout(payload);
            const data = result.data as any;

            if (data.success) {
                logger.info('[useCheckout] Order placed successfully', { orderId: data.orderId });
                return data.orderId;
            } else {
                throw new Error(data.message || 'Falha desconhecida no checkout.');
            }
        } catch (error) {
            const err = error as Error;
            logger.error('[useCheckout] Checkout Error:', err);
            showToast(`Erro no servidor: ${err.message || 'Tente novamente.'}`, 'error');
            throw err;
        } finally {
            setIsProcessing(false);
        }
    }, [tenantId, showToast]);

    return {
        placeOrder,
        isProcessing
    };
};
