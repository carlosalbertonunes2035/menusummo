
export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED'
}

export interface Coupon {
    id: string;
    tenantId?: string;
    code: string;
    type: DiscountType;
    value: number; // Percentage or Fixed Amount
    minOrderValue?: number;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    expiresAt?: Date;
    createdAt: Date;
    // Analytics
    totalRevenueGenerated?: number; // Total sales from orders using this coupon
    totalDiscountGiven?: number; // Total discount amount given
}
