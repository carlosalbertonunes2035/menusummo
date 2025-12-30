import { notFound } from 'next/navigation';
import { getStore, getProducts } from '@/lib/firebase-admin';
import { generateStoreMetadata } from '@/lib/seo';
import { StoreClient } from './StoreClient';

export async function generateMetadata({ params }: { params: { storeSlug: string } }) {
    const store = await getStore(params.storeSlug);

    if (!store) {
        return {};
    }

    return generateStoreMetadata(store);
}

export default async function StorePage({ params }: { params: { storeSlug: string } }) {
    const store = await getStore(params.storeSlug);

    if (!store) {
        notFound();
    }

    const products = await getProducts(store.id);

    // Pass server data to client component
    return <StoreClient store={store} products={products} />;
}

// Revalidate every 5 minutes
export const revalidate = 300;
