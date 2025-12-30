import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { CartModalProps } from './cart/types';
import { useCartCheckout } from './cart/useCartCheckout';
import { CartHeader } from './cart/CartHeader';
import { BagStep } from './cart/BagStep';
import { IdentityStep } from './cart/IdentityStep';
import { FulfillmentStep } from './cart/FulfillmentStep';
import { PaymentStep } from './cart/PaymentStep';

const CartModal: React.FC<CartModalProps> = (props) => {
    const {
        isOpen, onClose, cart, isSending, onSendOrder, onClearCart,
        loyaltySettings, userPoints, settings,
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
                        {...{
                            animationDirection, upsellItems, loyaltySettings,
                            userPoints, redeemPoints, setRedeemPoints,
                            couponInput, setCouponInput, handleApplyCoupon,
                            discountValue, loyaltyDiscount, deliveryFee,
                            isDelivery, finalTotal
                        }}
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

            <div className="p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.08)] z-20">
                {step !== 'PAYMENT' ? (
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                            <span className="text-xl font-bold text-gray-900 leading-none">R$ {finalTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleContinue}
                            disabled={cart.length === 0}
                            className="bg-summo-primary text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-summo-dark transition shadow-lg shadow-summo-primary/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continuar <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            const valuePer100 = settings.loyalty?.cashbackValuePer100Points || 1;
                            const pointsUsed = loyaltyDiscount > 0 ? Math.ceil((loyaltyDiscount * 100) / valuePer100) : 0;
                            onSendOrder(loyaltyDiscount, pointsUsed);
                        }}
                        disabled={isSending}
                        className="w-full py-4 bg-summo-primary text-white rounded-xl font-bold text-lg hover:bg-summo-dark transition shadow-lg shadow-summo-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                    >
                        {isSending ? <Loader2 className="animate-spin" /> : 'Fazer Pedido'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CartModal;
