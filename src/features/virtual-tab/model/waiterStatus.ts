/**
 * Waiter Status - Tracks waiter availability and performance
 */
export interface WaiterStatus {
    id: string;                     // waiterId
    tenantId: string;
    name: string;

    // Availability
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    activeTables: string[];         // IDs of tables opened by this waiter

    // Location (optional)
    currentLocation?: 'SALAO' | 'BALCAO' | 'COZINHA' | 'BAR';

    // Today's Statistics
    today: WaiterDailyStats;

    // Monthly Statistics
    month: WaiterMonthlyStats;

    // Timestamps
    lastActivity: Date;
    shiftStart: Date;
    shiftEnd?: Date;
}

/**
 * Daily statistics for a waiter
 */
export interface WaiterDailyStats {
    date: Date;
    tablesOpened: number;
    ordersDelivered: number;
    assistanceProvided: number;     // Number of waiter requests handled
    averageResponseTime: number;    // In seconds
    totalPoints: number;
    rank: number;                   // Position in daily ranking
}

/**
 * Monthly statistics for a waiter
 */
export interface WaiterMonthlyStats {
    month: number;                  // 1-12
    year: number;
    tablesOpened: number;
    ordersDelivered: number;
    averageResponseTime: number;
    totalPoints: number;
    bestDay: Date;
    bestDayPoints: number;
    achievementsUnlocked: string[]; // Achievement IDs
}

/**
 * Gamification Settings - Configurable per tenant
 */
export interface GamificationSettings {
    enabled: boolean;
    pointsForSpeed: boolean;        // Points for fast response
    pointsForVolume: boolean;       // Points for order volume
    pointsForSatisfaction: boolean; // Points for customer ratings

    rewards: {
        type: 'RANKING_ONLY' | 'MONETARY' | 'BENEFITS';
        monthlyBonus?: number;        // Bonus for top 3
        benefits?: string[];          // Ex: "Extra day off", "Gift card"
    };
}

/**
 * Waiter Availability Status
 */
export type WaiterAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

/**
 * Waiter Action for points calculation
 */
export interface WaiterAction {
    type: 'OPEN_TABLE' | 'TAKE_ORDER' | 'DELIVER_ORDER' | 'CLOSE_TABLE' | 'ASSIST_CUSTOMER';
    responseTime?: number;          // Seconds
    orderTotal?: number;            // R$
    customerRating?: number;        // 1-5
}
