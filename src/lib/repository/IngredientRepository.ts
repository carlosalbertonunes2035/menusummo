
import { Ingredient } from '../../types/product';
import { BaseRepository } from './BaseRepository';

export class IngredientRepository extends BaseRepository<Ingredient> {
    constructor(isMockMode: boolean = false) {
        super('ingredients', isMockMode);
    }

    async getLowStock(tenantId: string): Promise<Ingredient[]> {
        const all = await this.getAll(tenantId);
        return all.filter(i => i.currentStock <= i.minStock);
    }
}
