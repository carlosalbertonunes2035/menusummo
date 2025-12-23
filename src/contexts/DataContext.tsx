
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useFirestoreCollection } from '@/lib/firebase/hooks';
import { Ingredient, Product, OptionGroupLibraryItem, Coupon, Recipe } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ProductSchema, IngredientSchema } from '@/lib/schemas';

/**
 * DataContext now loads ONLY essential collections that are needed globally.
 * Heavy collections (orders, customers, stockMovements, expenses) are loaded on-demand
 * via specific hooks (useOrders, useCustomers, useStockMovements).
 */
interface DataContextProps {
  isLoading: boolean;
  ingredients: Ingredient[];
  products: Product[];
  optionGroups: OptionGroupLibraryItem[];
  recipes: Recipe[];
  coupons: Coupon[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { systemUser } = useAuth();
  const tenantId = systemUser?.tenantId;

  // ✅ ESSENTIAL COLLECTIONS (Always loaded with caching)
  const { data: ingredients, loading: ingredientsLoading } = useFirestoreCollection<Ingredient>(
    'ingredients',
    tenantId,
    undefined,
    IngredientSchema,
    { enableCache: true, cacheTTL: 10 * 60 * 1000 } // 10 min cache
  );

  const { data: products, loading: productsLoading } = useFirestoreCollection<Product>(
    'products',
    tenantId,
    undefined,
    ProductSchema,
    { enableCache: true, cacheTTL: 5 * 60 * 1000 } // 5 min cache
  );

  const { data: optionGroups, loading: optionGroupsLoading } = useFirestoreCollection<OptionGroupLibraryItem>(
    'option_groups',
    tenantId,
    undefined,
    undefined,
    { enableCache: true, cacheTTL: 10 * 60 * 1000 }
  );

  const { data: recipes, loading: recipesLoading } = useFirestoreCollection<Recipe>(
    'recipes',
    tenantId,
    undefined,
    undefined,
    { enableCache: true, cacheTTL: 10 * 60 * 1000 }
  );

  const { data: coupons, loading: couponsLoading } = useFirestoreCollection<Coupon>(
    'coupons',
    tenantId,
    undefined,
    undefined,
    { enableCache: true, cacheTTL: 5 * 60 * 1000 }
  );

  const isLoading = ingredientsLoading || productsLoading || optionGroupsLoading || recipesLoading || couponsLoading;

  const value = useMemo(() => ({
    isLoading,
    ingredients,
    products,
    optionGroups,
    recipes,
    coupons
  }), [
    isLoading,
    ingredients,
    products,
    optionGroups,
    recipes,
    coupons
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
