// Cart Types for Next.js Storefront
export type CheckoutStep = 'BAG' | 'IDENTITY' | 'FULFILLMENT' | 'PAYMENT';
export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type PaymentMethod = 'CASH' | 'CREDIT' | 'DEBIT' | 'PIX';

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    notes?: string;
    options?: CartItemOption[];
}

export interface CartItemOption {
    name: string;
    value: string;
    price?: number;
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    enabled: boolean;
}

export interface LoyaltySettings {
    enabled: boolean;
    pointsPerCurrency: number;
    cashbackValuePer100Points: number;
    branding?: {
        name?: string;
    };
}
