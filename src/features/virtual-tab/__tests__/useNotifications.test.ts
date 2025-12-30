import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../model/hooks/useNotifications';

// Mocks
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'user-1', tenantId: 'tenant-1' }
    })
}));

vi.mock('@/lib/firebase/client', () => ({
    db: {}
}));

vi.mock('@firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'notif-1' })),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    serverTimestamp: vi.fn(() => new Date()),
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(),
    persistentMultipleTabManager: vi.fn(),
}));

describe('useNotifications Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should send generic notification', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.sendNotification({
                title: 'Teste',
                message: 'Mensagem de teste',
                type: 'MANAGER_ALERT',
                priority: 'MEDIUM',
                recipientRole: 'admin'
            });
        });

        const { addDoc } = await import('@firebase/firestore');
        expect(addDoc).toHaveBeenCalled();
    });

    it('should notify waiter when requested', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.notifyWaiterRequest('5', 'sess-123', 'BILL_REQUEST');
        });

        const { addDoc } = await import('@firebase/firestore');
        expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
            title: '💰 Conta Solicitada',
            type: 'WAITER_REQUEST'
        }));
    });

    it('should notify loss detected', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.notifyLossDetected('5', 150.50, 'INACTIVITY');
        });

        const { addDoc } = await import('@firebase/firestore');
        expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
            title: '🚨 Perda Detectada',
            priority: 'URGENT'
        }));
    });
});
