import { useState, useMemo } from 'react';
import { Product } from '@/types';
import { usePublicData } from '@/contexts/PublicDataContext';
import { getProductChannel } from '@/lib/utils';

interface UseProductsOptions {
    tenantId: string;
    context: 'delivery' | 'dine-in';
    searchTerm?: string;
}

export function useProducts({ tenantId, context, searchTerm = '' }: UseProductsOptions) {
    const { products: allProducts } = usePublicData();

    // Filter by channel and availability
    const products = useMemo(() => {
        const channel = context === 'delivery' ? 'digital-menu' : 'pos';

        return allProducts.filter(p => {
            const productChannel = getProductChannel(p, channel);
            return productChannel.isAvailable ?? true;
        });
    }, [allProducts, context]);

    // Filter by search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;

        const term = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    // Get categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return Array.from(cats).sort();
    }, [products]);

    // Get promotional products
    const promotionalProducts = useMemo(() => {
        const channel = context === 'delivery' ? 'digital-menu' : 'pos';

        return products.filter(p => {
            const productChannel = getProductChannel(p, channel);
            return productChannel.promotionalPrice &&
                productChannel.promotionalPrice > 0 &&
                productChannel.promotionalPrice < (productChannel.price || 0);
        });
    }, [products, context]);

    return {
        products: filteredProducts,
        allProducts: products,
        categories,
        promotionalProducts,
    };
}
