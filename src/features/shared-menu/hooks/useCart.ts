import { useState, useMemo, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((product: Product, quantity: number = 1, options?: any) => {
        const newItem: CartItem = {
            id: uuidv4(),
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.channels[0]?.price || 0,
            total: (product.channels[0]?.price || 0) * quantity,
            options: options || {},
            addedAt: new Date(),
        };

        setCart(prev => [...prev, newItem]);
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
        setCart(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, ...updates, total: (updates.unitPrice || item.unitPrice) * (updates.quantity || item.quantity) }
                : item
        ));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        cartTotal,
        cartCount,
    };
}
