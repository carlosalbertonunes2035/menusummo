import React, { useState } from 'react';
import { Power, Edit3, TrendingUp, ImageIcon, Plus, Loader2 } from 'lucide-react';
import { Product } from '../../../../types';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '../../../../contexts/ToastContext';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useAuth } from '../../../auth/context/AuthContext';
import { storageService } from '../../../../lib/firebase/storageService';

export interface MenuProductCardProps {
    product: Product & { marginPercent: number };
    onOpenEditor: (p: Product) => void;
    onToggleAvailability: (e: React.MouseEvent, p: Product) => void;
    isEditorOpen: boolean;
}

export const MenuProductCard: React.FC<MenuProductCardProps> = ({ product, onOpenEditor, onToggleAvailability, isEditorOpen }) => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { saveProduct } = useProductsQuery(tenantId);
    const { systemUser } = useAuth();


    const posChannel = product.channels.find(c => c.channel === 'pos') || product.channels[0] || { price: 0, isAvailable: false, description: '', image: '' };
    // Logic: Tri-State Availability
    // 1. GLOBAL PAUSE: If status is PAUSED, everything is off.
    // 2. PARTIAL: If Active but some channels are off.
    // 3. FULL: If Active and all main channels (pos, digital-menu, ifood) are on.

    // Define main channels we care about for "Full" status
    const MAIN_CHANNELS = ['pos', 'digital-menu', 'ifood'];

    const isGlobalPaused = product.status === 'PAUSED';

    // Only verify channels that appear in the product configuration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configuredMainChannels = product.channels.filter(c => MAIN_CHANNELS.includes(c.channel as any));
    const activeChannelsCount = configuredMainChannels.filter(c => c.isAvailable).length;
    const totalMainChannels = configuredMainChannels.length;

    let availabilityStatus: 'PAUSED' | 'PARTIAL' | 'FULL' = 'PAUSED';
    if (isGlobalPaused) {
        availabilityStatus = 'PAUSED';
    } else if (activeChannelsCount < totalMainChannels) {
        availabilityStatus = 'PARTIAL';
    } else {
        availabilityStatus = 'FULL';
    }

    const price = posChannel.price;

    // ... existing hooks ...
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(price.toString());
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const isLowMargin = product.marginPercent < 30;
    const isHighMargin = product.marginPercent >= 50;

    // Resolve Image
    const displayImage = posChannel.image || product.image;

    // ... existing handlers ...
    const handlePriceSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        const newPrice = parseFloat(tempPrice);
        if (!isNaN(newPrice) && newPrice >= 0) {
            const newChannels = product.channels.map(c =>
                c.channel === 'pos' ? { ...c, price: newPrice } : c
            );
            saveProduct({ id: product.id, channels: newChannels });
        } else {
            setTempPrice(price.toString());
        }
        setIsEditingPrice(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handlePriceSave();
        if (e.key === 'Escape') {
            setTempPrice(price.toString());
            setIsEditingPrice(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        let file: File | Blob | null = null;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            file = e.dataTransfer.files[0];
        } else {
            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            if (url && url.startsWith('http')) {
                setIsUploading(true);
                try {
                    const res = await fetch(url);
                    file = await res.blob();
                } catch (err) {
                    showToast("Link preservado. Use o editor para URLs bloqueadas.", "error");
                    setIsUploading(false); return;
                }
            }
        }

        if (file) {
            setIsUploading(true);
            try {
                const url = await storageService.uploadProductImage(file, tenantId, product.id);
                // Sync across all main channels AND root image
                const newChannels = product.channels.map(c =>
                    ['pos', 'digital-menu', 'ifood'].includes(c.channel) ? { ...c, image: url } : c
                );
                await saveProduct({ id: product.id, image: url, channels: newChannels });
                showToast("Imagem atualizada com sucesso!", "success");
            } catch (err) {
                showToast("Erro ao atualizar imagem.", "error");
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Helper for Button Styles
    const getToggleStyle = () => {
        switch (availabilityStatus) {
            case 'PAUSED':
                // Currently Red (Off). Hovering suggests "Turn On" (Green-ish).
                return 'bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-600 hover:shadow-md hover:scale-105';
            case 'PARTIAL':
                // Currently Amber (Partial). Hovering suggests "Turn Off" (Red-ish).
                return 'bg-amber-100 text-amber-700 hover:bg-red-100 hover:text-red-600 ring-1 ring-amber-200 hover:ring-red-200 hover:shadow-md';
            case 'FULL':
                // Currently Green (On). Hovering suggests "Turn Off" (Red-ish).
                return 'bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-600 hover:shadow-md';
        }
    };

    const getToggleTitle = () => {
        switch (availabilityStatus) {
            case 'PAUSED': return 'Ativar Venda (Global)';
            case 'PARTIAL': return 'Ativo Parcialmente (Clique para Pausar)';
            case 'FULL': return 'Pausar Venda (Global)';
        }
    };

    return (
        <div
            onClick={() => onOpenEditor(product)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${availabilityStatus !== 'PAUSED' ? 'border-gray-100' : 'border-gray-200 opacity-60 grayscale-[0.8] hover:grayscale-0 hover:opacity-100'} ${isEditorOpen ? 'ring-2 ring-summo-primary border-summo-primary' : ''} ${isDragging ? 'ring-4 ring-summo-primary/50 scale-[1.02] z-20' : ''}`}
        >

            {/* Image Header */}
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {/* Combo Badge */}
                {product.type === 'COMBO' && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        🎁 COMBO
                    </div>
                )}
                {displayImage ? (
                    <div className="w-full h-full relative overflow-hidden bg-gray-50">
                        {/* Blurred background filling for portrait/wide icons (only show if fit is CONTAIN) */}
                        {(!product.imageFit || product.imageFit === 'contain') && (
                            <img
                                src={displayImage}
                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110"
                                aria-hidden="true"
                            />
                        )}
                        {/* Main Image contained properly */}
                        <img
                            src={displayImage}
                            alt={product.name}
                            className={`relative w-full h-full z-10 group-hover:scale-105 transition-transform duration-500 ${product.imageFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        {isUploading ? <Loader2 size={40} className="animate-spin text-summo-primary" /> : <ImageIcon size={40} />}
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 size={32} className="animate-spin text-summo-primary mb-2" />
                        <span className="text-[10px] font-black text-summo-primary uppercase tracking-widest">Enviando...</span>
                    </div>
                )}

                {isDragging && (
                    <div className="absolute inset-0 bg-summo-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 border-4 border-dashed border-summo-primary">
                        <Plus size={48} className="text-summo-primary animate-bounce mb-2" />
                        <span className="bg-summo-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Solte para Atualizar</span>
                    </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button
                        onClick={(e) => onToggleAvailability(e, product)}
                        className={`p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md ${getToggleStyle()}`}
                        title={getToggleTitle()}
                    >
                        <Power size={16} strokeWidth={3} />
                    </button>
                </div>

                <div className="absolute bottom-3 left-3 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-white/10">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight text-lg line-clamp-2">{product.name}</h3>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">{posChannel.description || "Sem descrição."}</p>

                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Preço Venda</span>
                        {isEditingPrice ? (
                            <div className="flex items-center">
                                <span className="text-sm font-bold text-gray-500 mr-1">R$</span>
                                <input
                                    autoFocus
                                    type="number"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}

                                    onBlur={(_e) => handlePriceSave()}
                                    onKeyDown={handleKeyDown}
                                    className="w-20 p-0 text-xl font-black text-gray-800 border-b-2 border-summo-primary outline-none bg-transparent"
                                />
                            </div>
                        ) : (
                            <span
                                onClick={() => { setIsEditingPrice(true); setTempPrice(price.toString()); }}
                                className="text-xl font-black text-gray-800 cursor-text hover:text-summo-primary transition-colors border-b border-transparent hover:border-gray-200"
                                title="Clique para editar rápido"
                            >
                                R$ {price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className={`text-right px-2 py-1 rounded-lg ${isLowMargin ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : isHighMargin ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'}`}>
                        <p className="text-[10px] uppercase font-bold flex items-center gap-1 justify-end">
                            <TrendingUp size={10} /> Margem
                        </p>
                        <p className="font-bold text-sm">{product.marginPercent.toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            {/* Edit Overlay on Hover (Hidden if editing price) */}
            {!isEditingPrice && (
                <div className="absolute inset-0 bg-summo-primary/0 group-hover:bg-summo-primary/5 transition-colors pointer-events-none flex items-center justify-center">
                    <div className="bg-white text-summo-primary px-4 py-2 rounded-full font-bold shadow-xl transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                        <Edit3 size={16} /> Detalhes
                    </div>
                </div>
            )}
        </div>
    );
};
