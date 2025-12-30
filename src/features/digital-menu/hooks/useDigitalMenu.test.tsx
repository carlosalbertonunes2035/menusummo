import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor, createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDigitalMenu } from './useDigitalMenu';
import * as reactRouter from 'react-router-dom';
import * as PublicDataContext from '../../../contexts/PublicDataContext';
import * as AppContext from '../../../contexts/AppContext';
import { DigitalMenuProvider } from '../context/DigitalMenuContext';
import React from 'react';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(() => ({ pathname: '/' })),
    useParams: vi.fn(() => ({ slugLoja: 'test-store' }))
}));

// Mock contexts
vi.mock('../../../contexts/PublicDataContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../contexts/PublicDataContext')>();
    return {
        ...actual,
        usePublicData: vi.fn()
    };
});

vi.mock('../../../contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../contexts/AppContext')>();
    return {
        ...actual,
        useApp: vi.fn()
    };
});

vi.mock('@/features/auth/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth/context/AuthContext')>();
    return {
        ...actual,
        useAuth: vi.fn()
    };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
            <ToastProvider>
                <DigitalMenuProvider>
                    {children}
                </DigitalMenuProvider>
            </ToastProvider>
        </AuthProvider>
    </QueryClientProvider>
);

import * as AuthContext from '@/features/auth/context/AuthContext';

describe('useDigitalMenu', () => {
    const mockProducts = [
        {
            id: '1',
            name: 'Pizza',
            category: 'Comida',
            channels: [{ channel: 'digital-menu', price: 50, isAvailable: true, displayName: 'Pizza' }]
        },
        {
            id: '2',
            name: 'Cerveja',
            category: 'Bebida',
            channels: [{ channel: 'digital-menu', price: 10, isAvailable: true, displayName: 'Cerveja' }]
        }
    ];

    const mockSettings = {
        brandName: 'Test Brand',
        delivery: { baseFee: 5 },
        interface: { categoryOrder: ['Bebida', 'Comida'] },
        digitalMenu: { layout: 'GRID' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (AuthContext.useAuth as any).mockReturnValue({
            systemUser: { id: 'user-123', tenantId: 'test-store' },
            user: { uid: 'user-123' }
        });
        (PublicDataContext.usePublicData as any).mockReturnValue({
            products: mockProducts,
            stories: [],
            optionGroups: [],
            settings: mockSettings
        });
        (AppContext.useApp as any).mockReturnValue({
            onPlaceOrder: vi.fn(),
            showToast: vi.fn()
        });
        localStorage.clear();
    });

    it('should initialize cart from localStorage', async () => {
        const cartData = [{ product: mockProducts[0], quantity: 2, notes: '', selectedOptions: [] }];
        localStorage.setItem('summo_customer_cart', JSON.stringify(cartData));

        const { result } = renderHook(() => useDigitalMenu(), { wrapper: TestWrapper });

        await waitFor(() => {
            expect(result.current.cart).toHaveLength(1);
        });
        expect(result.current.cart[0].product.name).toBe('Pizza');
    });

    it('should calculate cart total correctly', async () => {
        const { result } = renderHook(() => useDigitalMenu(), { wrapper: TestWrapper });

        act(() => {
            result.current.handleAddToCartFromModal({
                product: mockProducts[0] as any,
                quantity: 1,
                notes: '',
                selectedOptions: []
            });
        });

        // Trigger upsell close to actually add to cart
        act(() => {
            result.current.handleUpsellClose(null);
        });

        await waitFor(() => {
            expect(result.current.cartTotal).toBe(50);
            expect(result.current.cartCount).toBe(1);
        });

        act(() => {
            result.current.updateCartItem(0, 1);
        });

        await waitFor(() => {
            expect(result.current.cartTotal).toBe(100);
            expect(result.current.cartCount).toBe(2);
        });
    });

    it('should sort categories according to settings', () => {
        const { result } = renderHook(() => useDigitalMenu(), { wrapper: TestWrapper });

        // Settings order is ['Bebida', 'Comida']
        expect(result.current.categories).toEqual(['Bebida', 'Comida']);
    });

    it('should filter products by search term', () => {
        const { result } = renderHook(() => useDigitalMenu(), { wrapper: TestWrapper });

        act(() => {
            result.current.setSearchTerm('Pizza');
        });

        expect(result.current.filteredProducts).toHaveLength(1);
        expect(result.current.filteredProducts[0].name).toBe('Pizza');
    });
});
