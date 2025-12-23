export interface RecipeIngredient {
    ingredientId: string;
    name?: string; // Denormalized for display
    quantity: number;
    unit: string;
    cost?: number; // Calculated cost based on current ingredient price
}

export interface RecipeStep {
    order: number;
    description: string;
    timeInMinutes?: number;
}

export interface Recipe {
    id: string;
    productId: string; // Link to the product this recipe creates
    name: string;
    description?: string;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    yield: number; // How much this recipe produces
    yieldUnit: string; // e.g. 'portions', 'kg', 'liters'
    preparationTime?: number; // Total time in minutes
    totalCost?: number; // Calculated total cost
    tenantId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
