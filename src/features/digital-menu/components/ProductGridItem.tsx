import React from 'react';
import { Product } from '@/types';
import { Plus, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { getProductChannel } from '@/lib/utils';
import { getProductImage } from '../utils/imageMapper';
import { usePublicData } from '@/contexts/PublicDataContext';

interface ProductGridItemProps {
    product: Product;
    onAdd: () => void;
}

const ProductGridItem: React.FC<ProductGridItemProps> = ({ product, onAdd }) => {
    const { settings } = usePublicData();
    const channel = getProductChannel(product, 'digital-menu');
    const hasPromo = channel.promotionalPrice && channel.promotionalPrice > 0 && channel.promotionalPrice < (channel.price || 0);
    const displayPrice = hasPromo ? channel.promotionalPrice : (channel.price || 0);
    const oldPrice = channel.price || 0;

    const points = settings.loyalty?.enabled && settings.loyalty.pointsPerCurrency
        ? Math.floor((displayPrice || 0) * settings.loyalty.pointsPerCurrency)
        : 0;

    return (
        <div
            onClick={onAdd}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {hasPromo && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                        OFERTA
                    </div>
                )}

                {points > 0 && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        💎 +{points}
                    </div>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="absolute bottom-2 right-2 bg-summo-primary text-white p-2 rounded-full shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
            </div>

            {/* Info Container */}
            <div className="p-3 flex flex-col flex-1">
                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">{product.name}</h4>
                <div className="mt-auto">
                    {hasPromo && (
                        <span className="text-[10px] text-gray-400 line-through block">
                            R$ {oldPrice.toFixed(2)}
                        </span>
                    )}
                    <span className="text-sm font-black text-summo-primary">
                        R$ {displayPrice?.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductGridItem;
