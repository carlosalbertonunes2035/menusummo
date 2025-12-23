import React from 'react';
import { Percent } from 'lucide-react';
import PromoBanners from './PromoBanners';
import CouponBanner from './CouponBanner';
import ProductListItem from './ProductListItem';
import ProductGridItem from './ProductGridItem';
import SocialMediaCard from './SocialMediaCard';
import { Product } from '../../../types';
import { getProductChannel } from '../../../lib/utils';

interface ProductSectionProps {
    settings: any;
    visibleCoupons: any[];
    handleCouponSelect: (coupon: any) => void;
    categories: string[];
    promotionalProducts: Product[];
    products: Product[];
    viewMode: 'GRID' | 'LIST' | 'FEED';
    handleProductCta: (product: Product) => void;
    setCommentProduct: (product: Product) => void;
    categoryRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    settings, visibleCoupons, handleCouponSelect, categories, promotionalProducts, products, viewMode, handleProductCta, setCommentProduct, categoryRefs
}) => {
    return (
        <section className="pt-4 pb-20 px-0">
            {settings.digitalMenu?.branding?.promoBanners && (
                <PromoBanners
                    banners={settings.digitalMenu.branding.promoBanners}
                    rotationSeconds={settings.digitalMenu.branding.bannerRotationSeconds || 5}
                    fullWidth={true}
                />
            )}

            <CouponBanner coupons={visibleCoupons} onSelect={handleCouponSelect} />

            <div className="max-w-7xl mx-auto md:px-6">
                {categories.map(cat => {
                    const isPromo = cat === '🔥 Promoções';
                    const categoryProducts = isPromo ? promotionalProducts : products.filter(p => {
                        const channel = getProductChannel(p, 'digital-menu');
                        // Respect override and trim for matching
                        const prodCat = (channel.category || p.category).trim();
                        return channel.isAvailable && prodCat === cat;
                    });
                    if (categoryProducts.length === 0) return null;
                    return (
                        <div key={cat} ref={el => { categoryRefs.current[cat] = el; }} id={`cat-${cat}`} className="mb-8 scroll-mt-48">
                            <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 px-4 md:px-0 transition-colors duration-300">
                                <h3 className={`text-xl font-bold ${isPromo ? 'text-red-600 dark:text-red-400 flex items-center gap-2' : 'text-summo-text'}`}>
                                    {settings?.digitalMenu?.categories?.[cat]?.displayName || cat} {isPromo && <Percent size={20} />}
                                </h3>
                            </div>
                            {(() => {
                                const layout = settings.digitalMenu?.layout || 'FEED';

                                if (layout === 'LIST' || viewMode === 'LIST') {
                                    return (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4 md:px-0">
                                            {categoryProducts.map(product => <ProductListItem key={product.id} product={product} onAdd={() => handleProductCta(product)} />)}
                                        </div>
                                    );
                                }

                                if (layout === 'GRID' || viewMode === 'GRID') {
                                    return (
                                        <div className="relative px-4 md:px-0">
                                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth">
                                                {categoryProducts.map(product => (
                                                    <div key={product.id} className="flex-shrink-0 w-[180px] md:w-[220px] snap-start">
                                                        <ProductGridItem product={product} onAdd={() => handleProductCta(product)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-0 md:px-0">
                                        {categoryProducts.map(product => (
                                            <SocialMediaCard
                                                key={product.id}
                                                product={product}
                                                onAdd={() => handleProductCta(product)}
                                                onOpenComments={() => setCommentProduct(product)}
                                            />
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>
            <div className="py-10 text-center text-gray-400 text-xs"><p>Fim do cardápio 🍽️</p></div>
        </section>
    );
};
