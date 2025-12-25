import React, { useEffect, useMemo } from 'react';
import { Product } from '../../../types';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicData } from '../../../contexts/PublicDataContext';
import ProductDetailView from './ProductDetailView';
import { ChevronLeft, Loader2 } from 'lucide-react';

const ProductPage: React.FC = () => {
    const { slugProduto, slugLoja } = useParams<{ slugProduto: string; slugLoja: string }>();
    const navigate = useNavigate();
    const { products, optionGroups, settings, tenantId } = usePublicData();

    // Find product by slug or ID
    const product = useMemo(() => {
        if (!products || !slugProduto) return null;
        const found = products.find((p: Product) => p.slug === slugProduto || p.id === slugProduto);

        // Security/Consistency Check: Ensure product belongs to the requested store
        // Use resolved tenantId from context, not the slugLoja from URL
        if (found && found.tenantId && tenantId && found.tenantId !== tenantId) {
            console.warn(`Product ${slugProduto} belongs to ${found.tenantId}, not ${tenantId}`);
            return null;
        }
        return found;
    }, [products, slugProduto, tenantId]);

    // SEO Info
    const seoTitle = product?.seoTitle || product?.name || 'Produto';
    const seoDescription = product?.seoDescription || product?.description || `Confira ${product?.name} em nosso cardápio.`;
    const seoKeywords = product?.keywords?.join(', ') || 'delivery, comida';

    // Strict separation: Use ONLY digital-menu image.
    // Note: getProductChannel needs to be imported if not already, but ProductPage likely doesn't import it yet? 
    // Wait, let's check imports in ProductPage.tsx (viewed in step 175). 
    // It imports Product, useParams, etc. NOT getProductChannel. 
    // I need to add import first? Or inline the channel find?
    // Inline find with strict logic is safer if I can't easily add import in replace_file (multi-replace is better for imports).
    // Actually, getProductChannel logic is complex with empty return. 
    // Better to use single replace for content and check if I need to add import.
    // ProductPage uses `product.channels[0]` directly in lines 33, 47, 50.
    // I should probably switch to getProductChannel for all of them or replicate logic.
    // Replicating strict logic:
    const digitalChannel = product?.channels.find(c => c.channel === 'digital-menu');
    const productImage = digitalChannel?.image;

    // Schema.org Structured Data
    const jsonLd = product ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": productImage ? [productImage] : [],
        "description": seoDescription,
        "sku": product.id,
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "BRL",
            "price": product.channels[0]?.price || 0,
            // eslint-disable-next-line react-hooks/purity
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ~30 days
            "availability": product.channels[0]?.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Restaurant",
                "name": settings.brandName
            }
        }
    } : null;

    if (!products.length) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-summo-primary" /></div>;
    }

    if (!product) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h1>
                <p className="text-gray-500 mb-6">O produto que você procura não está disponível ou foi removido.</p>
                <button onClick={() => navigate(`/loja/${slugLoja}`)} className="bg-summo-primary text-white px-6 py-3 rounded-xl font-bold">
                    Ver Cardápio Completo
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        // Redirect to digital menu to perform order
        navigate(`/loja/${slugLoja}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <Helmet>
                <title>{seoTitle} | {settings.brandName}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={seoKeywords} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                {productImage && <meta property="og:image" content={productImage} />}
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>

            <div className="w-full max-w-lg bg-white shadow-xl min-h-screen flex flex-col relative">
                <ProductDetailView
                    product={product}
                    onAddToCart={handleAddToCart}
                    onClose={() => navigate(`/loja/${slugLoja}`)}
                />
            </div>
        </div>
    );
};

export default ProductPage;
