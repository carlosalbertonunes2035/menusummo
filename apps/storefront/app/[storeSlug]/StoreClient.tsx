'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product, Settings } from '@/lib/types';
import ProductFeedCard from '@/components/ProductFeedCard';
import { CategoryStories } from '@/components/CategoryStories';
import { ProductGridItem } from '@/components/ProductGridItem';
import { getProductChannel } from '@/lib/utils';

interface StoreClientProps {
    store: Settings & { id: string };
    products: Product[];
}

export function StoreClient({ store, products }: StoreClientProps) {
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [viewMode] = useState<'FEED' | 'GRID' | 'LIST'>('FEED');
    const [cartCount, setCartCount] = useState(0);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            const channel = getProductChannel(p, 'digital-menu');
            if (channel.isAvailable && (channel.category || p.category)) {
                cats.add(channel.category || p.category || 'Outros');
            }
        });
        return Array.from(cats);
    }, [products]);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        if (!activeCategory) return products;
        return products.filter(p => {
            const channel = getProductChannel(p, 'digital-menu');
            return channel.isAvailable && (channel.category || p.category) === activeCategory;
        });
    }, [products, activeCategory]);

    const handleAddToCart = (product: Product) => {
        console.log('Adding to cart:', product.name);
        setCartCount(prev => prev + 1);
        // TODO: Implement cart logic
    };

    const handleCategoryClick = (cat: string) => {
        setActiveCategory(cat === activeCategory ? '' : cat);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                            <img
                                src={store.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.brandName || 'Loja')}`}
                                alt={store.brandName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{store.brandName}</h1>
                            <p className="text-xs text-gray-500">🟢 Aberto • 30-45 min</p>
                        </div>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 relative">
                        <ShoppingCart size={20} />
                        Carrinho
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Category Stories */}
            {categories.length > 0 && (
                <CategoryStories
                    settings={store}
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                />
            )}

            {/* Products Feed */}
            <main className="max-w-7xl mx-auto py-4">
                {viewMode === 'FEED' && (
                    <div className="max-w-2xl mx-auto">
                        {filteredProducts.map((product) => (
                            <ProductFeedCard
                                key={product.id}
                                product={product}
                                settings={store}
                                onAdd={() => handleAddToCart(product)}
                            />
                        ))}
                    </div>
                )}

                {viewMode === 'GRID' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                        {filteredProducts.map((product) => (
                            <ProductGridItem
                                key={product.id}
                                product={product}
                                settings={store}
                                onAdd={() => handleAddToCart(product)}
                            />
                        ))}
                    </div>
                )}

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum produto disponível no momento</p>
                    </div>
                )}
            </main>
        </div>
    );
}
