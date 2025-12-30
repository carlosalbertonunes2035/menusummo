import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Notifications Hook
 * Manages in-app notifications and alerts
 */

export type NotificationType =
    | 'WAITER_REQUEST'
    | 'BILL_REQUEST'
    | 'ORDER_READY'
    | 'TABLE_INACTIVE'
    | 'LOSS_DETECTED'
    | 'PAYMENT_RECEIVED'
    | 'MANAGER_ALERT';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
    id?: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    recipientId?: string; // Specific user
    recipientRole?: string; // All users with this role
    tableNumber?: string;
    sessionId?: string;
    orderId?: string;
    read: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

export function useNotifications() {
    const { currentUser } = useAuth();

    // Send notification
    const sendNotification = useCallback(async (
        notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
    ) => {
        if (!currentUser?.tenantId) {
            throw new Error('User not authenticated');
        }

        try {
            const notificationData = {
                ...notification,
                tenantId: currentUser.tenantId,
                read: false,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(
                collection(db, 'notifications'),
                notificationData
            );

            console.log('Notification sent:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw new Error('Falha ao enviar notificação');
        }
    }, [currentUser?.tenantId]);

    // Notify waiters
    const notifyWaiters = useCallback(async (
        title: string,
        message: string,
        options?: {
            tableNumber?: string;
            sessionId?: string;
            priority?: NotificationPriority;
        }
    ) => {
        return sendNotification({
            type: 'WAITER_REQUEST',
            priority: options?.priority || 'HIGH',
            title,
            message,
            recipientRole: 'waiter',
            tableNumber: options?.tableNumber,
            sessionId: options?.sessionId,
        });
    }, [sendNotification]);

    // Notify manager
    const notifyManager = useCallback(async (
        title: string,
        message: string,
        options?: {
            type?: NotificationType;
            priority?: NotificationPriority;
            tableNumber?: string;
            sessionId?: string;
        }
    ) => {
        return sendNotification({
            type: options?.type || 'MANAGER_ALERT',
            priority: options?.priority || 'MEDIUM',
            title,
            message,
            recipientRole: 'manager',
            tableNumber: options?.tableNumber,
            sessionId: options?.sessionId,
        });
    }, [sendNotification]);

    // Notify customer (future: SMS/WhatsApp)
    const notifyCustomer = useCallback(async (
        customerId: string,
        title: string,
        message: string,
        options?: {
            type?: NotificationType;
            priority?: NotificationPriority;
        }
    ) => {
        // TODO: Implement SMS/WhatsApp integration
        console.log('Customer notification (future):', {
            customerId,
            title,
            message,
        });

        return sendNotification({
            type: options?.type || 'ORDER_READY',
            priority: options?.priority || 'MEDIUM',
            title,
            message,
            recipientId: customerId,
        });
    }, [sendNotification]);

    // Notify on waiter request
    const notifyWaiterRequest = useCallback(async (
        tableNumber: string,
        sessionId: string,
        requestType: 'CALL_WAITER' | 'BILL_REQUEST'
    ) => {
        const title = requestType === 'CALL_WAITER'
            ? '🙋 Garçom Solicitado'
            : '💰 Conta Solicitada';

        const message = requestType === 'CALL_WAITER'
            ? `Mesa ${tableNumber} está chamando um garçom`
            : `Mesa ${tableNumber} solicitou a conta`;

        return notifyWaiters(title, message, {
            tableNumber,
            sessionId,
            priority: requestType === 'BILL_REQUEST' ? 'URGENT' : 'HIGH',
        });
    }, [notifyWaiters]);

    // Notify on order ready
    const notifyOrderReady = useCallback(async (
        tableNumber: string,
        orderId: string,
        waiterName?: string
    ) => {
        const title = '✅ Pedido Pronto';
        const message = waiterName
            ? `Pedido da Mesa ${tableNumber} está pronto para ${waiterName} entregar`
            : `Pedido da Mesa ${tableNumber} está pronto`;

        return notifyWaiters(title, message, {
            tableNumber,
            priority: 'HIGH',
        });
    }, [notifyWaiters]);

    // Notify on table inactive
    const notifyTableInactive = useCallback(async (
        tableNumber: string,
        sessionId: string,
        inactiveMinutes: number
    ) => {
        const title = '⚠️ Mesa Inativa';
        const message = `Mesa ${tableNumber} está inativa há ${inactiveMinutes} minutos`;

        return notifyManager(title, message, {
            type: 'TABLE_INACTIVE',
            priority: 'MEDIUM',
            tableNumber,
            sessionId,
        });
    }, [notifyManager]);

    // Notify on loss detected
    const notifyLossDetected = useCallback(async (
        tableNumber: string,
        amount: number,
        reason: string
    ) => {
        const title = '🚨 Perda Detectada';
        const message = `Mesa ${tableNumber}: ${reason} - R$ ${amount.toFixed(2)}`;

        return notifyManager(title, message, {
            type: 'LOSS_DETECTED',
            priority: 'URGENT',
            tableNumber,
        });
    }, [notifyManager]);

    // Notify on payment received
    const notifyPaymentReceived = useCallback(async (
        tableNumber: string,
        amount: number,
        method: string
    ) => {
        const title = '💰 Pagamento Recebido';
        const message = `Mesa ${tableNumber}: R$ ${amount.toFixed(2)} via ${method}`;

        return notifyManager(title, message, {
            type: 'PAYMENT_RECEIVED',
            priority: 'LOW',
            tableNumber,
        });
    }, [notifyManager]);

    return {
        sendNotification,
        notifyWaiters,
        notifyManager,
        notifyCustomer,
        notifyWaiterRequest,
        notifyOrderReady,
        notifyTableInactive,
        notifyLossDetected,
        notifyPaymentReceived,
    };
}
