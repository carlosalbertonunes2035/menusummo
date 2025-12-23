
import { Order } from '@/types';
import { OrderRepository } from '@/lib/repository/OrderRepository';
import { BaseService } from './BaseService';

export class OrderService extends BaseService<Order, OrderRepository> {
    constructor(isMockMode: boolean = false) {
        super(new OrderRepository(isMockMode));
    }

    async getRecentOrders(tenantId: string, limit: number = 20): Promise<Order[]> {
        return this.repository.getRecent(tenantId, limit);
    }

    async getOrdersByStatus(tenantId: string, status: string): Promise<Order[]> {
        return this.repository.getByStatus(tenantId, status);
    }
}

export const orderService = (isMockMode: boolean = false) => new OrderService(isMockMode);
