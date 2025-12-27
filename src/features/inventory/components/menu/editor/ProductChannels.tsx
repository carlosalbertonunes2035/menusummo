import React from 'react';
import { Product, ChannelConfig, SalesChannel } from '@/types';
import { Globe, Monitor, ShoppingCart, Wand2, Loader2, Play, Pause, ChevronRight, ImageIcon, X } from 'lucide-react';
import { ProductImageManager } from './ProductImageManager';

interface ProductChannelsProps {
    product: Product;
    editData: Partial<Product>;
    activeChannel: SalesChannel;
    onChannelChange: (channel: SalesChannel) => void;
    onChannelDataChange: (field: any, value: any, channel?: SalesChannel) => void;
    handleGenerateCopy: () => void;
    isGeneratingCopy: boolean;
}

export const ProductChannels: React.FC<ProductChannelsProps> = ({
    product,
    editData,
    activeChannel,
    onChannelChange,
    onChannelDataChange,
    handleGenerateCopy,
    isGeneratingCopy
}) => {
    const currentEditingProduct = { ...product, ...editData };
    const currentChannelData = (currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === activeChannel) || { channel: activeChannel, isAvailable: false }) as ChannelConfig;

    const channels = [
        { id: 'pos', name: 'PDV / Balcão', icon: Monitor, color: 'blue', desc: 'Preços e nome para venda direta e local.' },
        { id: 'digital-menu', name: 'Cardápio Digital', icon: Globe, color: 'green', desc: 'Sua vitrine online direta para o cliente.' },
        { id: 'ifood', name: 'iFood / Delivery', icon: ShoppingCart, color: 'red', desc: 'Marketplace e entregas externas.' }
    ] as const;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Channel Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {channels.map(ch => {
                    const Icon = ch.icon;
                    const isActive = activeChannel === ch.id;
                    const chData = currentEditingProduct.channels?.find((c: ChannelConfig) => c.channel === ch.id);
                    const isEnabled = chData?.isAvailable;

                    return (
                        <button
                            key={ch.id}
                            onClick={() => onChannelChange(ch.id as SalesChannel)}
                            className={`flex flex-col p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${isActive
                                ? 'border-summo-primary bg-summo-bg/10 ring-4 ring-summo-primary/5'
                                : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                                }`}
                        >
                            <div className={`p-2 rounded-lg w-fit mb-3 ${isActive ? 'bg-summo-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Icon size={20} />
                            </div>
                            <span className={`font-black text-sm uppercase tracking-tight ${isActive ? 'text-summo-primary' : 'text-gray-700'}`}>{ch.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium leading-tight mt-1">{ch.desc}</span>

                            <div className="mt-4 flex items-center justify-between">
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {isEnabled ? <Play size={8} fill="currentColor" /> : <Pause size={8} fill="currentColor" />}
                                    {isEnabled ? 'Ativo' : 'Pausado'}
                                </div>
                                {isActive && <ChevronRight size={14} className="text-summo-primary" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Channel Overrides */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-summo-primary">
                    {React.createElement(channels.find(c => c.id === activeChannel)?.icon || Globe, { size: 120 })}
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            Configurações: {channels.find(c => c.id === activeChannel)?.name}
                        </h3>
                        <p className="text-sm text-gray-400">Customizações exclusivas para este canal de venda.</p>
                    </div>

                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 transition select-none ${currentChannelData.isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <span className={`text-xs font-black uppercase ${currentChannelData.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                            {currentChannelData.isAvailable ? 'Canal Ativo' : 'Canal Pausado'}
                        </span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={currentChannelData.isAvailable || false}
                            onChange={(e) => onChannelDataChange('isAvailable', e.target.checked)}
                        />
                        <div className={`w-10 h-5 rounded-full relative transition ${currentChannelData.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${currentChannelData.isAvailable ? 'left-6' : 'left-1'}`} />
                        </div>
                    </label>
                </div>
                {/* Visual e Conteúdo */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={18} className="text-summo-primary" /> Visual e Conteúdo
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase block">Imagem do Canal</label>

                            {/* Logic: If channel image is same as main, show Preview + Toggle. If different, show Uploader + Remove Override */}
                            {(() => {
                                const mainImage = currentEditingProduct.image;
                                const channelImage = currentChannelData.image;
                                const isOverridden = channelImage && channelImage !== mainImage;

                                if (!isOverridden) {
                                    return (
                                        <div className="space-y-3">
                                            <div className="max-w-[200px] aspect-square rounded-xl overflow-hidden border border-gray-200 relative group">
                                                <img src={mainImage || ''} className="w-full h-full object-cover opacity-80" alt="Main" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Imagem Principal</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onChannelDataChange('image', 'https://via.placeholder.com/150')} // Trigger change to different (or empty to start upload? better to just show manager) 
                                                // Actually, we need to allow enabling the uploader.
                                                // Let's change the pattern slightly. We need a local state? 
                                                // No, we can just render the Manager if we want to Edit.
                                                // But to *become* overridden, we start with the current image.
                                                className="text-xs font-bold text-summo-primary hover:underline flex items-center gap-1"
                                            >
                                                <Wand2 size={12} /> Customizar para este canal
                                            </button>
                                        </div>
                                    );
                                } else {
                                    // Overridden State
                                    return (
                                        <div className="space-y-2">
                                            <div className="max-w-[200px]">
                                                <ProductImageManager
                                                    product={currentEditingProduct as Product}
                                                    currentImage={currentChannelData.image || ''}
                                                    onImageChange={(url: string) => onChannelDataChange('image', url)}
                                                    productName={currentChannelData.displayName || product.name}
                                                    onUpdate={() => { }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => onChannelDataChange('image', currentEditingProduct.image)} // Revert to Main
                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
                                            >
                                                <X size={10} /> Remover Personalização (Usar Principal)
                                            </button>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        <div className="md:col-span-2 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1">
                                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Nome de Exibição</label>
                                    <input
                                        type="text"
                                        value={currentChannelData.displayName || ''}
                                        onChange={(e) => onChannelDataChange('displayName', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-2xl outline-none text-sm font-bold transition"
                                        placeholder="Ex: Coca-Cola 350ml"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Categoria (Opcional)</label>
                                    <input
                                        type="text"
                                        value={currentChannelData.category || ''}
                                        onChange={(e) => onChannelDataChange('category', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-2xl outline-none text-sm font-bold transition"
                                        placeholder="Substituir Categoria"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase block mb-1">Ordem de Exibição</label>
                                <input
                                    type="number"
                                    value={currentChannelData.sortOrder ?? ''}
                                    onChange={(e) => onChannelDataChange('sortOrder', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-2xl outline-none text-sm font-bold transition"
                                    placeholder="Ordem"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-black text-gray-500 uppercase block">Descrição Exclusiva</label>
                                    {activeChannel === 'digital-menu' && (
                                        <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} className="flex items-center gap-1 text-[10px] text-summo-primary font-black hover:bg-summo-bg px-2 py-1 rounded-lg transition uppercase tracking-wider">
                                            {isGeneratingCopy ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />} Inteligência Artificial
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={currentChannelData.description || ''}
                                    onChange={(e) => onChannelDataChange('description', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-2xl h-[124px] text-sm font-medium outline-none resize-none transition"
                                    placeholder="Descreva os detalhes para este canal específico..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
