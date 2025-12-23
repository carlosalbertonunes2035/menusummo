
import { Order, OrderStatus } from '@/types';

export interface DashboardStats {
    revenue: number;
    profit: number;
    margin: number;
    orderCount: number;
    ticket: number;
    revenueChange: number;
    ordersLastHour: number;
    ordersSameHourYesterday: number;
}

export const calculateDashboardStats = (orders: Order[] | null | undefined): DashboardStats => {
    if (!orders || orders.length === 0) {
        return {
            revenue: 0, profit: 0, margin: 0,
            orderCount: 0, ticket: 0,
            revenueChange: 0,
            ordersLastHour: 0, ordersSameHourYesterday: 0
        };
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const oneHourAgo = new Date(now);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Same hour yesterday window
    const yesterdaySameHourStart = new Date(yesterdayStart);
    yesterdaySameHourStart.setHours(now.getHours() - 1);
    const yesterdaySameHourEnd = new Date(yesterdayStart);
    yesterdaySameHourEnd.setHours(now.getHours());

    // Filter Lists
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
    const yesterdayOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= yesterdayStart && d < todayStart;
    });

    // Metric 1: Orders Last Hour & Context
    const ordersLastHour = todayOrders.filter(o => new Date(o.createdAt) >= oneHourAgo).length;
    const ordersSameHourYesterday = yesterdayOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= yesterdaySameHourStart && d < yesterdaySameHourEnd;
    }).length;

    // Metric 2: Financials (Revenue, Cost, Profit)
    // We only count valid/completed orders usually, but the original logic counted ALL orders.
    // Keeping logic consistent with original for now, but strictly handling numbers.
    const revenue = todayOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const cost = todayOrders.reduce((acc, o) => acc + (Number(o.cost) || 0), 0);
    const profit = revenue - cost;

    // Avoid division by zero
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const orderCount = todayOrders.length;
    const ticket = orderCount > 0 ? revenue / orderCount : 0;

    // Metric 3: Change vs Yesterday
    const yesterdayRevenue = yesterdayOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    let revenueChange = 0;
    if (yesterdayRevenue > 0) {
        revenueChange = ((revenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    } else if (revenue > 0) {
        revenueChange = 100; // 100% growth if yesterday was 0 and today > 0
    }

    return {
        revenue,
        profit,
        margin,
        orderCount,
        ticket,
        revenueChange,
        ordersLastHour,
        ordersSameHourYesterday
    };
};
