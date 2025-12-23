import { RecipeRepository } from '../lib/repository/RecipeRepository';
import { ProductRepository } from '../lib/repository/ProductRepository';
import { Recipe } from '../types/recipe';

export class RecipeService {
    private recipeRepo: RecipeRepository;
    private productRepo: ProductRepository;

    constructor() {
        this.recipeRepo = new RecipeRepository();
        this.productRepo = new ProductRepository();
    }

    async createRecipe(recipe: Recipe, tenantId: string): Promise<string> {
        // Validate inputs
        if (!recipe.productId || !recipe.ingredients.length) {
            throw new Error("Recipe must have a product and at least one ingredient");
        }

        // Save recipe
        const recipeId = await this.recipeRepo.create(recipe, tenantId);

        // Link product to recipe
        await this.productRepo.update(recipe.productId, { recipeId }, tenantId);

        return recipeId;
    }

    async getRecipeForProduct(productId: string, tenantId: string): Promise<Recipe | null> {
        return this.recipeRepo.getByProductId(productId, tenantId);
    }

    async updateRecipe(id: string, updates: Partial<Recipe>, tenantId: string): Promise<void> {
        await this.recipeRepo.update(id, updates, tenantId);
    }
}

export const recipeService = new RecipeService();
