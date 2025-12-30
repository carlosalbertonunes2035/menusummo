import { CartItem, Coupon, OrderType, Product, StoreSettings } from '@/types';

export type CheckoutStep = 'BAG' | 'IDENTITY' | 'FULFILLMENT' | 'PAYMENT';

export interface CartCheckoutState {
    step: CheckoutStep;
    animationDirection: 'left' | 'right';
    isScheduling: boolean;
    identityName: string;
    identityPhone: string;
    couponInput: string;
    redeemPoints: boolean;
}

export interface CartCheckoutProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    updateCartItem: (index: number, delta: number) => void;
    settings: StoreSettings;
    user: any;
    onUpdateUser?: (u: Partial<{ name: string; phone: string }>) => void;
    onOpenAddressModal: () => void;
    onSendOrder: (loyaltyDiscount?: number, loyaltyPointsUsed?: number) => void;
    isSending: boolean;
    orderMode: OrderType;
    setOrderMode: (mode: OrderType) => void;
    scheduledTime: string;
    setScheduledTime: (time: string) => void;
    tableNumber: string;
    setTableNumber: (num: string) => void;
    paymentMethod: string | null;
    setPaymentMethod: (method: string) => void;
    changeFor: string;
    setChangeFor: (val: string) => void;
    cartTotal: number;
    products?: Product[];
    onAddUpsellItem?: (p: Product) => void;
    onClearCart: () => void;
    appliedCoupon?: Coupon | null;
    setAppliedCoupon?: (c: Coupon | null) => void;
    coupons: Coupon[];
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}
