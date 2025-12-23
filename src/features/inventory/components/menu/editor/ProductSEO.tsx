import React from 'react';
import { Product } from '@/types';
import { Globe, Search } from 'lucide-react';

interface ProductSEOProps {
    product: Product;
    editData: Partial<Product>;
    onUpdate: (field: keyof Product, value: any) => void;
    slugError: string | null;
}

export const ProductSEO: React.FC<ProductSEOProps> = ({
    product,
    editData,
    onUpdate,
    slugError
}) => {
    const currentSlug = editData.slug ?? product.slug ?? '';
    const seoTitle = editData.seoTitle ?? product.seoTitle ?? '';
    const seoDescription = editData.seoDescription ?? product.seoDescription ?? '';
    const keywords = editData.keywords ?? product.keywords ?? [];

    return (
        <div className="space-y-4">
            {/* Slug */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                    <Globe size={12} />
                    URL Amigável (Slug)
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">
                        /produto/
                    </span>
                    <input
                        type="text"
                        value={currentSlug}
                        readOnly
                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-600 cursor-not-allowed"
                        placeholder="gerado-automaticamente"
                    />
                </div>
                {slugError && (
                    <p className="text-xs text-red-500 font-bold mt-1">
                        ⚠️ {slugError}
                    </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                    Gerado automaticamente a partir do nome do produto
                </p>
            </div>

            {/* SEO Title */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                    <Search size={12} />
                    Título SEO (Meta Title)
                </label>
                <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => onUpdate('seoTitle', e.target.value)}
                    maxLength={60}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm font-bold"
                    placeholder="Se vazio, usará o nome do produto"
                />
                <div className="flex justify-between mt-1">
                    <p className="text-[10px] text-gray-400">
                        Otimizado para Google (máx. 60 caracteres)
                    </p>
                    <p className={`text-[10px] font-bold ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                        {seoTitle.length}/60
                    </p>
                </div>
            </div>

            {/* SEO Description */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Descrição SEO (Meta Description)
                </label>
                <textarea
                    value={seoDescription}
                    onChange={(e) => onUpdate('seoDescription', e.target.value)}
                    maxLength={160}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm resize-none h-20"
                    placeholder="Descrição que aparece nos resultados do Google (máx. 160 caracteres)"
                />
                <div className="flex justify-between mt-1">
                    <p className="text-[10px] text-gray-400">
                        Resumo para mecanismos de busca
                    </p>
                    <p className={`text-[10px] font-bold ${seoDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {seoDescription.length}/160
                    </p>
                </div>
            </div>

            {/* Keywords */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Palavras-chave (Keywords)
                </label>
                <input
                    type="text"
                    value={keywords.join(', ')}
                    onChange={(e) => {
                        const kw = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                        onUpdate('keywords', kw);
                    }}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm"
                    placeholder="pizza, margherita, queijo, tomate (separadas por vírgula)"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                    Palavras-chave relacionadas ao produto, separadas por vírgula
                </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                    Preview Google
                </p>
                <div className="space-y-1">
                    <p className="text-blue-600 text-sm font-bold hover:underline cursor-pointer">
                        {seoTitle || product.name || 'Nome do Produto'}
                    </p>
                    <p className="text-[10px] text-green-700 font-mono">
                        seusite.com/produto/{currentSlug || 'produto'}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {seoDescription || product.description || 'Descrição do produto aparecerá aqui...'}
                    </p>
                </div>
            </div>
        </div>
    );
};
