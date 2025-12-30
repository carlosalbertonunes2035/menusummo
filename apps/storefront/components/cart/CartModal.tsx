'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { CartHeader } from './CartHeader';
import { BagStep } from './BagStep';
import { IdentityStep } from './IdentityStep';
import { FulfillmentStep } from './FulfillmentStep';
import { PaymentStep } from './PaymentStep';
import { useCartCheckout } from './useCartCheckout';
import { CartItem } from '@/lib/cart-types';
import { Settings, Product } from '@/lib/types';

export interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    updateCartItem: (index: number, delta: number) => void;
    settings: Settings & { id: string };
    user: any;
    onOpenAddressModal: () => void;
    onSendOrder: () => void;
    isSending: boolean;
    orderMode: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
    setOrderMode: (mode: 'DELIVERY' | 'PICKUP' | 'DINE_IN') => void;
    scheduledTime: string;
    setScheduledTime: (time: string) => void;
    tableNumber: string;
    setTableNumber: (table: string) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    changeFor: string;
    setChangeFor: (value: string) => void;
    cartTotal: number;
    products: Product[];
    onAddUpsellItem: (product: Product) => void;
    onClearCart: () => void;
    onUpdateUser: (user: any) => void;
    appliedCoupon: any;
    setAppliedCoupon: (coupon: any) => void;
    coupons: any[];
    showToast: (message: string, type: 'success' | 'error') => void;
}

export function CartModal(props: CartModalProps) {
    const {
        isOpen, onClose, cart, isSending, onClearCart,
        settings,
    } = props;

    const {
        step,
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
    } = useCartCheckout(props);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col h-full animate-slide-in-right">
            <CartHeader
                onBack={handleBack}
                onClear={() => { onClearCart(); onClose(); }}
                step={step}
                showClear={step === 'BAG'}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                {step === 'BAG' && (
                    <BagStep
                        {...props}
                        animationDirection={animationDirection}
                        upsellItems={upsellItems}
                        loyaltySettings={settings.loyalty}
                        userPoints={0}
                        redeemPoints={redeemPoints}
                        setRedeemPoints={setRedeemPoints}
                        couponInput={couponInput}
                        setCouponInput={setCouponInput}
                        handleApplyCoupon={handleApplyCoupon}
                        discountValue={discountValue}
                        loyaltyDiscount={loyaltyDiscount}
                        deliveryFee={deliveryFee}
                        isDelivery={isDelivery}
                        finalTotal={finalTotal}
                    />
                )}

                {step === 'IDENTITY' && (
                    <IdentityStep
                        animationDirection={animationDirection}
                        identityName={identityName}
                        setIdentityName={setIdentityName}
                        identityPhone={identityPhone}
                        setIdentityPhone={setIdentityPhone}
                    />
                )}

                {step === 'FULFILLMENT' && (
                    <FulfillmentStep
                        animationDirection={animationDirection}
                        orderMode={props.orderMode}
                        setOrderMode={props.setOrderMode}
                        user={props.user}
                        onOpenAddressModal={props.onOpenAddressModal}
                        settings={settings}
                        isScheduling={isScheduling}
                        setIsScheduling={setIsScheduling}
                        scheduledTime={props.scheduledTime}
                        setScheduledTime={props.setScheduledTime}
                        generateTimeSlots={generateTimeSlots}
                    />
                )}

                {step === 'PAYMENT' && (
                    <PaymentStep
                        paymentMethod={props.paymentMethod}
                        setPaymentMethod={props.setPaymentMethod}
                        changeFor={props.changeFor}
                        setChangeFor={props.setChangeFor}
                        cartTotal={props.cartTotal}
                        deliveryFee={deliveryFee}
                        discountValue={discountValue}
                        loyaltyDiscount={loyaltyDiscount}
                        finalTotal={finalTotal}
                        isDelivery={isDelivery}
                    />
                )}
            </div>

            {/* Continue Button */}
            <div className="p-4 bg-white border-t border-gray-200">
                <button
                    onClick={handleContinue}
                    disabled={isSending}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Enviando...
                        </>
                    ) : (
                        step === 'PAYMENT' ? 'Finalizar Pedido' : 'Continuar'
                    )}
                </button>
            </div>
        </div>
    );
}
