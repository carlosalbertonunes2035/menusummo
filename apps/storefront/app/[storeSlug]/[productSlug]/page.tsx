import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getStore, getProduct, getProducts } from '@/lib/firebase-admin';
import { generateProductMetadata, generateProductJsonLd } from '@/lib/seo';
import { ProductDetailClient } from './ProductDetailClient';

export async function generateStaticParams() {
    // Generate static pages for all products at build time
    // For now, return empty array - will be generated on-demand with ISR
    return [];
}

export async function generateMetadata({
    params
}: {
    params: { storeSlug: string; productSlug: string }
}) {
    const store = await getStore(params.storeSlug);
    if (!store) return {};

    const product = await getProduct(store.id, params.productSlug);
    if (!product) return {};

    return generateProductMetadata(product, store);
}

export default async function ProductPage({
    params
}: {
    params: { storeSlug: string; productSlug: string }
}) {
    const store = await getStore(params.storeSlug);
    if (!store) notFound();

    const product = await getProduct(store.id, params.productSlug);
    if (!product) notFound();

    const jsonLd = generateProductJsonLd(product, store);

    return (
        <>
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Client component for interactivity */}
            <ProductDetailClient product={product} store={store} />
        </>
    );
}

// Revalidate every 1 hour (ISR)
export const revalidate = 3600;
