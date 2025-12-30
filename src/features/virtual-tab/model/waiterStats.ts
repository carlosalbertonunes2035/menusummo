/**
 * Waiter Statistics - Tracks performance and gamification metrics
 */
export interface WaiterStats {
    id: string;                     // waiterId
    tenantId: string;
    name: string;

    // Today's Metrics
    today: WaiterDailyStats;

    // Monthly Metrics
    month: WaiterMonthlyStats;

    // Metadata
    lastUpdated: Date;
}

/**
 * Daily statistics for a waiter
 */
export interface WaiterDailyStats {
    date: Date;
    ordersClaimed: number;
    ordersDelivered: number;
    ordersExpired: number;          // Orders that expired before delivery
    averageResponseTime: number;    // In seconds
    totalPoints: number;
    rank: number;                   // Position in daily ranking
    deliveryRate: number;           // ordersDelivered / ordersClaimed
}

/**
 * Monthly statistics for a waiter
 */
export interface WaiterMonthlyStats {
    month: number;                  // 1-12
    year: number;
    ordersClaimed: number;
    ordersDelivered: number;
    averageResponseTime: number;
    totalPoints: number;
    bestDay: Date;
    bestDayPoints: number;
    achievementsUnlocked: string[]; // Achievement IDs
}

/**
 * Achievement/Badge
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: (stats: WaiterStats) => boolean;
    points: number;                 // Bonus points for unlocking
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
    rank: number;
    waiterId: string;
    waiterName: string;
    points: number;
    ordersClaimed: number;
    averageResponseTime: number;
    deliveryRate: number;
    badges: string[];               // Achievement IDs
}

/**
 * Predefined achievements
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
    SPEED_DEMON: {
        id: 'SPEED_DEMON',
        name: 'Demônio da Velocidade',
        description: 'Atendeu 10 pedidos em menos de 30 segundos',
        icon: '⚡',
        requirement: (stats) => {
            // This would need to be tracked separately
            return false; // Placeholder
        },
        points: 100
    },
    CENTURY: {
        id: 'CENTURY',
        name: 'Centurião',
        description: 'Atendeu 100 pedidos em um mês',
        icon: '💯',
        requirement: (stats) => stats.month.ordersClaimed >= 100,
        points: 500
    },
    PERFECT_DAY: {
        id: 'PERFECT_DAY',
        name: 'Dia Perfeito',
        description: '100% de pedidos entregues sem expiração',
        icon: '🌟',
        requirement: (stats) =>
            stats.today.ordersClaimed > 0 &&
            stats.today.deliveryRate === 1.0,
        points: 200
    },
    EARLY_BIRD: {
        id: 'EARLY_BIRD',
        name: 'Madrugador',
        description: 'Primeiro a coletar pedido do dia',
        icon: '🌅',
        requirement: () => false, // Tracked separately
        points: 50
    },
    MARATHON: {
        id: 'MARATHON',
        name: 'Maratonista',
        description: 'Atendeu 50 pedidos em um único dia',
        icon: '🏃',
        requirement: (stats) => stats.today.ordersClaimed >= 50,
        points: 300
    }
};
