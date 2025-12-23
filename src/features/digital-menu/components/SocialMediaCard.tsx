
import React, { useState, useEffect, useRef, memo } from 'react';
import { Product } from '../../../types';
import { Heart, MessageCircle, Share2, Play, Pause, Percent, ShoppingBag, Bookmark, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { getProductChannel } from '../../../lib/utils';
import { getProductImage } from '../utils/imageMapper';

interface SocialMediaCardProps {
    product: Product;
    onAdd: () => void;
    onOpenComments: () => void;
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ product, onAdd, onOpenComments }) => {
    const { settings } = useApp();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showHeartAnim, setShowHeartAnim] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Obter dados do canal digital ou fallback para POS
    const channelConfig = getProductChannel(product, 'digital-menu');

    const displayName = channelConfig.displayName || product.name;
    const description = channelConfig.description || `Delicioso ${displayName} feito com ingredientes selecionados.`;
    const image = channelConfig.image || undefined;
    const videoUrl = channelConfig.videoUrl || undefined;
    const price = channelConfig.price || 0;
    const promotionalPrice = channelConfig.promotionalPrice || undefined;

    const hasPromo = promotionalPrice && promotionalPrice > 0 && promotionalPrice < price;
    const discount = hasPromo ? Math.round(((price - promotionalPrice) / price) * 100) : 0;
    const currentPrice = hasPromo ? promotionalPrice : price;

    // Use default true if not set, but respect false if explicitly set
    const showComments = settings.digitalMenu?.showComments ?? true;
    const showShare = settings.digitalMenu?.showShare ?? true;
    // Assuming showSave might be added later to types, defaulting to true for UI demo
    const showSave = true;

    // Autoplay logic com Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && videoRef.current) {
                    videoRef.current.play().catch(() => { });
                    setIsPlaying(true);
                } else if (videoRef.current) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            });
        }, { threshold: 0.6 });
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
        else { videoRef.current.play().catch(() => { }); setIsPlaying(true); }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (!isLiked) {
            setShowHeartAnim(true);
            setTimeout(() => setShowHeartAnim(false), 1000);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Confira ${displayName}`,
            text: `Olha que delícia: ${displayName}! Está por R$ ${currentPrice?.toFixed(2)}`,
            url: window.location.href
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); alert("Link copiado!"); }
        } catch (err) { console.log("Share failed"); }
    };

    const isVideo = videoUrl && videoUrl.length > 5;

    return (
        <article className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 md:border md:rounded-xl md:mb-8 md:shadow-sm pb-4 last:border-0">
            {/* Header do Post */}
            <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
                            <img src={settings.logoUrl || "https://ui-avatars.com/api/?name=Loja"} className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer">{settings.brandName || 'Sua Loja'}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                </div>
                <button className="text-gray-500 dark:text-gray-400">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Mídia (Imagem/Vídeo) - Full Bleed Logic: Simply use width-full as parent has no padding now */}
            <div onDoubleClick={handleLike} className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {isVideo ? (
                    <img src={videoUrl} loading="lazy" className="w-full h-full object-cover" alt={displayName} onClick={handleLike} />
                ) : (
                    <img src={getProductImage(product)} className="w-full h-full object-cover" loading="lazy" />
                )}

                {/* Overlay de Animação de Like */}
                {showHeartAnim && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-ping-short">
                        <Heart size={100} className="text-white fill-white drop-shadow-lg" />
                    </div>
                )}

                {/* Tags Flutuantes - Promoção */}
                {hasPromo && (
                    <div className="absolute top-4 right-0 bg-red-600 text-white font-bold px-3 py-1 rounded-l-lg text-xs z-10 shadow-md flex items-center gap-1">
                        <Percent size={12} /> {discount}% OFF
                    </div>
                )}

                {/* Botão Play/Pause Visual */}
                {isVideo && (
                    <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white pointer-events-none backdrop-blur-sm">
                        {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" />}
                    </div>
                )}

                {/* Shopping Tag - Floating Bubble Style */}
                <div
                    className="absolute bottom-4 left-4 right-4 flex justify-start pointer-events-none"
                >
                    <div
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="pointer-events-auto bg-white/95 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-2 pr-4 shadow-lg border border-white/20 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-md w-10 h-10 overflow-hidden flex-shrink-0">
                            <img src={getProductImage(product)} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">{displayName}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">R$ {currentPrice?.toFixed(2)}</span>
                        </div>
                        <div className="bg-summo-primary text-white p-1.5 rounded-full ml-2">
                            <ShoppingBag size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de Ações */}
            <div className="px-4 pt-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-4">
                        <button onClick={handleLike} className={`transition-transform active:scale-125 ${isLiked ? 'text-red-500' : 'text-gray-800 dark:text-gray-200 hover:text-gray-500'}`}>
                            <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
                        </button>
                        {showComments && (
                            <button onClick={onOpenComments} className="text-gray-800 dark:text-gray-200 hover:text-gray-500 transition active:scale-90">
                                <MessageCircle size={24} strokeWidth={2} className="-rotate-90" />
                            </button>
                        )}
                        {showShare && (
                            <button onClick={handleShare} className="text-gray-800 dark:text-gray-200 hover:text-gray-500 transition active:scale-90">
                                <Share2 size={24} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                    {showSave && (
                        <button onClick={() => setIsSaved(!isSaved)} className={`transition ${isSaved ? 'text-gray-900 fill-gray-900' : 'text-gray-800 hover:text-gray-500'}`}>
                            <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Likes Count */}
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {product.likes ? (product.likes + (isLiked ? 1 : 0)).toLocaleString() : (isLiked ? 1 : 0)} curtidas
                </p>

                {/* Legenda */}
                <div className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed mb-2">
                    <span className="font-bold mr-2 text-gray-900 dark:text-white text-sm">
                        {settings.brandName?.toLowerCase().replace(/\s/g, '_') || 'loja'}
                    </span>
                    {description}
                </div>

                {/* View Comments / Time */}
                {showComments && (
                    <button onClick={onOpenComments} className="text-gray-500 text-sm mb-1 block">
                        Ver todos os comentários
                    </button>
                )}
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Há 2 horas
                </p>

                {/* Botão CTA Principal - Sempre Visível */}
                <button
                    onClick={onAdd}
                    className="w-full mt-4 bg-summo-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-summo-dark transition flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg"
                >
                    <ShoppingBag size={18} />
                    Adicionar • R$ {currentPrice?.toFixed(2)}
                </button>
            </div>
        </article>
    );
};

export default memo(SocialMediaCard);
