import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../model/hooks/useCart';

// Mocks
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'user-1', tenantId: 'tenant-1' }
    })
}));

vi.mock('@firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    serverTimestamp: vi.fn(() => new Date()),
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(),
    persistentMultipleTabManager: vi.fn(),
}));

vi.mock('@/lib/firebase/client', () => ({
    db: {}
}));

vi.mock('../model/hooks/useTableSession', () => ({
    useTableSession: () => ({
        session: { id: 'sess-1', customerName: 'João', tableNumber: '5', tableId: 'table-5' },
        addOrderToSession: vi.fn(() => Promise.resolve()),
    })
}));

vi.mock('@/lib/repository/OrderRepository', () => ({
    OrderRepository: vi.fn().mockImplementation(function () {
        return {
            create: vi.fn(() => Promise.resolve('order-123')),
        };
    })
}));

describe('useCart Hook', () => {
    const tableId = 'table-5';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should manage cart items correctly', () => {
        const { result } = renderHook(() => useCart(tableId));

        const product = { id: 'p1', name: 'Suco', channels: [{ name: 'digital-menu', price: 8 }] };

        act(() => {
            result.current.addToCart(product as any, 2);
        });

        expect(result.current.cart.length).toBe(1);
        expect(result.current.subtotal).toBe(16);

        act(() => {
            result.current.updateQuantity(result.current.cart[0].id, 3);
        });

        expect(result.current.subtotal).toBe(24);

        act(() => {
            result.current.removeFromCart(result.current.cart[0].id);
        });

        expect(result.current.cart.length).toBe(0);
    });

    it('should submit order and clear cart', async () => {
        const { result } = renderHook(() => useCart(tableId));
        const product = { id: 'p1', name: 'Suco', channels: [{ name: 'digital-menu', price: 8 }] };

        act(() => {
            result.current.addToCart(product as any, 1);
        });

        let orderId;
        await act(async () => {
            orderId = await result.current.submitOrder();
        });

        expect(orderId).toBeDefined();
        expect(result.current.cart.length).toBe(0);
    });
});
