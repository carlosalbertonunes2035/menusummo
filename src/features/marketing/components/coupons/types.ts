// Coupon Types
export interface Coupon {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue: number;
    usageLimit: number;
    isActive: boolean;
    createdAt: Date;
    usageCount: number;
}

export interface CouponFormData {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue: number;
    usageLimit: number;
}

export interface CouponAnalytics {
    count: number;
    revenue: number;
    discount: number;
}
