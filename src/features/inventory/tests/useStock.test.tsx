import { renderHook, act } from '../../../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStock } from '../hooks/useStock';
import { StockMovementType } from '@/types';

// Hoist mock data
const { mockIngredients } = vi.hoisted(() => ({
    mockIngredients: [
        { id: '1', name: 'Farinha', currentStock: 10, minStock: 2, unit: 'kg', cost: 50, costPerUnit: 5, isActive: true, image: '' },
        { id: '2', name: 'Ovos', currentStock: 30, minStock: 12, unit: 'un', cost: 15, costPerUnit: 0.5, isActive: true, image: '' }
    ]
}));

const mockHandleAction = vi.fn();
const mockShowToast = vi.fn();

// Mocks

vi.mock('@/services/geminiService', () => ({
    analyzeBulkReceipt: vi.fn(),
}));

vi.mock('@/services/nfeParser', () => ({
    parseNFeXML: vi.fn(),
}));

// Mock relative path used by hook
// Mock TanStack Queries
vi.mock('@/lib/react-query/queries/useStockQuery', () => ({
    useStockQuery: () => ({
        movements: [],
        shoppingList: [],
        addMovement: mockHandleAction, // Reuse mock for convenience or create new
        saveShoppingItem: vi.fn(),
        deleteShoppingItem: vi.fn()
    })
}));

vi.mock('@/lib/react-query/queries/useIngredientsQuery', () => ({
    useIngredientsQuery: () => ({
        saveIngredient: mockHandleAction, // Reuse mock for checking calls
        deleteIngredient: vi.fn(),
        ingredients: [] // unused in hook directly, hook uses paginated
    })
}));

vi.mock('@/lib/react-query/queries/useRecipesQuery', () => ({
    useRecipesQuery: () => ({
        recipes: []
    })
}));

// Mock the local queries file for ingredients pagination
vi.mock('../hooks/queries', () => ({
    useInfiniteIngredients: () => ({
        data: {
            pages: [{ docs: mockIngredients }]
        },
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false
    })
}));

// AppContext mock simplified
vi.mock('../../../contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../contexts/AppContext')>();
    return {
        ...actual,
        useApp: () => ({
            showToast: mockShowToast,
            tenantId: 'test-tenant'
        }),
    };
});

vi.mock('@/features/auth/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth/context/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({
            user: { uid: 'test-uid' },
            systemUser: { tenantId: 'test-tenant' },
            tenantId: 'test-tenant',
            role: 'owner'
        }),
    };
});

describe('useStock Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default states', () => {
        const { result } = renderHook(() => useStock());
        expect(result.current.activeTab).toBe('OVERVIEW');
        expect(result.current.ingredients).toHaveLength(2);
    });

    it('should filter ingredients by search term', () => {
        const { result } = renderHook(() => useStock());

        act(() => {
            result.current.setSearchTerm('Farinha');
        });

        // Search logic might be debounced, so we might need to wait or mock debounce
        // The original test didn't have assertions here, just execution
    });

    it('should open and close modals', () => {
        const { result } = renderHook(() => useStock());

        act(() => {
            result.current.openAddModal();
        });
        expect(result.current.modalType).toBe('ADD');
        expect(result.current.formData.name).toBe('');

        act(() => {
            result.current.closeModal();
        });
        expect(result.current.modalType).toBe(null);
    });

    it('should populate form when opening edit modal', () => {
        const { result } = renderHook(() => useStock());
        const ing = mockIngredients[0];

        act(() => {
            result.current.openEditModal(ing);
        });

        expect(result.current.modalType).toBe('EDIT');
        expect(result.current.selectedId).toBe(ing.id);
        expect(result.current.formData.name).toBe(ing.name);
        expect(result.current.formData.currentStock).toBe(ing.currentStock.toString());
    });

    it('should handle add ingredient submission', () => {
        const { result } = renderHook(() => useStock());

        act(() => {
            result.current.openAddModal('Sal');
            result.current.setFormData(prev => ({ ...prev, name: 'Sal', unit: 'kg', currentStock: '10', minStock: '5', costPerUnit: '2' }));
        });

        act(() => {
            // Simulate form submit
            const e = { preventDefault: vi.fn() } as any;
            result.current.handleFormSubmit(e);
        });

        expect(mockHandleAction).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Sal',
            currentStock: 10,
            unit: 'kg'
        }));
    });

    it('should handle restock submission', () => {
        const { result } = renderHook(() => useStock());
        const ing = mockIngredients[0];

        act(() => {
            result.current.openRestockModal(ing);
            result.current.setFormData(prev => ({ ...prev, restockQty: '5', restockTotalCost: '25' }));
        });

        act(() => {
            const e = { preventDefault: vi.fn() } as any;
            result.current.handleFormSubmit(e);
        });

        // Should update ingredient stock
        expect(mockHandleAction).toHaveBeenCalledWith(expect.objectContaining({ id: ing.id, currentStock: 15 }));
        // Should add stock movement
        expect(mockHandleAction).toHaveBeenCalledWith(expect.objectContaining({
            type: StockMovementType.IN,
            quantity: 5,
            ingredientId: ing.id
        }));
    });

    it('should handle loss submission', () => {
        const { result } = renderHook(() => useStock());
        const ing = mockIngredients[0];

        act(() => {
            result.current.openLossModal(ing);
            result.current.setFormData(prev => ({ ...prev, restockQty: '2', lossReason: 'Vencimento' }));
        });

        act(() => {
            const e = { preventDefault: vi.fn() } as any;
            result.current.handleFormSubmit(e);
        });

        // Should update ingredient stock (10 - 2 = 8)
        expect(mockHandleAction).toHaveBeenCalledWith(expect.objectContaining({ id: ing.id, currentStock: 8 }));
        // Should add stock movement
        expect(mockHandleAction).toHaveBeenCalledWith(expect.objectContaining({
            type: StockMovementType.LOSS,
            quantity: -2,
            reason: 'Vencimento'
        }));
    });
});
