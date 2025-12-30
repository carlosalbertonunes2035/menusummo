import React from 'react';
import { Package, X } from 'lucide-react';
import { Product, ChannelConfig } from '../../../../types';

interface ProductEditorHeaderProps {
    product: Product;
    editData: Partial<Product>;
    activeChannelData?: ChannelConfig;
    onClose: () => void;
    onChannelToggle: (checked: boolean) => void;
    children?: React.ReactNode;
}

export const ProductEditorHeader: React.FC<ProductEditorHeaderProps> = ({
    product,
    editData,
    activeChannelData,
    onClose,
    onChannelToggle,
    children
}) => {
    // Determine the image to show in the header icon
    const headerImage = activeChannelData?.image ||
        (product.channels?.find(c => c.channel === 'digital-menu')?.image) ||
        product.image;

    // Determine type label style
    const typeLabel = (editData.type || product.type) === 'COMBO' ? '🎁 COMBO' : 'SIMPLES';
    const typeLabelClass = (editData.type || product.type) === 'COMBO'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-summo-bg text-summo-primary';

    return (
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-summo-bg flex items-center justify-center text-summo-primary flex-shrink-0 relative overflow-hidden">
                    {headerImage ? (
                        <img src={headerImage} className="w-full h-full object-cover" alt="Product Icon" />
                    ) : (
                        <Package size={20} />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800 leading-none truncate">
                            {editData.name || product.name || "Novo Produto"}
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${typeLabelClass}`}>
                            {typeLabel}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                        {product.id ? "Editando Produto" : "Criando Novo Produto"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {children}
                {activeChannelData && (
                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition select-none ${activeChannelData.isAvailable ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${activeChannelData.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-bold uppercase ${activeChannelData.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                            {activeChannelData.isAvailable ? 'Ativo' : 'Pausado'}
                        </span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={activeChannelData.isAvailable || false}
                            onChange={(e) => onChannelToggle(e.target.checked)}
                        />
                    </label>
                )}
                <div className="h-8 w-px bg-gray-200"></div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};
