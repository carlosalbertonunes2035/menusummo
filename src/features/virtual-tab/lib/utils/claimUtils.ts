import { OrderClaimItem } from '../types';

/**
 * Calculate points for an order claim based on response time and order value
 */
export function calculatePoints(responseTime: number, orderTotal: number): number {
    // Base: 10 points per order
    let points = 10;

    // Speed bonus
    if (responseTime < 30) {        // < 30 seconds
        points += 20;                 // Very fast!
    } else if (responseTime < 60) { // < 1 minute
        points += 10;                 // Fast
    } else if (responseTime < 120) {// < 2 minutes
        points += 5;                  // Normal
    }

    // Order value bonus (1 point per R$ 10)
    points += Math.floor(orderTotal / 10);

    return points;
}

/**
 * Determine item priority based on category
 */
export function getItemPriority(category: string): 'HIGH' | 'NORMAL' {
    const highPriorityCategories = [
        'bebida',
        'bebidas',
        'drinks',
        'cerveja',
        'vinho',
        'coquetel',
    ];

    return highPriorityCategories.includes(category.toLowerCase())
        ? 'HIGH'
        : 'NORMAL';
}

/**
 * Check if order has high priority items (drinks)
 */
export function hasHighPriorityItems(items: OrderClaimItem[]): boolean {
    return items.some(item => item.priority === 'HIGH');
}

/**
 * Sort items by priority (drinks first)
 */
export function sortItemsByPriority(items: OrderClaimItem[]): OrderClaimItem[] {
    return [...items].sort((a, b) => {
        if (a.priority === 'HIGH' && b.priority === 'NORMAL') return -1;
        if (a.priority === 'NORMAL' && b.priority === 'HIGH') return 1;
        return 0;
    });
}

/**
 * Format response time for display
 */
export function formatResponseTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get expiration time (5 minutes from claim)
 */
export function getExpirationTime(claimedAt: Date): Date {
    const expiration = new Date(claimedAt);
    expiration.setMinutes(expiration.getMinutes() + 5);
    return expiration;
}

/**
 * Check if claim has expired
 */
export function isClaimExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}
