import { Metadata } from 'next';

interface Product {
    name: string;
    description?: string;
    price: number;
    image?: string;
    slug: string;
}

interface Store {
    brandName: string;
    slug: string;
    logoUrl?: string;
}

export function generateProductMetadata(
    product: Product,
    store: Store
): Metadata {
    const title = `${product.name} - R$ ${product.price.toFixed(2)} | ${store.brandName}`;
    const description = product.description || `Peça ${product.name} agora no ${store.brandName}!`;
    const url = `https://summo.app/${store.slug}/${product.slug}`;
    const imageUrl = product.image || store.logoUrl || 'https://summo.app/og-default.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: store.brandName,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: url,
        },
    };
}

export function generateStoreMetadata(store: Store): Metadata {
    const title = `${store.brandName} - Cardápio Digital`;
    const description = `Peça delivery ou retirada no ${store.brandName}. Cardápio completo, preços atualizados e entrega rápida!`;
    const url = `https://summo.app/${store.slug}`;
    const imageUrl = store.logoUrl || 'https://summo.app/og-default.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: store.brandName,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: store.brandName,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: url,
        },
    };
}

// Generate JSON-LD structured data
export function generateProductJsonLd(product: Product, store: Store) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: store.brandName,
            },
        },
    };
}
