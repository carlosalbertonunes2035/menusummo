import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types';

export interface ComboItem {
    productId: string;
    quantity: number;
    name?: string; // Denormalized for display
    unitCost?: number; // Denormalized for display
    overridePrice?: number; // Optional override for analytics
}

interface ComboStats {
    totalCost: number;
    itemCount: number;
    averageCostPerItem: number;
}

export const useComboBuilder = (
    initialItems: ComboItem[] = [],
    products: Product[]
) => {
    const [items, setItems] = useState<ComboItem[]>(initialItems);

    // Real-time cost aggregation
    const comboStats = useMemo<ComboStats>(() => {
        const totalCost = items.reduce((acc, item) => {
            const childProduct = products.find(p => p.id === item.productId);
            const productCost = childProduct?.cost || childProduct?.realCost || 0;
            return acc + productCost * item.quantity;
        }, 0);

        const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
        const averageCostPerItem = itemCount > 0 ? totalCost / itemCount : 0;

        return { totalCost, itemCount, averageCostPerItem };
    }, [items, products]);

    // Calculate margin given a selling price
    const calculateMargin = useCallback((sellingPrice: number): number => {
        if (sellingPrice <= 0 || comboStats.totalCost <= 0) return 0;
        return ((sellingPrice - comboStats.totalCost) / sellingPrice) * 100;
    }, [comboStats.totalCost]);

    // Calculate discount (how much cheaper than buying separately)
    const calculateDiscount = useCallback((sellingPrice: number): number => {
        const sumOfIndividualPrices = items.reduce((acc, item) => {
            const childProduct = products.find(p => p.id === item.productId);
            const individualPrice = childProduct?.price ||
                childProduct?.channels?.find(c => c.channel === 'pos')?.price ||
                0;
            return acc + individualPrice * item.quantity;
        }, 0);

        return sumOfIndividualPrices - sellingPrice;
    }, [items, products]);

    const addItem = useCallback((productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.warn(`[useComboBuilder] Product ${productId} not found`);
            return;
        }

        // Check if already exists
        const existingIndex = items.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
            // Increment quantity instead of duplicating
            setItems(prev => prev.map((item, i) =>
                i === existingIndex
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setItems(prev => [
                ...prev,
                {
                    productId,
                    quantity: 1,
                    name: product.name,
                    unitCost: product.cost || product.realCost || 0,
                }
            ]);
        }
    }, [products, items]);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateQuantity = useCallback((index: number, quantity: number) => {
        if (quantity < 1) {
            removeItem(index);
            return;
        }

        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, quantity } : item
        ));
    }, [removeItem]);

    const clearAll = useCallback(() => {
        setItems([]);
    }, []);

    // Validation
    const isValid = useMemo(() => {
        return items.length > 0 && items.every(item => item.quantity > 0);
    }, [items]);

    return {
        items,
        comboStats,
        calculateMargin,
        calculateDiscount,
        addItem,
        removeItem,
        updateQuantity,
        clearAll,
        isValid,
    };
};
