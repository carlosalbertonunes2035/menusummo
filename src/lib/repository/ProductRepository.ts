
import { Product } from '@/types';
import { BaseRepository } from './BaseRepository';
import { query, collection, where, getDocs } from '@firebase/firestore';
import { db } from '@/lib/firebase/client';

export class ProductRepository extends BaseRepository<Product> {
    constructor(isMockMode: boolean = false) {
        super('products', isMockMode);
    }

    async getByCategory(tenantId: string, category: string): Promise<Product[]> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all.filter(p => p.category === category);
        }
        const q = query(
            collection(db, 'products'),
            where("tenantId", "==", tenantId),
            where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Product);
    }
}
