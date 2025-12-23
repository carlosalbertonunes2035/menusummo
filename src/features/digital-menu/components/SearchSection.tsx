import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import { getProductChannel } from '../../../lib/utils';
import { Product } from '../../../types';

interface SearchSectionProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredProducts: Product[];
    handleProductCta: (product: Product) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
    searchTerm, setSearchTerm, filteredProducts, handleProductCta
}) => {
    return (
        <section className="py-4 min-h-full">
            <div className="mx-4 bg-summo-surface p-3 rounded-xl flex items-center gap-2 mb-6 sticky top-0 z-10 border border-summo-border shadow-sm">
                <Search className="text-gray-400" size={20} />
                <input
                    className="bg-transparent outline-none flex-1 font-medium text-summo-text"
                    placeholder="Buscar delícias..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
                {searchTerm && <button onClick={() => setSearchTerm('')}><X size={16} className="text-gray-400" /></button>}
            </div>
            <div className="grid grid-cols-2 gap-4 px-4 pb-20">
                {filteredProducts.map(p => {
                    const channel = getProductChannel(p, 'digital-menu');
                    return (
                        <div key={p.id} className="bg-summo-surface rounded-xl overflow-hidden shadow-sm border border-summo-border" onClick={() => handleProductCta(p)}>
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                                {channel.image && <img src={channel.image} className="w-full h-full object-cover" alt={p.name} />}
                                <button className="absolute bottom-2 right-2 bg-summo-surface p-1.5 rounded-full shadow-md border border-summo-border">
                                    <Plus size={16} className="text-summo-primary" />
                                </button>
                            </div>
                            <div className="p-2">
                                <p className="font-bold text-sm truncate text-summo-text">{p.name}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 font-bold">R$ {(channel.promotionalPrice || channel.price || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
