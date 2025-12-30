import { useState, useEffect, useMemo } from 'react';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/contexts/ToastContext';
import { StoreSettings, OrderType, OrderStatus, PaymentMethod, PaymentTransaction, CartItem, Coupon } from '../../../../types';
import { getProductChannel } from '../../../../lib/utils';

interface UseCheckoutFlowProps {
    settings: StoreSettings;
    user: any;
    userLocation: { lat: number, lng: number } | null;
    orderMode: OrderType;
    cart: CartItem[];
    cartTotal: number;
    calcDeliveryBtnEnabled: boolean;
    appliedCoupon: Coupon | null;
    isClosed: boolean;
    paymentMethod: string;
    changeFor: string;
    tableNumber: string;
    setActiveOrderId: (id: string) => void;
    setCart: (cart: CartItem[]) => void;
    setAppliedCoupon: (coupon: Coupon | null) => void;
    setIsCartOpen: (open: boolean) => void;
    setActiveTab: (tab: string) => void;
}

export function useCheckoutFlow({
    settings, user, userLocation, orderMode, cart, cartTotal,
    appliedCoupon, isClosed,
    paymentMethod, changeFor, tableNumber, setActiveOrderId,
    setCart, setAppliedCoupon, setIsCartOpen, setActiveTab
}: UseCheckoutFlowProps) {
    const { placeOrder } = useCheckout();
    const { showToast } = useToast();
    const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(settings.delivery?.baseFee || 0);
    const [isSending, setIsSending] = useState(false);

    const calculateShippingFeeFn = httpsCallable(functions, 'calculateShippingFee');

    useEffect(() => {
        if (orderMode === OrderType.DELIVERY && user.address && userLocation) {
            const storeLoc = settings.company?.location;
            const originCoord = storeLoc ? `${storeLoc.lat},${storeLoc.lng}` : '';
            const userCoords = `${userLocation.lat},${userLocation.lng}`;
            const validOrigin = originCoord;
            const validDest = userCoords;

            calculateShippingFeeFn({ origin: validOrigin, destination: validDest, settings }).then(({ data }: any) => {
                if (data && typeof data.fee === 'number') setCalculatedDeliveryFee(data.fee);
            });
        }
    }, [orderMode, user.address, userLocation, settings]);

    const sendOrder = async (loyaltyDiscountInput: number = 0, loyaltyPointsUsedInput: number = 0, scheduledTime: string = '') => {
        if (isClosed) { showToast("Estamos fechados no momento!", 'error'); return; }
        if (!user.name || !user.phone) {
            showToast("Preencha seu nome no Perfil.", 'error');
            setActiveTab('profile');
            setIsCartOpen(false);
            return;
        }
        if (!paymentMethod) { showToast("Escolha uma forma de pagamento.", 'error'); return; }
        if (orderMode === OrderType.DELIVERY && !user.address) { showToast("Endereço de entrega é obrigatório.", 'error'); return; }

        setIsSending(true);
        try {
            let scheduledDate: Date | undefined = undefined;
            if (scheduledTime) {
                const now = new Date();
                const [hours, minutes] = scheduledTime.split(':').map(Number);
                scheduledDate = new Date(now);
                scheduledDate.setHours(hours, minutes, 0, 0);
                if (scheduledDate < now) scheduledDate.setDate(scheduledDate.getDate() + 1);
            }

            let discountValue = 0;
            if (appliedCoupon) {
                const minOrder = appliedCoupon.minOrderValue || 0;
                if (cartTotal >= minOrder) {
                    discountValue = appliedCoupon.type === 'FIXED' ? appliedCoupon.value : cartTotal * (appliedCoupon.value / 100);
                }
            }

            const deliveryFee = (orderMode === OrderType.DELIVERY && cartTotal < (settings.delivery?.freeShippingThreshold || 0)) ? calculatedDeliveryFee : 0;
            const finalTotal = Math.max(0, cartTotal - discountValue - loyaltyDiscountInput) + deliveryFee;

            const orderPayments: PaymentTransaction[] = [];
            if (paymentMethod) {
                let methodEnum: PaymentMethod;
                switch (paymentMethod) {
                    case 'Pix': methodEnum = PaymentMethod.PIX; break;
                    case 'Cartão': methodEnum = PaymentMethod.CREDIT_CARD; break;
                    case 'Dinheiro': methodEnum = PaymentMethod.CASH; break;
                    default: methodEnum = PaymentMethod.CASH;
                }
                orderPayments.push({ id: Date.now().toString(), description: 'Online Order', method: methodEnum, amount: finalTotal, timestamp: new Date() });
            }

            const changeAmount = (paymentMethod === 'Dinheiro' && changeFor && parseFloat(changeFor) > finalTotal)
                ? parseFloat(changeFor) - finalTotal
                : undefined;

            const orderPayload = {
                customerName: user.name, customerPhone: user.phone,
                items: cart.map(i => {
                    const channel = getProductChannel(i.product, 'digital-menu');
                    const basePrice = channel.promotionalPrice || channel.price || 0;
                    const optionsPrice = i.selectedOptions ? i.selectedOptions.reduce((acc, opt) => acc + opt.price, 0) : 0;
                    return { productId: i.product.id, productName: i.product.name, quantity: i.quantity, basePrice: channel.price || 0, price: basePrice + optionsPrice, notes: i.notes, isTakeout: orderMode !== OrderType.DINE_IN, channel: 'digital-menu' as const, selectedOptions: i.selectedOptions };
                }),
                total: finalTotal,
                cost: 0,
                status: OrderStatus.PENDING,
                type: orderMode,
                origin: 'DIGITAL' as const,
                payments: orderPayments,
                deliveryAddress: orderMode === OrderType.DELIVERY ? user.address : undefined,
                location: orderMode === OrderType.DELIVERY ? (userLocation || undefined) : undefined,
                ...(scheduledDate ? { scheduledTo: scheduledDate } : {}),
                ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
                ...(discountValue > 0 ? { discountTotal: discountValue } : {}),
                ...(loyaltyDiscountInput > 0 ? { loyaltyDiscount: loyaltyDiscountInput } : {}),
                ...(loyaltyPointsUsedInput > 0 ? { loyaltyPointsUsed: loyaltyPointsUsedInput } : {}),
                ...(changeAmount !== undefined ? { change: changeAmount } : {}),
                ...(orderMode === OrderType.DINE_IN && tableNumber ? { tableNumber } : {})
            };

            const orderId = await placeOrder(orderPayload);
            if (orderId) localStorage.setItem('summo_has_ordered_before', 'true');
            setActiveOrderId(orderId);
            setCart([]);
            setAppliedCoupon(null);
            setIsCartOpen(false);
        } catch (error) {
            console.error("Order error", error);
            showToast("Erro ao enviar pedido.", "error");
        } finally {
            setIsSending(false);
        }
    };

    return {
        calculatedDeliveryFee,
        isSending,
        sendOrder
    };
}
