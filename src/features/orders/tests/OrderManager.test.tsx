import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderManager from '../pages/OrderManager';
import { OrderStatus } from '@/types';

// --- Mocks ---
const { mockOrders, mockHandleUpdateStatus, mockSettings } = vi.hoisted(() => {
    const orders = [
        {
            id: '1001',
            customerName: 'Alice Active',
            status: 'PENDING',
            items: [{ productName: 'Burger' }],
            total: 25,
            createdAt: new Date().toISOString(),
            type: 'DINE_IN'
        },
        {
            id: '1002',
            customerName: 'Bob History',
            status: 'COMPLETED',
            items: [{ productName: 'Pizza' }],
            total: 40,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            type: 'TAKEOUT'
        }
    ];

    const settings = {
        interface: { showReadyColumn: true }
    };

    return {
        mockOrders: orders,
        mockHandleUpdateStatus: vi.fn(),
        mockSettings: settings
    };
});

// Mock dependencies
vi.mock('@/lib/react-query/queries/useProductsQuery', () => ({
    useProductsQuery: () => ({
        products: []
    })
}));

vi.mock('@/contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/contexts/AppContext')>();
    return {
        ...actual,
        useApp: () => ({
            handleUpdateStatus: mockHandleUpdateStatus,
            settings: mockSettings,
            tenantId: 'test-tenant'
        }),
    };
});

vi.mock('@/features/auth/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth/context/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({
            systemUser: { id: 'user1', tenantId: 'test-tenant' }
        })
    };
});

vi.mock('@/hooks/useOrders', () => ({
    useOrders: () => ({
        data: mockOrders,
        loading: false
    })
}));

// Mock simple OrderCard to avoid deep rendering issues and focus on Manager logic
vi.mock('../components/OrderCard', () => ({
    default: ({ order }: any) => (
        <div data-testid={`order-card-${order.id}`}>
            {order.customerName} - {order.status}
        </div>
    )
}));

describe('OrderManager Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('should render active orders in Kanban view by default', () => {
        render(<OrderManager />);

        // Check for Kanban Headers
        expect(screen.getByText(/Aprovando/i)).toBeInTheDocument();

        // Active order should be visible
        expect(screen.getByText('Alice Active - PENDING')).toBeInTheDocument();

        // Completed order should NOT be visible in Active view
        expect(screen.queryByText('Bob History - COMPLETED')).not.toBeInTheDocument();
    });

    it('should switch to History view and show completed orders', () => {
        render(<OrderManager />);

        // Find and click History button
        const historyBtn = screen.getByText(/Histórico/i);
        fireEvent.click(historyBtn);

        // Date filter defaults to TODAY, so Bob (Yesterday) might be hidden.
        // Switch filter to 'Tudo' (ALL)
        const allBtn = screen.getByText('Tudo'); // 'ALL' maps to 'Tudo'
        fireEvent.click(allBtn);

        // Check for Table Headers
        expect(screen.getByText('Data/Hora')).toBeInTheDocument();
        expect(screen.getByText('Cliente')).toBeInTheDocument();

        // Active order logic in history depends on filter implementation, 
        // usually History shows "Archived" status (Completed/Cancelled).
        // Let's verify Bob (Completed) is there.
        expect(screen.getByText('Bob History')).toBeInTheDocument();
        // Alice (Pending) should typically NOT be in History unless filtered otherwise, 
        // OrderManager logic: if (isHistory && !isArchivedStatus) return false;
        expect(screen.queryByText('Alice Active')).not.toBeInTheDocument();
    });

    it('should filter orders by search query', async () => {
        render(<OrderManager />); // Starts in Active view

        const searchInput = screen.getByPlaceholderText(/Buscar ID, nome ou item.../i);

        // Search for non-existent
        fireEvent.change(searchInput, { target: { value: 'XYZ' } });

        // Wait for debounce (300ms)
        await waitFor(() => {
            expect(screen.queryByText('Alice Active - PENDING')).not.toBeInTheDocument();
        });

        // Search for existing
        fireEvent.change(searchInput, { target: { value: 'Alice' } });
        await waitFor(() => {
            expect(screen.getByText('Alice Active - PENDING')).toBeInTheDocument();
        });
    });

});
