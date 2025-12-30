import { render, screen, fireEvent } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import POS from '../pages/POS';
import { OrderType } from '@/types';

// --- Mocks ---
const { mockUsePOS, mockUseApp, mockUseData } = vi.hoisted(() => ({
    mockUsePOS: {
        cart: [],
        addToCart: vi.fn(), // We will override this in the test
        updateCartItem: vi.fn(),
        removeCartItem: vi.fn(),
        grandTotal: 100,
        payments: [],
        orderType: 'DINE_IN',
        setOrderType: vi.fn(),
        clearPOS: vi.fn(),
    },
    mockUseApp: {
        cashRegister: { isOpen: true },
        setCashRegister: vi.fn(),
        showToast: vi.fn(),
        settings: { operation: { dineIn: true, takeout: true, delivery: true } }
    },
    mockUseData: {
        products: [
            { id: '1', name: 'Burger', category: 'Food', channels: [{ channel: 'pos', isAvailable: true, price: 10 }] }
        ],
        ingredients: []
    }
}));

// Mock AuthContext using importOriginal to keep AuthProvider component intact
vi.mock('@/features/auth/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth/context/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({
            systemUser: { id: 'user1', tenantId: 'test-tenant' },
            user: { uid: 'user1' }
        })
    };
});

vi.mock('../hooks/usePOS', () => ({
    usePOS: () => mockUsePOS
}));

vi.mock('@/contexts/AppContext', () => ({
    useApp: () => mockUseApp
}));

const mockShowToast = vi.fn();
vi.mock('@/contexts/ToastContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/contexts/ToastContext')>();
    return {
        ...actual,
        useToast: () => ({ showToast: mockShowToast })
    };
});


vi.mock('@/features/inventory/hooks/queries', () => ({
    useProducts: () => ({ data: mockUseData.products, isLoading: false }),
    useIngredients: () => ({ data: mockUseData.ingredients, isLoading: false }),
}));

// Mock sub-components if necessary, but we are testing integration so let's try to keep them real
// However, ProductGrid and CartPanel are complex, so deep integration might be slow.
// For now, let's test the main POS orchestration.

vi.mock('../components/ProductGrid', () => ({
    default: ({ products, onAdd }: any) => (
        <div data-testid="product-grid">
            {products.map((p: any) => (
                <button key={p.id} onClick={() => onAdd(p)}>
                    {p.name}
                </button>
            ))}
        </div>
    )
}));

vi.mock('../components/CartPanel', () => ({
    default: ({ cart, grandTotal }: any) => (
        <div data-testid="cart-panel">
            <span>Items: {cart.length}</span>
            <span>Total: {grandTotal}</span>
        </div>
    )
}));

describe('POS Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseApp.cashRegister.isOpen = true; // Default to open
    });

    it('should render Cash Closed state if register is closed', () => {
        mockUseApp.cashRegister.isOpen = false;
        render(<POS />);
        expect(screen.getByText('Caixa Fechado')).toBeInTheDocument();
        expect(screen.getByText('Abrir Caixa')).toBeInTheDocument();
    });

    it('should render POS interface when cash is open', () => {
        mockUseApp.cashRegister.isOpen = true;
        render(<POS />);
        expect(screen.queryByText('Caixa Fechado')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Buscar produto/i)).toBeInTheDocument();
    });

    it('should handle product quick add', () => {
        // Mock addToCart to return true so the toast is triggered
        mockUsePOS.addToCart.mockReturnValue(true);
        render(<POS />);

        const productBtn = screen.getByText('Burger');
        fireEvent.click(productBtn);

        expect(mockUsePOS.addToCart).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Burger' }),
            1
        );
        expect(mockShowToast).toHaveBeenCalled();
    });

    it('should filter products by search term', () => {
        render(<POS />);
        const searchInput = screen.getByPlaceholderText(/Buscar produto/i);

        fireEvent.change(searchInput, { target: { value: 'Burger' } });
        expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    it('should open AI modal when clicking magic wand', () => {
        render(<POS />);
        const aiButton = screen.getByText('IA');
        fireEvent.click(aiButton);
        expect(screen.getByText('IA Mágica')).toBeInTheDocument(); // Verified title in POSModals.tsx
    });

    it('should open cash register with valid amount', () => {
        mockUseApp.cashRegister.isOpen = false;
        render(<POS />);

        const input = screen.getByRole('spinbutton'); // Number input for amount
        fireEvent.change(input, { target: { value: '200' } });

        const openBtn = screen.getByText('Abrir Caixa');
        fireEvent.click(openBtn);

        expect(mockUseApp.setCashRegister).toHaveBeenCalledWith(expect.objectContaining({
            isOpen: true,
            initialAmount: 200
        }));
    });
});

