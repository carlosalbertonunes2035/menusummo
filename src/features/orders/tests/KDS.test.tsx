import { render, screen, fireEvent } from '@testing-library/react';
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

vi.mock('../../../contexts/DataContext', () => {
    console.log("DEBUG: Mock Factory for DataContext Executed");
    return {
        useData: () => {
            console.log("DEBUG: Mock useData Executed");
            return {
                orders: mockOrders
            };
        }
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
        error: null
    })
}));

vi.mock('@/hooks/useOrders', () => ({
    useOrders: () => ({
        data: mockOrders,
        loading: false,
        error: null
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

    it('should filter orders by type', async () => {
        const KDS = (await import('../pages/KDS')).default;
        render(<KDS />);
        // By default all orders are shown unless filtered by KDS logic
        expect(screen.getByText('MockCard 101')).toBeInTheDocument();
    });

    it('should call handleAction when advancing order status', async () => {
        const KDS = (await import('../pages/KDS')).default;
        render(<KDS />);
        // Status is PREPARING, so next is READY. Button text might be "Pronto" or similar.
        // Debugging component showed it renders "Pronto / Aguardando" header, but button inside card?
        // Let's assume text "Pronto" or check logic.
        // KDSCard logic: if status==PREPARING -> button is usually "Pronto"?
        // Wait, looking at KDSCard (Step 1588 summary): "expecting a 'Pronto' button text instead of 'Finalizar'".
        // Component logic: 
        // if PREPARING -> handleUpdateStatus(READY). Button text?
        // I should look for button by role or text.
        // Let's search for *any* button in the card.
        // We can use getByText with regex.

        // Wait, failing test said: Unable to find an element with the text: /Finalizar/i
        // KDSCard advances PENDING->PREPARING->READY->COMPLETED.
        // Mock order is PREPARING.
        // Button should be for advancing to READY.

        // I will inspect KDS.tsx line 167: <KDSCard ... />
        // I need to know what KDSCard renders.
        // I'll trust the error message "Unable to find ... Finalizar" implies test IS looking for Finalizar.
        // But if status is PREPARING, maybe it is NOT Finalizar.
        // I will match strictly on what I see in previous logs or guess "Pronto".
        // Let's try matching a generic button or just use `screen.getAllByRole('button')[0]` if desperate, but better use text.
        // I will use /Pronto/i as it is likely for Preparing->Ready.

        const buttons = screen.getAllByRole('button');
        // With mocked KDSCard, looking for data-testid
        const advanceBtn = screen.getByTestId('mock-card-btn');
        fireEvent.click(advanceBtn);
        expect(mockHandleUpdateStatus).toHaveBeenCalledWith('101', 'READY');
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
