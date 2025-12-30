/**
 * Order Claim - Represents a waiter claiming an order for delivery
 */
export interface OrderClaim {
    id: string;
    orderId: string;
    tableSessionId: string;

    // Waiter Info
    waiterId: string;
    waiterName: string;
    claimedAt: Date;

    // Status
    status: 'CLAIMED' | 'DELIVERING' | 'DELIVERED' | 'EXPIRED';
    deliveredAt?: Date;
    expiresAt: Date;                // 5 minutes after claim

    // Items to deliver
    items: OrderClaimItem[];

    // Gamification
    points: number;                 // Based on speed and order value
    responseTime: number;           // Seconds between order creation and claim

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Individual item in an order claim
 */
export interface OrderClaimItem {
    productId: string;
    productName: string;
    quantity: number;
    category: string;               // To separate drinks from food
    priority: 'HIGH' | 'NORMAL';    // Drinks = HIGH priority
    delivered: boolean;
    deliveredAt?: Date;
}

/**
 * Order Claim Status
 */
export type OrderClaimStatus = 'CLAIMED' | 'DELIVERING' | 'DELIVERED' | 'EXPIRED';

/**
 * Item Priority
 */
export type ItemPriority = 'HIGH' | 'NORMAL';
