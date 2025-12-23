
import { StockMovement } from '../../types/stock';
import { BaseRepository } from './BaseRepository';
import { query, collection, where, getDocs, orderBy, limit } from '@firebase/firestore';
import { db } from '../../lib/firebase/client';

export class StockMovementRepository extends BaseRepository<StockMovement> {
    constructor(isMockMode: boolean = false) {
        super('stock_movements', isMockMode);
    }

    async getByIngredientId(ingredientId: string, tenantId: string): Promise<StockMovement[]> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all
                .filter((m: StockMovement) => m.ingredientId === ingredientId)
                .sort((a: StockMovement, b: StockMovement) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        const q = query(
            collection(db, 'stock_movements'),
            where("tenantId", "==", tenantId),
            where("ingredientId", "==", ingredientId),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as StockMovement);
    }

    async getRecentMovements(tenantId: string, limitCount: number = 20): Promise<StockMovement[]> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all
                .sort((a: StockMovement, b: StockMovement) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, limitCount);
        }

        const q = query(
            collection(db, 'stock_movements'),
            where("tenantId", "==", tenantId),
            orderBy("date", "desc"),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as StockMovement);
    }
}
