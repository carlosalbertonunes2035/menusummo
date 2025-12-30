import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSession } from '../model/hooks/useTableSession';
import { useCart } from '../model/hooks/useCart';
import { useOrderClaim } from '../model/hooks/useOrderClaim';

// --- Global Mocks ---

vi.mock('@firebase/firestore', () => {
    const mockDoc = { id: 'mock-doc-id' };
    return {
        collection: vi.fn((db, name) => ({ id: 'mock-coll-' + name, name })),
        doc: vi.fn(() => mockDoc),
        setDoc: vi.fn(() => Promise.resolve()),
        addDoc: vi.fn(() => Promise.resolve({ id: 'mock-new-id' })),
        updateDoc: vi.fn(() => Promise.resolve()),
        getDoc: vi.fn(() => Promise.resolve({
            exists: () => true,
            data: () => ({ tenantId: 'tenant-1', status: 'ACTIVE' })
        })),
        getDocs: vi.fn((q) => {
            // Se for query de tableSessions, retorna a sessão
            if (q?.name === 'tableSessions' || (q?.filter && JSON.stringify(q).includes('tableSessions'))) {
                return Promise.resolve({
                    empty: false,
                    docs: [{ id: 'sess-1', data: () => ({ tenantId: 'tenant-1', tableId: 'table-5', status: 'ACTIVE', orderIds: [], totalAmount: 0, customerName: 'Cliente E2E', tableNumber: 'Mesa 5' }) }]
                });
            }
            // Para outras coleções (como orderClaims), retorna vazio para permitir o claim
            return Promise.resolve({ empty: true, docs: [] });
        }),
        query: vi.fn((coll) => coll),
        where: vi.fn(),
        onSnapshot: vi.fn(() => vi.fn()),
        serverTimestamp: vi.fn(() => new Date()),
        runTransaction: vi.fn((db, cb) => cb({
            set: vi.fn(),
            update: vi.fn(),
        })),
        initializeFirestore: vi.fn(() => ({})),
        persistentLocalCache: vi.fn(),
        persistentMultipleTabManager: vi.fn(),
        connectFirestoreEmulator: vi.fn(),
    };
});

vi.mock('../../../lib/firebase/client', () => ({
    db: { type: 'firestore' },
    auth: { currentUser: { uid: 'u1', tenantId: 'tenant-1' } },
    app: {}
}));

vi.mock('../../../lib/firebase', () => ({
    db: { type: 'firestore' }
}));

vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'u1', tenantId: 'tenant-1', displayName: 'Teste' }
    })
}));

describe('Virtual Tab - Full Flow Finalized', () => {
    const tableId = 'table-5';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should complete the happy flow cycle', async () => {
        const { result: sessionHook } = renderHook(() => useTableSession(tableId));
        await act(async () => {
            await sessionHook.current.createSession({
                customerName: 'Cliente E2E',
                customerPhone: '11999999999'
            });
        });

        const { result: cartHook } = renderHook(() => useCart(tableId));
        await vi.waitFor(() => expect(cartHook.current.isSubmitting).toBe(false), { timeout: 1000 });

        act(() => {
            cartHook.current.addToCart({
                id: 'p1',
                name: 'Pizza',
                channels: [{ name: 'digital-menu', price: 50 }]
            } as any, 1);
        });

        await act(async () => {
            await cartHook.current.submitOrder();
        });

        expect(cartHook.current.cart.length).toBe(0);

        const { result: claimHook } = renderHook(() => useOrderClaim());
        let res: any;
        await act(async () => {
            res = await claimHook.current.claimOrder({
                id: 'ord-123',
                items: [{ productId: 'p1', productName: 'Pizza', quantity: 1 }],
                total: 50,
                createdAt: new Date(),
                tableNumber: 'Mesa 5'
            } as any);
        });

        expect(res.success).toBe(true);
        expect(res.message).toContain('sucesso');
    });
});
