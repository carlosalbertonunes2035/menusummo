import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import React from 'react';
import DigitalMenu from './DigitalMenu';

// --- MOCKS ---

const mockNavigate = vi.fn();

// Mock React Router - keeping it simple since test-utils provides MemoryRouter
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/' }),
        useParams: () => ({ slugLoja: 'test-store' }),
    };
});

// Mock useApp context
vi.mock('../../../contexts/AppContext', () => ({
    useApp: () => ({
        showToast: vi.fn(),
        onPlaceOrder: vi.fn(),
        settings: { brandName: 'Pizzaria Teste' }
    })
}));

// Mock usePublicData context
vi.mock('../../../contexts/PublicDataContext', () => ({
    usePublicData: () => ({
        products: [],
        settings: {},
        isLoading: false
    })
}));

// --- CRITICAL: Mock useDigitalMenu Hook ---
const { defaultMockState, mockHandleProductCta } = vi.hoisted(() => {
    const mockHandleProductCta = vi.fn();
    return {
        defaultMockState: {
            products: [
                {
                    id: '1',
                    name: 'Pizza Margherita',
                    category: 'Pizzas',
                    description: 'Molho, queijo e manjericão',
                    channels: [{ channel: 'digital-menu', price: 40, isAvailable: true }]
                },
                {
                    id: '2',
                    name: 'Coke',
                    category: 'Bebidas',
                    description: 'Gelada',
                    channels: [{ channel: 'digital-menu', price: 5, isAvailable: true }]
                }
            ],
            filteredProducts: [
                { id: '1', name: 'Pizza Margherita', category: 'Pizzas', description: 'Molho, queijo e manjericão', channels: [{ channel: 'digital-menu', price: 40, isAvailable: true }] },
                { id: '2', name: 'Coke', category: 'Bebidas', description: 'Gelada', channels: [{ channel: 'digital-menu', price: 5, isAvailable: true }] }
            ],
            settings: {
                brandName: 'Pizzaria Teste',
                logoUrl: 'https://example.com/logo.png',
                bannerUrl: 'https://example.com/banner.png',
                address: { street: 'Rua Teste', number: '123' },
                phone: '1199999999',
                seo: { title: 'SEO Title Test', description: 'SEO Description Test' },
                digitalMenu: { layout: 'GRID' },
                schedule: [],
                social: { instagram: '@pizza' }
            },
            categories: ['Pizzas', 'Bebidas', '🔥 Promoções'],
            activeTab: 'feed',
            activeCategory: 'Pizzas',
            cart: [],
            cartCount: 0,
            cartTotal: 0,
            isCartOpen: false,
            isClosed: false,
            isDarkMode: false,
            viewMode: 'LIST',
            searchTerm: '',
            promotionalProducts: [],
            // Handlers
            setActiveTab: vi.fn(),
            setViewMode: vi.fn(),
            setActiveCategory: vi.fn(),
            handleProductCta: mockHandleProductCta,
            setSearchTerm: vi.fn(),
            setIsCartOpen: vi.fn(),
            scrollToCategory: vi.fn(),
            categoryRefs: { current: {} },
            navRef: { current: null },
            scrollContainerRef: { current: null },
            updateUrlForProduct: vi.fn(),
            user: { name: 'Test User' },
            isAddressModalOpen: false,
            selectedProductForDetail: null,
            isUpsellOpen: false,
            activeOrderId: null,
            commentProduct: null,
            visibleCoupons: []
        },
        mockHandleProductCta
    };
});

vi.mock('../hooks/useDigitalMenu', () => ({
    useDigitalMenu: () => defaultMockState
}));

// Mock AuthContext for test-utils
vi.mock('@/features/auth/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth/context/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({ systemUser: { tenantId: 'test-tenant' }, user: { uid: '123' } })
    };
});

describe('DigitalMenu Component Integration', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HAPPY PATH: Renders store interface and products correctly', () => {
        render(<DigitalMenu />);

        // Brand Name
        expect(screen.getByText('Pizzaria Teste')).toBeTruthy();

        // Categories
        expect(screen.getAllByText('Pizzas').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Bebidas').length).toBeGreaterThan(0);

        // Products that SHOULD be visible
        expect(screen.getByText('Pizza Margherita')).toBeTruthy();
        expect(screen.getByText('Coke')).toBeTruthy();
    });

    it('SEO CHECK: Meta Tags are correctly injected into Head', async () => {
        render(<DigitalMenu />);

        // Check Document Title (Helmet)
        await waitFor(() => {
            expect(document.title).toContain('SEO Title Test');
        });

        // Check Meta Description
        const metaDesc = document.querySelector('meta[name="description"]');
        expect(metaDesc?.getAttribute('content')).toBe('SEO Description Test');
    });

    it('INTERACTION: Clicking a product triggers CTA correctly', () => {
        render(<DigitalMenu />);

        const productCard = screen.getByText('Pizza Margherita');
        fireEvent.click(productCard);

        expect(mockHandleProductCta).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            name: 'Pizza Margherita'
        }));
    });
});
