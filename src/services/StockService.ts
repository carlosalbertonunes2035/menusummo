
import { Ingredient } from '@/types/product';
import { IngredientRepository } from '@/lib/repository/IngredientRepository';
import { StockMovementRepository } from '@/lib/repository/StockMovementRepository';
import { RecipeRepository } from '@/lib/repository/RecipeRepository';
import { ProductRepository } from '@/lib/repository/ProductRepository';
import { StockMovementType } from '@/types/stock';
import { Order } from '@/types/order';
import { BaseService } from './BaseService';
import { logger } from '@/lib/logger';

export class StockService extends BaseService<Ingredient, IngredientRepository> {
    private stockMovementRepo: StockMovementRepository;
    private recipeRepo: RecipeRepository;
    private productRepo: ProductRepository;

    constructor(isMockMode: boolean = false) {
        super(new IngredientRepository(isMockMode));
        this.stockMovementRepo = new StockMovementRepository(isMockMode);
        this.recipeRepo = new RecipeRepository(isMockMode);
        this.productRepo = new ProductRepository(isMockMode);
    }

    async deductStockForOrder(order: Order, userId: string, tenantId: string): Promise<void> {
        if (!order.items || order.items.length === 0) return;

        for (const item of order.items) {
            const product = await this.productRepo.getById(item.productId, tenantId);
            if (!product || !product.ingredients || product.ingredients.length === 0) {
                logger.warn(`[StockService] Sem ingredientes/receita para o produto: ${item.productId}`);
                continue;
            }

            for (const component of product.ingredients) {
                const totalQuantity = component.amount * item.quantity;
                await this.reduceStock(component.ingredientId, totalQuantity, `Pedido #${order.id}`, userId, tenantId);
            }
        }
    }

    async reduceStock(id: string, quantity: number, reason: string, userId: string, tenantId: string): Promise<void> {
        const ingredient = await this.repository.getById(id, tenantId);

        if (ingredient) {
            await this.stockMovementRepo.create({
                id: crypto.randomUUID(),
                ingredientId: id,
                ingredientName: ingredient.name,
                type: StockMovementType.SALE,
                quantity: quantity,
                cost: (ingredient.costPerUnit || ingredient.cost || 0) * quantity,
                date: new Date(),
                reason,
                userId
            }, tenantId);

            await this.repository.update(id, {
                currentStock: ingredient.currentStock - quantity,
            }, tenantId);

            return;
        }

        const recipe = await this.recipeRepo.getById(id, tenantId);
        if (recipe) {
            const factor = quantity / (recipe.yield || 1);
            for (const item of recipe.ingredients) {
                const subQuantity = item.quantity * factor;
                await this.reduceStock(item.ingredientId, subQuantity, `${reason} (Via Receita: ${recipe.name})`, userId, tenantId);
            }
            return;
        }

        logger.error(`Reduction failed: ID ${id} not found in ingredients or recipes.`);
    }

    async getLowStockAlerts(tenantId: string) {
        return this.repository.getLowStock(tenantId);
    }

    async calculateProductCost(productId: string, tenantId: string): Promise<number> {
        const recipe = await this.recipeRepo.getByProductId(productId, tenantId);
        if (!recipe) return 0;

        let totalCost = 0;
        for (const item of recipe.ingredients) {
            const ingredient = await this.repository.getById(item.ingredientId, tenantId);
            if (ingredient) {
                const unitCost = ingredient.costPerUnit || ingredient.cost;
                totalCost += unitCost * item.quantity;
            }
        }
        return totalCost;
    }
}

export const stockService = (isMockMode: boolean = false) => new StockService(isMockMode);
