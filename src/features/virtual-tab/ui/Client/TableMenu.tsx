import React, { useState } from 'react';
import { TableSession } from '../../model/types';
import { ProductCard } from '@/features/shared-menu/components/ProductCard';
import { useProducts } from '@/features/shared-menu/hooks/useProducts';
import { useCart } from '@/features/shared-menu/hooks/useCart';
import { usePublicData } from '@/contexts/PublicDataContext';
import { Search, User, Phone } from 'lucide-react';
import { TableActions } from './TableActions';
import { TableCart } from './TableCart';

interface TableMenuProps {
    session: TableSession;
}

export function TableMenu({ session }: TableMenuProps) {
    const { settings, tenantId } = usePublicData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const { products, categories } = useProducts({
        tenantId: tenantId || '',
        context: 'dine-in',
        searchTerm,
    });

    const { cart, addToCart, cartTotal, cartCount } = useCart();

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sticky top-0 z-50 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-2xl font-bold">Mesa {session.tableNumber}</h1>
                            <div className="flex items-center gap-4 text-sm opacity-90 mt-1">
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {session.customerName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {session.customerPhone}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-90">Total</div>
                            <div className="text-2xl font-bold">
                                R$ {session.totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-b sticky top-[140px] z-40">
                <div className="max-w-4xl mx-auto overflow-x-auto">
                    <div className="flex gap-2 p-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-4xl mx-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-24">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAdd={() => setSelectedProduct(product)}
                            context="dine-in"
                        />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">Nenhum produto encontrado</p>
                        <p className="text-sm mt-2">Tente buscar por outro termo</p>
                    </div>
                )}
            </div>

            {/* Table Actions (Fixed Bottom) */}
            <TableActions session={session} />

            {/* Cart Summary (Fixed Bottom Right) */}
            {cartCount > 0 && (
                <div className="fixed bottom-24 right-4 z-50">
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-orange-600 transition-colors">
                        <span className="font-bold">{cartCount} itens</span>
                        <span>•</span>
                        <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Product Detail Modal (if needed) */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
                        <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                        <div className="text-2xl font-bold text-orange-600 mb-6">
                            R$ {selectedProduct.channels[0]?.price.toFixed(2)}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    addToCart(selectedProduct);
                                    setSelectedProduct(null);
                                }}
                                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
