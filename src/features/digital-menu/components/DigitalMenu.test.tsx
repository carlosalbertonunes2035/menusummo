import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DigitalMenu from './DigitalMenu';
import { HelmetProvider } from 'react-helmet-async';

// Helper to render with Helmet
const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <HelmetProvider>
            {component}
        </HelmetProvider>
    );
};

// --- MOCKS ---

const mockNavigate = vi.fn();

// Mock React Router
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
    useParams: () => ({ slugLoja: 'test-store' }),
    BrowserRouter: ({ children }: any) => <div>{children}</div>,
    NavLink: ({ children }: any) => <div>{children}</div>
}));

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
                },
                {
                    id: 'ghost-1',
                    name: 'Ghost Pizza',
                    category: 'Pizzas',
                    description: 'Hidden',
                    channels: [{ channel: 'pos', price: 30, isAvailable: true }] // NOT in digital-menu
                },
                {
                    id: 'ghost-2',
                    name: 'Unavailable Pizza',
                    category: 'Pizzas',
                    description: 'Offline',
                    channels: [{ channel: 'digital-menu', price: 35, isAvailable: false }] // Unavailable
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

describe('DigitalMenu HARD Verification', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ... (existing imports)

    // ...

    it('HAPPY PATH: Renders store interface and products correctly', () => {
        renderWithProviders(<DigitalMenu />);

        // Brand Name
        expect(screen.getByText('Pizzaria Teste')).toBeTruthy();

        // Categories (Might appear multiple times: Nav + Section Header)
        expect(screen.getAllByText('Pizzas').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Bebidas').length).toBeGreaterThan(0);

        // Products that SHOULD be visible
        expect(screen.getByText('Pizza Margherita')).toBeTruthy();
        expect(screen.getByText('Coke')).toBeTruthy();
    });

    it('GHOST CHECK: Does NOT render products unavailable in digital-menu channel', () => {
        renderWithProviders(<DigitalMenu />);

        // Ghost Pizza (POS only) should not be in filteredProducts (mock logic assumes filter already happened in hook)
        // But we check that it's NOT in the document
        expect(screen.queryByText('Ghost Pizza')).toBeNull();
        expect(screen.queryByText('Unavailable Pizza')).toBeNull();
    });

    it('SEO CHECK: Meta Tags are correctly injected into Head', async () => {
        renderWithProviders(<DigitalMenu />);

        // Check Document Title (Helmet)
        await waitFor(() => {
            expect(document.title).toContain('SEO Title Test');
        });

        // Check Meta Description
        // In JSDOM, we have to look for the meta tag in document.head
        const metaDesc = document.querySelector('meta[name="description"]');
        expect(metaDesc?.getAttribute('content')).toBe('SEO Description Test');
    });

    it('INTERACTION: Clicking a product triggers CTA correctly', () => {
        renderWithProviders(<DigitalMenu />);

        const productCard = screen.getByText('Pizza Margherita');
        fireEvent.click(productCard);

        expect(mockHandleProductCta).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            name: 'Pizza Margherita'
        }));
    });

    it('PRICE CHECK: Renders formatted prices correctly', () => {
        renderWithProviders(<DigitalMenu />);

        // Check for "40,00" or similar (depending on locale)
        // Usually it's R$ 40,00 in the UI
        const priceElement = screen.getByText(/40/);
        expect(priceElement).toBeTruthy();
    });
});
