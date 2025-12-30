'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product, Settings } from '@/lib/types';
import { CartProvider, useCart } from '@/lib/cart-context';
import ProductFeedCard from '@/components/ProductFeedCard';
import { CategoryStories } from '@/components/CategoryStories';
import { ProductGridItem } from '@/components/ProductGridItem';
import { ProductListItem } from '@/components/ProductListItem';
import { BannerSlider } from '@/components/BannerSlider';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { getProductChannel } from '@/lib/utils';

function StoreContent({ store, products }: { store: Settings & { id: string }, products: Product[] }) {
    const { addToCart, cartTotal, cartCount } = useCart();
    const [activeCategory, setActiveCategory] = useState('');
    const [viewMode] = useState<'FEED' | 'GRID' | 'LIST'>('FEED');

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
        const channel = getProductChannel(product, 'digital-menu');
        const price = channel.promotionalPrice || channel.price || product.price;

        addToCart({
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            name: channel.displayName || product.name,
            price: price,
            image: channel.image || product.image,
        });
    };

    const handleCategoryClick = (cat: string) => {
        setActiveCategory(cat === activeCategory ? '' : cat);
    };

    // Get banners
    const banners = store.digitalMenu?.branding?.promoBanners?.filter(b => b.enabled && b.imageUrl) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Minimalista */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                <img
                                    src={store.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.brandName || 'Loja')}`}
                                    alt={store.brandName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-base truncate">{store.brandName}</h1>
                                <p className="text-[10px] text-gray-500">🟢 Aberto • 30-45 min</p>
                            </div>
                        </div>

                        <button
                            className="relative bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-orange-700 transition"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">Carrinho</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Banners */}
            {banners.length > 0 && (
                <BannerSlider
                    banners={banners}
                    rotationSeconds={store.digitalMenu?.branding?.bannerRotationSeconds || 4}
                />
            )}

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
            <main className="max-w-7xl mx-auto pb-24">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-4">
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

                {viewMode === 'LIST' && (
                    <div className="space-y-3 px-4 py-4">
                        {filteredProducts.map((product) => (
                            <ProductListItem
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

            {/* Floating Cart Bar */}
            <FloatingCartBar
                cartCount={cartCount}
                cartTotal={cartTotal}
                onClick={() => alert('Cart modal em desenvolvimento!')}
            />
        </div>
    );
}

export function StoreClient({ store, products }: { store: Settings & { id: string }, products: Product[] }) {
    return (
        <CartProvider>
            <StoreContent store={store} products={products} />
        </CartProvider>
    );
}
