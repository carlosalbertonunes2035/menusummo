import { renderHook, act } from '@testing-library/react';
import { usePOS } from '../hooks/usePOS';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppProvider } from '@/contexts/AppContext';
import { DataProvider } from '@/contexts/DataContext';
import { OrderType, PaymentMethod, Product } from '@/types';

// Mocks
// Mocks using vi.hoisted to ensure they are available in vi.mock factory
const { mockShowToast, mockSettings } = vi.hoisted(() => {
    return {
        mockShowToast: vi.fn(),
        mockSettings: {
            delivery: { freeShippingThreshold: 50, defaultFee: 5 },
            orderModes: { delivery: true, takeout: true, dineIn: true },
        }
    };
});

// Mock AppContext
vi.mock('@/contexts/AppContext', () => ({
    useApp: () => ({
        showToast: mockShowToast,
        settings: mockSettings,
    }),
    AppProvider: ({ children }: any) => <div>{children}</div>
}));

// Partial mock of DataContext
const mockProducts: Product[] = [
    {
        id: 'p1', name: 'Burger', category: 'Lanches', description: '',
        cost: 10,
        tags: [],
        channels: [{ channel: 'pos', price: 20, isAvailable: true }],
        ingredients: [{ ingredientId: 'i1', amount: 1 }],
        optionGroupIds: []
    },
    {
        id: 'p2', name: 'Coke', category: 'Bebidas',
        cost: 2,
        tags: [],
        channels: [{ channel: 'pos', price: 5, isAvailable: true }],
        ingredients: [],
        optionGroupIds: []
    }
];

const mockIngredients = [
    { id: 'i1', name: 'Meat', currentStock: 100, unit: 'g', cost: 0.5, isActive: true }
];

vi.mock('@/contexts/DataContext', async () => {
    return {
        useData: () => ({
            products: mockProducts,
            ingredients: mockIngredients
        })
    };
});

describe('usePOS Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with empty cart', () => {
        const { result } = renderHook(() => usePOS());
        expect(result.current.cart).toEqual([]);
        expect(result.current.cartTotal).toBe(0);
    });

    it('should add item to cart', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0];

        act(() => {
            result.current.addToCart(product, 1);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].productId).toBe('p1');
        expect(result.current.cart[0].quantity).toBe(1);
        expect(result.current.cartTotal).toBe(20);
    });

    it('should update item quantity', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0];

        act(() => {
            result.current.addToCart(product, 1);
        });

        act(() => {
            result.current.updateCartItem(0, 1); // Add 1 more
        });

        expect(result.current.cart[0].quantity).toBe(2);
        expect(result.current.cartTotal).toBe(40);
    });

    it('should remove item from cart', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0];

        act(() => {
            result.current.addToCart(product, 1);
            result.current.removeCartItem(0);
        });

        expect(result.current.cart).toHaveLength(0);
        expect(result.current.cartTotal).toBe(0);
    });

    it('should calculate totals correctly with delivery fee', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0];

        act(() => {
            result.current.setOrderType(OrderType.DELIVERY);
            result.current.setCalculatedFee(5);
            result.current.addToCart(product, 1); // 20
        });

        expect(result.current.cartTotal).toBe(20);
        expect(result.current.deliveryFee).toBe(5);
        expect(result.current.grandTotal).toBe(25);
    });

    it('should handle free shipping threshold', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0]; // Price 20

        act(() => {
            result.current.setOrderType(OrderType.DELIVERY);
            result.current.setCalculatedFee(5);
            result.current.addToCart(product, 3); // 60 > 50 threshold
        });

        expect(result.current.deliveryFee).toBe(0);
        expect(result.current.grandTotal).toBe(60);
    });

    it('should manage payments', () => {
        const { result } = renderHook(() => usePOS());

        act(() => {
            result.current.setOrderType(OrderType.DINE_IN);
            result.current.addToCart(mockProducts[0], 1); // 20
            result.current.addPayment(PaymentMethod.CASH, 20);
        });

        expect(result.current.payments).toHaveLength(1);
        expect(result.current.totalPaid).toBe(20);
        expect(result.current.remainingDue).toBe(0);
    });

    it('should calculate change due', () => {
        const { result } = renderHook(() => usePOS());

        act(() => {
            result.current.setOrderType(OrderType.DINE_IN); // No fee
            result.current.addToCart(mockProducts[0], 1); // 20
            result.current.addPayment(PaymentMethod.CASH, 50);
        });

        expect(result.current.remainingDue).toBe(0);
        expect(result.current.changeDue).toBe(30);
    });

    it('should not add item if stock is insufficient', () => {
        const { result } = renderHook(() => usePOS());
        const product = mockProducts[0]; // Needs 1 unit of i1
        // Mock stock to be low just for this test? 
        // Since we mock useData globally, it's hard to change per test without advanced setup.
        // Let's rely on the mockIngredients having 100 stock.

        // Let's try to add 101 items
        const largeQty = 101;

        let success;
        act(() => {
            success = result.current.addToCart(product, largeQty);
        });

        expect(success).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('Estoque insuficiente'), 'error');
        expect(result.current.cart).toHaveLength(0);
    });
});
