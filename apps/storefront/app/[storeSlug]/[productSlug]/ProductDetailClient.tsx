'use client';

import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product, Settings } from '@/lib/types';
import { getProductChannel, getProductImage } from '@/lib/utils';

interface ProductDetailClientProps {
    product: Product;
    store: Settings & { id: string };
}

export function ProductDetailClient({ product, store }: ProductDetailClientProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);

    const channelConfig = getProductChannel(product, 'digital-menu');
    const displayName = channelConfig.displayName || product.name;
    const description = channelConfig.description || product.description;
    const price = channelConfig.price || 0;
    const promotionalPrice = channelConfig.promotionalPrice;

    const hasPromo = promotionalPrice && promotionalPrice > 0 && promotionalPrice < price;
    const currentPrice = hasPromo ? promotionalPrice : price;
    const total = currentPrice * quantity;

    const handleAddToCart = () => {
        console.log('Adding to cart:', { product: displayName, quantity, total });
        // TODO: Implement cart logic
        alert(`${quantity}x ${displayName} adicionado ao carrinho!`);
    };

    const handleShare = async () => {
        const shareData = {
            title: displayName,
            text: `Confira ${displayName} por R$ ${currentPrice.toFixed(2)}!`,
            url: window.location.href
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("Link copiado!");
            }
        } catch (err) {
            console.log("Share failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Voltar</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`transition ${isLiked ? 'text-red-500' : 'text-gray-700'}`}
                        >
                            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button onClick={handleShare} className="text-gray-700">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Product Content */}
            <main className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 p-6">
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                        <img
                            src={getProductImage(product)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                        {hasPromo && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                                {Math.round(((price - promotionalPrice) / price) * 100)}% OFF
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                            <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

                            {/* Price */}
                            <div className="mb-8">
                                {hasPromo && (
                                    <span className="text-lg text-gray-400 line-through block mb-1">
                                        R$ {price.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-4xl font-bold text-green-600">
                                    R$ {currentPrice.toFixed(2)}
                                </span>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Quantidade
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 md:relative md:border-0 md:mx-0 md:px-0">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3 shadow-lg"
                            >
                                <ShoppingCart size={24} />
                                Adicionar • R$ {total.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
