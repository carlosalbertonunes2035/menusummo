
import { Order } from '../../types';
import { BaseRepository } from './BaseRepository';
import { query, collection, where, getDocs, orderBy, limit } from '@firebase/firestore';
import { db } from '../../lib/firebase/client';

export class OrderRepository extends BaseRepository<Order> {
    constructor(isMockMode: boolean = false) {
        super('orders', isMockMode);
    }

    async getRecent(tenantId: string, maxItems: number = 20): Promise<Order[]> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all.slice(0, maxItems);
        }
        const q = query(
            collection(db, 'orders'),
            where('tenantId', '==', tenantId),
            orderBy('createdAt', 'desc'),
            limit(maxItems)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Order);
    }

    async getByStatus(tenantId: string, status: string): Promise<Order[]> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all.filter(o => o.status === status);
        }
        const q = query(
            collection(db, 'orders'),
            where('tenantId', '==', tenantId),
            where('status', '==', status)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Order);
    }
}
