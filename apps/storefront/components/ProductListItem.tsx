'use client';

import React from 'react';
import { Percent, Plus } from 'lucide-react';
import { Product, Settings } from '@/lib/types';
import { getProductChannel, getProductImage } from '@/lib/utils';

interface ProductListItemProps {
    product: Product;
    settings: Settings;
    onAdd: () => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, settings, onAdd }) => {
    const channel = getProductChannel(product, 'digital-menu');
    const hasPromo = !!(channel.promotionalPrice && channel.promotionalPrice > 0 && channel.promotionalPrice < (channel.price || 0));
    const price = hasPromo ? channel.promotionalPrice : channel.price;
    const points = settings.loyalty?.enabled && settings.loyalty.pointsPerCurrency
        ? Math.floor((price || 0) * settings.loyalty.pointsPerCurrency)
        : 0;

    return (
        <div onClick={onAdd} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition hover:shadow-md h-[132px]">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl bg-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-110"
                />
                {hasPromo && <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg shadow-sm"><Percent size={10} className="inline mr-0.5" />OFF</div>}

                {points > 0 && (
                    <div className="absolute bottom-0 right-0 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg rounded-br-xl shadow-sm flex items-center gap-1">
                        💎 +{points}
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                <div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{channel.description}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                        {hasPromo && <span className="text-[10px] text-gray-400 line-through">R$ {channel.price?.toFixed(2)}</span>}
                        <span className="font-bold text-green-600 text-lg">R$ {(hasPromo ? channel.promotionalPrice : channel.price)?.toFixed(2)}</span>
                    </div>
                    <button className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/30 hover:scale-110 transition active:scale-95">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
