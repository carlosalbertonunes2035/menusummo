
import { Recipe } from '../../types/recipe';
import { BaseRepository } from './BaseRepository';
import { query, collection, where, getDocs } from '@firebase/firestore';
import { db } from '../../lib/firebase/client';

export class RecipeRepository extends BaseRepository<Recipe> {
    constructor(isMockMode: boolean = false) {
        super('recipes', isMockMode);
    }

    async getByProductId(productId: string, tenantId: string): Promise<Recipe | null> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            return all.find((r: Recipe) => r.productId === productId) || null;
        }
        const q = query(
            collection(db, 'recipes'),
            where("tenantId", "==", tenantId),
            where("productId", "==", productId)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return querySnapshot.docs[0].data() as Recipe;
    }
}
