import { create } from 'zustand';

interface UIState {
    // Modal States
    isCartOpen: boolean;
    isProductEditorOpen: boolean;
    editingProductId: string | null;

    // Filters & Search
    searchQuery: string;
    selectedCategory: string | null;

    // Actions
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    openProductEditor: (productId?: string) => void;
    closeProductEditor: () => void;

    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string | null) => void;
    resetFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Initial State
    isCartOpen: false,
    isProductEditorOpen: false,
    editingProductId: null,
    searchQuery: '',
    selectedCategory: null,

    // Actions
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

    openProductEditor: (productId) => set({
        isProductEditorOpen: true,
        editingProductId: productId || null
    }),
    closeProductEditor: () => set({
        isProductEditorOpen: false,
        editingProductId: null
    }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    resetFilters: () => set({ searchQuery: '', selectedCategory: null }),
}));
