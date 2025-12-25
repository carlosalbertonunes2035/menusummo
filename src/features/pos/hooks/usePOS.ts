
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, OrderItem, OrderType, PaymentMethod, PaymentTransaction, SalesChannel } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useApp } from '@/contexts/AppContext';

export const usePOS = () => {
    const { products, ingredients } = useData();
    const { showToast, settings } = useApp();

    // PERSISTENCE: Initialize state from localStorage
    const [cart, setCart] = useState<OrderItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('summo_pos_cart_internal');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [orderType, setOrderType] = useState<OrderType>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('summo_pos_type_internal') as OrderType) || OrderType.DELIVERY;
        }
        return OrderType.DELIVERY;
    });

    const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('summo_pos_payments_internal');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [address, setAddress] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('summo_pos_address_internal') || '';
        return '';
    });

    const [calculatedFee, setCalculatedFee] = useState<number>(5.00);

    // PERSISTENCE: Save state changes to localStorage
    useEffect(() => { localStorage.setItem('summo_pos_cart_internal', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('summo_pos_type_internal', orderType); }, [orderType]);
    useEffect(() => { localStorage.setItem('summo_pos_payments_internal', JSON.stringify(payments)); }, [payments]);
    useEffect(() => { localStorage.setItem('summo_pos_address_internal', address); }, [address]);

    const checkStock = useCallback((productToAdd: Product, quantityToAdd: number) => {
        const usageMap = new Map<string, number>();

        const addUsage = (prodId: string, qty: number) => {
            const prod = products.find(p => p.id === prodId);
            if (prod) {
                prod.ingredients.forEach(ing => {
                    const current = usageMap.get(ing.ingredientId) || 0;
                    usageMap.set(ing.ingredientId, current + (ing.amount * qty));
                });
            }
        };

        cart.forEach((item) => addUsage(item.productId, item.quantity));
        addUsage(productToAdd.id, quantityToAdd);

        for (const [ingId, totalRequired] of usageMap.entries()) {
            const inventoryItem = ingredients.find(i => i.id === ingId);
            if (!inventoryItem) {
                showToast(`Erro: Ingrediente ${ingId} não cadastrado.`, 'error');
                return false;
            }
            if (inventoryItem.isActive === false) {
                showToast(`Item indisponível: ${inventoryItem.name} pausado.`, 'error');
                return false;
            }
            if (inventoryItem.currentStock < (totalRequired - 0.0001)) {
                showToast(`Estoque insuficiente: ${inventoryItem.name}.`, 'error');
                return false;
            }
        }
        return true;
    }, [cart, products, ingredients, showToast]);

    const addToCart = useCallback((product: Product, quantity: number = 1, notes: string = '') => {
        // Check if merging with an existing simple item is possible
        if (!notes) {
            const existingIdx = cart.findIndex(i => i.productId === product.id && !i.notes && !i.selectedOptions);
            if (existingIdx >= 0) {
                const newQty = cart[existingIdx].quantity + quantity;
                const productToCheck = products.find(p => p.id === product.id);
                if (productToCheck && checkStock(productToCheck, newQty)) {
                    setCart(prev => {
                        const copy = [...prev];
                        copy[existingIdx].quantity = newQty;
                        return copy;
                    });
                    return true;
                }
                return false;
            }
        }

        // If not merging or if it has notes, check stock for a new item entry
        if (!checkStock(product, quantity)) return false;

        const isPackagingRequired = orderType === OrderType.DELIVERY || orderType === OrderType.TAKEOUT;

        setCart(prev => {
            const channelConfig = product.channels.find(c => c.channel === 'pos') || product.channels[0];
            return [...prev, {
                productId: product.id,
                productName: channelConfig?.displayName || product.name,
                price: channelConfig?.promotionalPrice || channelConfig?.price || 0,
                basePrice: channelConfig?.price || 0,
                channel: 'pos' as SalesChannel,
                quantity,
                notes,
                isTakeout: isPackagingRequired
            }];
        });
        return true;
    }, [checkStock, orderType, cart, products]);

    const updateCartItem = useCallback((index: number, delta: number) => {
        setCart(prev => {
            const item = prev[index];
            const newQty = item.quantity + delta;

            if (newQty <= 0) return prev.filter((_, i) => i !== index);

            const product = products.find(p => p.id === item.productId);
            if (product && !checkStock(product, newQty)) {
                // checkStock already handles the full cart context + new total quantity
                return prev;
            }

            const copy = [...prev];
            copy[index].quantity = newQty;
            return copy;
        });
    }, [checkStock, products]);

    const removeCartItem = useCallback((index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    }, []);

    const toggleItemTakeout = useCallback((index: number) => {
        setCart(prev => {
            const copy = [...prev];
            copy[index].isTakeout = !copy[index].isTakeout;
            return copy;
        });
    }, []);

    const addPayment = useCallback((method: PaymentMethod, amount: number) => {
        if (amount <= 0) return;
        setPayments(prev => [...prev, { id: Date.now().toString(), method, amount, description: 'Payment', timestamp: new Date() }]);
    }, []);

    const removePayment = useCallback((index: number) => {
        setPayments(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearPOS = useCallback(() => {
        setCart([]);
        setPayments([]);
        setAddress('');
        setCalculatedFee(0);
        setOrderType(OrderType.DINE_IN);
        // Clear persistence explicitly if needed, but setState triggers effect which handles it
    }, []);

    const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

    const deliveryFee = useMemo(() => {
        if (orderType !== OrderType.DELIVERY) return 0;
        if (settings?.delivery && cartTotal >= settings.delivery.freeShippingThreshold) return 0;
        return calculatedFee;
    }, [orderType, cartTotal, settings, calculatedFee]);

    const grandTotal = cartTotal + deliveryFee;
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const remainingDue = Math.max(0, grandTotal - totalPaid);
    const changeDue = Math.max(0, totalPaid - grandTotal);

    return {
        cart, addToCart, updateCartItem, removeCartItem, toggleItemTakeout,
        orderType, setOrderType, payments, addPayment, removePayment,
        address, setAddress, calculatedFee, setCalculatedFee,
        cartTotal, deliveryFee, grandTotal, totalPaid, remainingDue, changeDue,
        clearPOS, checkStock
    };
};
