import { render, screen, fireEvent } from '@/test/test-utils';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Note: KDS is imported dynamically in tests to allow mocks to apply first

// --- Mocks ---
// We simply hoist the mock data values, but not the module mock itself if we want to change it per test (which we do for the empty case)
// ... keeping it simple for now, mocking globally first.

// --- Mocks ---
const { mockOrders, mockHandleUpdateStatus } = vi.hoisted(() => {
    return {
        mockOrders: [
            {
                id: '101',
                orderNumber: '101',
                items: [{ productName: 'Pizza', quantity: 1, productId: 'p1', price: 50, basePrice: 50 }],
                status: 'PREPARING',
                type: 'DINE_IN',
                createdAt: new Date(),
                total: 50,
                tenantId: 'test-tenant',
                customerName: 'Test Customer',
                payments: [],
                cost: 0,
                origin: 'POS'
            }
        ],
        mockHandleUpdateStatus: vi.fn()
    };
});


vi.mock('../components/kds/KDSCard', () => ({
    default: ({ advanceOrder, order }: any) => (
        <button data-testid="mock-card-btn" onClick={() => advanceOrder(order)}>
            MockCard {order.id}
        </button>
    )
}));

vi.mock('../../../contexts/AppContext', () => ({
    useApp: () => ({
        settings: {
            kitchen: {
                preparationTime: 20,
                safetyBuffer: 10
            },
            interface: {
                showReadyColumn: true
            }
        },
        handleUpdateStatus: mockHandleUpdateStatus
    })
}));

vi.mock('../../hooks/useOrders', () => ({
    useOrders: () => ({
        data: mockOrders,
        loading: false,
        error: null,
        updateStatus: mockHandleUpdateStatus
    })
}));

vi.mock('@/hooks/useOrders', () => ({
    useOrders: () => ({
        data: mockOrders,
        loading: false,
        error: null,
        updateStatus: mockHandleUpdateStatus
    })
}));

describe('KDS Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render orders in PREPARING status', async () => {
        const KDS = (await import('../pages/KDS')).default;
        console.log('DEBUG TEST mockOrders:', JSON.stringify(mockOrders, null, 2));
        render(<KDS />);
        expect(screen.getByText('MockCard 101')).toBeInTheDocument();
        // expect(screen.getByText('Pizza')).toBeInTheDocument(); // Pizza is inside KDSCard which is mocked, so it won't be rendered
    });

    it('should filter orders by status in columns', async () => {
        const KDS = (await import('../pages/KDS')).default;
        render(<KDS />);
        // The mock order has status PREPARING, so it should appear in the PREPARING column
        // The component renders KDSCard which is mocked to show "MockCard {order.id}"
        expect(screen.getByText('MockCard 101')).toBeInTheDocument();
    });

    it('should call updateStatus when advancing order', async () => {
        const KDS = (await import('../pages/KDS')).default;
        render(<KDS />);

        // The mocked KDSCard renders a button with data-testid="mock-card-btn"
        const advanceBtn = screen.getByTestId('mock-card-btn');
        fireEvent.click(advanceBtn);

        // Mock order status is PREPARING, so advancing should move to READY
        expect(mockHandleUpdateStatus).toHaveBeenCalledWith({ orderId: '101', status: 'READY' });
    });

    it('should show "Sem pedidos" when no orders match criteria', async () => {
        // Mock empty orders for this test specifically
        // Since we use dynamic imports, we can re-do mock per test if needed using doMock?
        // Or just strictly spyOn the module.
        // vi.mock IS hoisted so dynamic import sees the global mock.
        // To change it, we need `doMock` BEFORE import.

        vi.resetModules(); // Clear cache so we can re-import
        vi.resetModules(); // Clear cache so we can re-import
        vi.doMock('../../hooks/useOrders', () => ({
            useOrders: () => ({ data: [], loading: false, error: null })
        }));
        vi.doMock('@/hooks/useOrders', () => ({
            useOrders: () => ({ data: [], loading: false, error: null })
        }));

        const KDS = (await import('../pages/KDS')).default;
        render(<KDS />);
        const emptyMessages = screen.getAllByText(/Nenhum pedido aqui/i);
        expect(emptyMessages.length).toBeGreaterThan(0);
    });
});
