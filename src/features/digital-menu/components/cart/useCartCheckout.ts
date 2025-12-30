import { useState, useEffect, useMemo } from 'react';
import { DiscountType, OrderType, Product } from '@/types';
import { getProductChannel } from '@/lib/utils';
import { CartCheckoutProps, CheckoutStep } from './types';

export function useCartCheckout({
    isOpen,
    cart,
    settings,
    user,
    onUpdateUser,
    onOpenAddressModal,
    orderMode,
    setOrderMode,
    tableNumber,
    cartTotal,
    products = [],
    appliedCoupon,
    setAppliedCoupon,
    coupons,
    showToast,
    scheduledTime,
    setScheduledTime,
    onClose
}: CartCheckoutProps) {
    const [step, setStep] = useState<CheckoutStep>('BAG');
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
    const [isScheduling, setIsScheduling] = useState(false);
    const [identityName, setIdentityName] = useState(user?.name || '');
    const [identityPhone, setIdentityPhone] = useState(user?.phone || '');
    const [couponInput, setCouponInput] = useState('');
    const [redeemPoints, setRedeemPoints] = useState(false);

    const isDelivery = orderMode === OrderType.DELIVERY;
    const loyaltySettings = settings.loyalty;
    const userPoints = user?.loyaltyPoints || 0;

    useEffect(() => {
        if (isOpen) {
            setStep('BAG');
            setAnimationDirection('right');
            setIsScheduling(false);
            setIdentityName(user?.name || '');
            setIdentityPhone(user?.phone || '');
        }
    }, [isOpen, user?.name, user?.phone]);

    const deliveryFee = useMemo(() => {
        if (!isDelivery) return 0;
        if (settings.delivery?.freeShippingThreshold && cartTotal >= settings.delivery.freeShippingThreshold) return 0;
        return settings.delivery?.baseFee || 0;
    }, [isDelivery, cartTotal, settings.delivery]);

    const loyaltyDiscount = useMemo(() => {
        if (!redeemPoints || !loyaltySettings?.enabled) return 0;
        if (userPoints < (loyaltySettings.minRedemptionPoints || 0)) return 0;
        const potentialDiscount = (userPoints / 100) * (loyaltySettings.cashbackValuePer100Points || 0);
        return Math.min(potentialDiscount, cartTotal);
    }, [redeemPoints, loyaltySettings, userPoints, cartTotal]);

    const discountValue = useMemo(() => {
        let couponDiscount = 0;
        if (appliedCoupon) {
            if (cartTotal >= (appliedCoupon.minOrderValue || 0)) {
                couponDiscount = appliedCoupon.type === DiscountType.FIXED
                    ? appliedCoupon.value
                    : (cartTotal * appliedCoupon.value) / 100;
            }
        }
        return couponDiscount;
    }, [appliedCoupon, cartTotal]);

    const finalTotal = cart.length === 0 ? 0 : Math.max(0, cartTotal + deliveryFee - discountValue - loyaltyDiscount);

    const upsellItems = useMemo(() => {
        if (!products.length) return [];
        const cartIds = cart.map(c => c.product.id);
        return products
            .filter(p => !cartIds.includes(p.id))
            .filter(p => {
                const price = getProductChannel(p, 'digital-menu').price || 0;
                return price < 25 && price > 0;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
    }, [products, cart]);

    const generateTimeSlots = useMemo(() => {
        const slots: string[] = [];
        const now = new Date();
        const schedulingSettings = settings.orderModes?.scheduling || { enabled: false, minLeadTime: 30, intervalMin: 30 };
        const minLeadTime = schedulingSettings.minLeadTime || 30;
        const interval = schedulingSettings.intervalMin || 30;

        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const todayName = days[now.getDay()];
        const schedule = settings.schedule.find(s => s.day === todayName);

        if (!schedule || !schedule.isOpen) return [];

        const [closeHour, closeMin] = schedule.closeTime.split(':').map(Number);
        const closeTime = new Date(now);
        closeTime.setHours(closeHour, closeMin, 0, 0);

        if (closeTime < now && closeHour < 6) {
            closeTime.setDate(closeTime.getDate() + 1);
        }

        const startTime = new Date(now.getTime() + minLeadTime * 60000);
        const remainder = startTime.getMinutes() % interval;
        if (remainder !== 0) {
            startTime.setMinutes(startTime.getMinutes() + (interval - remainder));
        }
        startTime.setSeconds(0, 0);

        const currentSlot = startTime;
        const lastSlot = new Date(closeTime.getTime() - 30 * 60000);

        while (currentSlot <= lastSlot) {
            const hour = currentSlot.getHours().toString().padStart(2, '0');
            const min = currentSlot.getMinutes().toString().padStart(2, '0');
            slots.push(`${hour}:${min}`);
            currentSlot.setMinutes(currentSlot.getMinutes() + interval);
        }
        return slots;
    }, [settings.schedule, settings.orderModes]);

    const handleContinue = () => {
        setAnimationDirection('right');
        if (step === 'BAG') {
            if (!user.name || !user.phone) {
                setStep('IDENTITY');
            } else {
                setStep('FULFILLMENT');
            }
        }
        else if (step === 'IDENTITY') {
            if (!identityName || !identityPhone) {
                alert("Por favor, preencha seu nome e WhatsApp.");
                return;
            }
            if (onUpdateUser) {
                onUpdateUser({ name: identityName, phone: identityPhone });
            }
            setStep('FULFILLMENT');
        }
        else if (step === 'FULFILLMENT') {
            if (orderMode === OrderType.DELIVERY && !user.address) {
                onOpenAddressModal();
                return;
            }
            if (orderMode === OrderType.DINE_IN && !tableNumber) {
                alert("Informe o número da mesa.");
                return;
            }
            setStep('PAYMENT');
        }
    };

    const handleBack = () => {
        setAnimationDirection('left');
        if (step === 'PAYMENT') setStep('FULFILLMENT');
        else if (step === 'FULFILLMENT') setStep('BAG');
        else if (step === 'IDENTITY') setStep('BAG');
        else onClose();
    };

    const handleApplyCoupon = () => {
        if (!couponInput.trim()) return;
        const foundCoupon = coupons.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
        if (foundCoupon) {
            if (setAppliedCoupon) {
                setAppliedCoupon(foundCoupon);
                showToast(`Cupom "${foundCoupon.code}" aplicado!`, 'success');
            }
        } else {
            showToast('Cupom inválido ou expirado.', 'error');
        }
        setCouponInput('');
    };

    return {
        step, setStep,
        animationDirection,
        isScheduling, setIsScheduling,
        identityName, setIdentityName,
        identityPhone, setIdentityPhone,
        couponInput, setCouponInput,
        redeemPoints, setRedeemPoints,
        isDelivery,
        deliveryFee,
        loyaltyDiscount,
        discountValue,
        finalTotal,
        upsellItems,
        generateTimeSlots,
        handleContinue,
        handleBack,
        handleApplyCoupon
    };
}
