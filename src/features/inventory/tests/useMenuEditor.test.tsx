import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMenuEditor } from '../hooks/useMenuEditor';
import { Product, Ingredient, OrderType, SalesChannel, Recipe } from '@/types';

// --- Mocks ---
const { mockHandleAction, mockShowToast, mockGenerateMarketingCopy, mockProducts, mockIngredients, mockRecipes } = vi.hoisted(() => {
    return {
        mockHandleAction: vi.fn(),
        mockShowToast: vi.fn(),
        mockGenerateMarketingCopy: vi.fn(),
        mockProducts: [
            {
                id: 'p1',
                name: 'Burger',
                category: 'Food',
                cost: 5,
                tags: [],
                ingredients: [],
                optionGroupIds: [],
                channels: [
                    { channel: 'pos', price: 10, isAvailable: true },
                    { channel: 'digital-menu', price: 12, isAvailable: true }
                ]
            }
        ] as Product[],
        mockIngredients: [
            { id: 'i1', name: 'Meat', costPerUnit: 2, unit: 'kg', currentStock: 10, minStock: 2, isActive: true, image: '' },
            { id: 'i2', name: 'Bun', costPerUnit: 1, unit: 'un', currentStock: 20, minStock: 5, isActive: true, image: '' }
        ] as Ingredient[],
        mockRecipes: [] as Recipe[]
    };
});

vi.mock('@/contexts/AppContext', () => ({
    useApp: () => ({
        handleAction: mockHandleAction,
        showToast: mockShowToast,
    }),
}));

vi.mock('@/contexts/DataContext', () => ({
    useData: () => ({
        products: mockProducts,
        ingredients: mockIngredients,
        recipes: mockRecipes,
    }),
}));

vi.mock('@/services/geminiService', () => ({
    generateMarketingCopy: mockGenerateMarketingCopy
}));

// Mock window.confirm
const confirmSpy = vi.spyOn(window, 'confirm');

describe('useMenuEditor Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        confirmSpy.mockImplementation(() => true); // Default 'yes' to confirms
    });

    afterEach(() => {
        confirmSpy.mockReset();
    });

    it('should initialize with default states', () => {
        const { result } = renderHook(() => useMenuEditor());
        expect(result.current.selectedProduct).toBeNull();
        expect(result.current.activeTab).toBe('GENERAL');
    });

    it('should open editor with a product', () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
        });

        expect(result.current.selectedProduct).toEqual(product);
        expect(result.current.currentEditingProduct?.id).toBe(product.id);
    });

    it('should detect changes when editData is modified', () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
        });

        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.setEditData({ name: 'Burger Updated' });
        });

        expect(result.current.isDirty).toBe(true);
        expect(result.current.currentEditingProduct?.name).toBe('Burger Updated');
    });

    it('should handle save action with validation', async () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
            result.current.setEditData({ name: 'Valid Name' });
        });

        await act(async () => {
            await result.current.handleSave();
        });

        expect(mockHandleAction).toHaveBeenCalledWith('products', 'update', 'p1', expect.objectContaining({
            name: 'Valid Name'
        }));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('sucesso'), 'success');
    });

    it('should validate before saving (error case)', async () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
            // Simulate invalid data that fails Zod schema (e.g., name is required)
            result.current.setEditData({ name: '' });
        });

        await act(async () => {
            await result.current.handleSave();
        });

        // Should NOT call handleAction if validation fails
        expect(mockHandleAction).not.toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('deve ter pelo menos 2 caracteres'), 'error');
    });

    it('should handle ingredient recipe management', () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
        });

        act(() => {
            // Add ingredient i1
            result.current.addIngredientToRecipe('i1');
        });

        expect(result.current.currentEditingProduct?.recipe?.ingredients).toHaveLength(1);
        expect(result.current.currentEditingProduct?.recipe?.ingredients![0].ingredientId).toBe('i1');

        // Update amount
        act(() => {
            result.current.updateIngredientAmount(0, 5);
        });
        expect(result.current.currentEditingProduct?.recipe?.ingredients![0].quantity).toBe(5);

        // Remove ingredient
        act(() => {
            result.current.removeIngredient(0);
        });
        expect(result.current.currentEditingProduct?.recipe?.ingredients).toHaveLength(0);
    });

    it('should handle channel data changes', () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
        });

        act(() => {
            // Explicitly pass 'pos' to ensure it targets the correct channel regardless of async state updates
            result.current.handleChannelDataChange('price', 25, 'pos');
        });

        const posChannel = result.current.currentEditingProduct?.channels.find(c => c.channel === 'pos');
        expect(posChannel?.price).toBe(25);
    });

    it('should handle creating a new product', () => {
        const { result } = renderHook(() => useMenuEditor());

        act(() => {
            result.current.handleOpenCreator('Food');
        });

        expect(result.current.selectedProduct?.name).toBe('Novo Produto');
        expect(result.current.selectedProduct?.category).toBe('Food');
    });

    it('should confirm discarding changes before closing', async () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
            result.current.setEditData({ name: 'Changed' });
        });

        // Mock confirm to return FALSE (Cancel/Discard)
        confirmSpy.mockReturnValue(false);

        await act(async () => {
            await result.current.handleClose();
        });

        // Should close (selectedProduct null) and NOT save
        expect(result.current.selectedProduct).toBeNull();
        expect(mockHandleAction).not.toHaveBeenCalled();
    });

    it('should confirm saving changes before closing', async () => {
        const { result } = renderHook(() => useMenuEditor());
        const product = mockProducts[0];

        act(() => {
            result.current.openEditor(product);
            result.current.setEditData({ name: 'Changed' });
        });

        // Scenario 2: User clicks OK on "Do you want to save?"
        confirmSpy.mockReturnValue(true);

        await act(async () => {
            await result.current.handleClose();
        });

        // Should save and then close
        expect(mockHandleAction).toHaveBeenCalled();
        expect(result.current.selectedProduct).toBeNull();
    });
});
