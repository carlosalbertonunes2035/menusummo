
import { Product, Ingredient } from './product';
import { Order } from './order';
import { StockMovement } from './stock';
import { Recipe } from './recipe';
import { StoreSettings } from './settings';
import { Customer, SystemUser } from './user';

// Define strict collection names
export type CollectionName =
    | 'products'
    | 'orders'
    | 'ingredients'
    | 'recipes'
    | 'customers'
    | 'drivers'
    | 'stock_movements'
    | 'expenses'
    | 'coupons'
    | 'stories'
    | 'option_groups'
    | 'print_jobs'
    | 'daily_logs'
    | 'notifications'
    | 'shopping_list'
    | 'settings'
    | 'users'
    | 'system_users';

// Map collection names to their data types
// Using 'any' for types not yet fully verified to avoid immediate breakage, 
// but 'products', 'orders', etc should be strict.
export interface CollectionData {
    products: Product;
    orders: Order;
    ingredients: Ingredient;
    recipes: Recipe;
    customers: Customer | any; // Verify Customer type import
    drivers: any;
    stock_movements: any; // Verify StockMovement type import
    expenses: any;
    coupons: any;
    stories: any;
    option_groups: any;
    print_jobs: any;
    daily_logs: any;
    notifications: any;
    shopping_list: any;
    settings: StoreSettings;
    users: SystemUser;
    system_users: SystemUser;
}
