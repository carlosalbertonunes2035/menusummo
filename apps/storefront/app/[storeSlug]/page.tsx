import { notFound } from 'next/navigation';
import { getStore, getProducts } from '@/lib/firebase-admin';
import { generateStoreMetadata } from '@/lib/seo';

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                            <img
                                src={store.logoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(store.brandName)}
                                alt={store.brandName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{store.brandName}</h1>
                            <p className="text-xs text-gray-500">🟢 Aberto • 30-45 min</p>
                        </div>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                        🛒 Carrinho
                    </button>
                </div>
            </header>

            {/* Products Feed */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Cardápio</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                            <div className="aspect-square bg-gray-100 relative">
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">
                                        R$ {product.price?.toFixed(2)}
                                    </span>
                                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition">
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum produto disponível no momento</p>
                    </div>
                )}
            </main>
        </div>
    );
}

// Revalidate every 5 minutes
export const revalidate = 300;
