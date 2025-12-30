import { useState } from 'react';
import {
    collection,
    doc,
    updateDoc,
    addDoc,
    arrayUnion,
    serverTimestamp
} from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { WaiterRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to manage waiter requests (customer calling waiter)
 */
export function useWaiterRequest(sessionId: string, tenantId?: string, tableNumber?: string) {
    const [requesting, setRequesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Request waiter assistance
     */
    const requestWaiter = async (
        type: WaiterRequest['type'],
        message?: string
    ): Promise<void> => {
        if (!sessionId || !tenantId) {
            throw new Error('Session ID and Tenant ID are required');
        }

        setRequesting(true);
        setError(null);

        try {
            const sessionRef = doc(db, 'tableSessions', sessionId);
            const now = new Date();

            const newRequest: WaiterRequest = {
                id: uuidv4(),
                type,
                message,
                priority: type === 'BILL_REQUEST' ? 'HIGH' : 'NORMAL',
                status: 'PENDING',
                createdAt: now,
            };

            // 1. Update session
            await updateDoc(sessionRef, {
                waiterRequests: arrayUnion({
                    ...newRequest,
                    createdAt: serverTimestamp(),
                }),
                lastActivityAt: serverTimestamp(),
            });

            // 2. Create global notification
            await addDoc(collection(db, 'notifications'), {
                tenantId,
                recipientRole: 'waiter',
                title: type === 'BILL_REQUEST' ? '💵 Pedido de Conta' : '🛎️ Chamar Garçom',
                message: message || `Mesa ${tableNumber} solicitou atendimento.`,
                type: type === 'BILL_REQUEST' ? 'BILL_REQUEST' : 'ASSISTANCE',
                priority: type === 'BILL_REQUEST' ? 'HIGH' : 'MEDIUM',
                read: false,
                tableId: sessionId, // tableId here is usually the session or table code
                tableNumber,
                createdAt: serverTimestamp(),
            });

        } catch (err) {
            console.error('Error requesting waiter:', err);
            setError('Erro ao chamar garçom. Tente novamente.');
            throw err;
        } finally {
            setRequesting(false);
        }
    };

    /**
     * Request bill (shortcut for BILL_REQUEST)
     */
    const requestBill = async (message?: string) => {
        return requestWaiter('BILL_REQUEST', message);
    };

    /**
     * Request assistance (shortcut for ASSISTANCE)
     */
    const requestAssistance = async (message?: string) => {
        return requestWaiter('ASSISTANCE', message);
    };

    /**
     * Ask a question (shortcut for QUESTION)
     */
    const askQuestion = async (message: string) => {
        return requestWaiter('QUESTION', message);
    };

    return {
        requesting,
        error,
        requestWaiter,
        requestBill,
        requestAssistance,
        askQuestion,
    };
}
