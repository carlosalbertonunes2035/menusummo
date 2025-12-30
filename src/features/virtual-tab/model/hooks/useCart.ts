import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product, Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTableSession } from './useTableSession';
import { OrderRepository } from '@/lib/repository/OrderRepository';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage the shopping cart for a table session
 */
export function useCart(tableId: string) {
    const { currentUser } = useAuth();
    const { session, addOrderToSession } = useTableSession(tableId);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const orderRepository = useMemo(() => new OrderRepository(), []);

    const addToCart = useCallback((product: Product, quantity: number = 1, options?: any) => {
        const price = product.channels?.find(c => c.name === 'digital-menu')?.price || 0;

        const newItem: CartItem = {
            id: uuidv4(),
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: price,
            total: price * quantity,
            options: options || {},
            addedAt: new Date(),
        };

        setCart(prev => [...prev, newItem]);
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCart(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, quantity, total: item.unitPrice * quantity }
                : item
        ));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    }, [cart]);

    /**
     * Submit order to kitchen (KDS) and add to session
     */
    const submitOrder = async () => {
        if (!currentUser?.tenantId || !session) {
            throw new Error('Sessão inválida');
        }

        if (cart.length === 0) {
            throw new Error('Carrinho vazio');
        }

        setIsSubmitting(true);
        try {
            const orderId = `order_${Date.now()}`;

            const orderData: Order = {
                id: orderId,
                tenantId: currentUser.tenantId,
                customerName: session.customerName,
                customerPhone: session.customerPhone,
                tableNumber: session.tableNumber,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total,
                    options: item.options,
                } as any)),
                subtotal: subtotal,
                total: subtotal, // Taxa de serviço é calculada no fechamento da sessão
                status: 'PENDING',
                type: 'DINE_IN',
                origin: 'DIGITAL',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            // 1. Create order in Firestore (will be visible in KDS)
            await orderRepository.create(orderData, currentUser.tenantId);

            // 2. Link order to table session
            await addOrderToSession(orderId, subtotal);

            // 3. Clear cart
            clearCart();

            return orderId;
        } catch (error) {
            console.error('Error submitting order:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        cart,
        subtotal,
        isSubmitting,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        submitOrder,
    };
}
