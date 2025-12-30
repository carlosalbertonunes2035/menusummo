

export enum StockMovementType {
    IN = 'IN',
    OUT = 'OUT',
    ADJUST = 'ADJUST',
    WASTE = 'WASTE',
    LOSS = 'LOSS',
    SALE = 'SALE'
}

export interface StockMovement {
    id: string;
    ingredientId: string;
    ingredientName?: string;
    type: StockMovementType;
    quantity: number;
    cost: number;
    date: Date;
    reason?: string;
    userId: string;
    // Enhanced tracking
    batchId?: string;
    expirationDate?: Date;
    supplierId?: string;
    documentNumber?: string; // Invoice number
}

export interface ShoppingListItem {
    id: string;
    ingredientId?: string;
    name: string;
    quantity: number;
    unit: string;
    isPurchased: boolean;
    checked?: boolean;
}
