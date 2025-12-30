import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Product, StoreSettings } from '../../../../types';
import { getProductChannel } from '../../../../lib/utils';

interface UseMenuDataProps {
    products: Product[];
    settings: StoreSettings;
    searchTerm: string;
}

export function useMenuData({ products, settings, searchTerm }: UseMenuDataProps) {

    const checkAvailability = (p: Product) => {
        const channel = getProductChannel(p, 'digital-menu');
        if (!channel.isAvailable) return false;

        if (p.type === 'COMBO' && p.comboItems) {
            for (const item of p.comboItems) {
                const comp = products.find(cp => cp.id === item.productId);
                if (!comp) return false;
                const compChan = getProductChannel(comp, 'digital-menu');
                if (!compChan.isAvailable) return false;
            }
        }
        return true;
    };

    const promotionalProducts = useMemo(() => {
        return products.filter(p => {
            const channel = getProductChannel(p, 'digital-menu');
            return checkAvailability(p) && channel.promotionalPrice && channel.promotionalPrice < channel.price;
        }).sort((a, b) => {
            const chanA = getProductChannel(a, 'digital-menu');
            const chanB = getProductChannel(b, 'digital-menu');
            return (chanA.sortOrder || 99) - (chanB.sortOrder || 99);
        });
    }, [products]);

    const categories = useMemo(() => {
        const foundCategories = new Set<string>();
        products.forEach(p => {
            const channel = getProductChannel(p, 'digital-menu');
            if (checkAvailability(p)) {
                foundCategories.add((channel.category || p.category).trim());
            }
        });

        const settingsOrder = settings.interface?.categoryOrder || [];
        const orderedCats: string[] = [];

        if (promotionalProducts.length > 0) orderedCats.push('🔥 Promoções');

        settingsOrder.forEach((cat: string) => {
            if (foundCategories.has(cat)) {
                orderedCats.push(cat);
                foundCategories.delete(cat);
            }
        });

        Array.from(foundCategories).sort().forEach(cat => orderedCats.push(cat));
        return orderedCats;
    }, [products, promotionalProducts, settings.interface?.categoryOrder]);

    const sortedProducts = useMemo(() => {
        return products
            .filter(p => checkAvailability(p))
            .sort((a, b) => {
                const chanA = getProductChannel(a, 'digital-menu');
                const chanB = getProductChannel(b, 'digital-menu');
                return (chanA.sortOrder || 99) - (chanB.sortOrder || 99);
            });
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return sortedProducts;
        const fuse = new Fuse(sortedProducts, { keys: ['name', 'category', 'description'], threshold: 0.3 });
        return fuse.search(searchTerm).map(r => r.item);
    }, [sortedProducts, searchTerm]);

    return {
        promotionalProducts,
        categories,
        filteredProducts,
        checkAvailability
    };
}
