
import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSliderProps {
    banners: PromoBanner[];
    rotationSeconds?: number;
    onBannerClick?: (productId: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
    banners,
    rotationSeconds = 4,
    onBannerClick
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const activeBanners = banners.filter(b => b.enabled && b.imageUrl);
    const minSwipeDistance = 50;

    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeBanners.length);
        }, rotationSeconds * 1000);

        return () => clearInterval(interval);
    }, [activeBanners.length, rotationSeconds]);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrentIndex(prev => (prev + 1) % activeBanners.length);
        }
        if (isRightSwipe) {
            setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
        }
    };

    if (activeBanners.length === 0) return null;

    const currentBanner = activeBanners[currentIndex];

    return (
        <div className="relative w-full px-4 pt-2 pb-4 group">
            <div
                className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden shadow-xl shadow-summo-primary/10 border border-summo-border/50 bg-summo-surface cursor-pointer transform active:scale-[0.98] transition-all duration-300"
                onClick={() => currentBanner.linkedProductId && onBannerClick?.(currentBanner.linkedProductId)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Banner Image */}
                <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover animate-fade-in"
                    key={currentBanner.id} // Force re-animation on change
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-white font-black text-lg md:text-xl leading-tight drop-shadow-lg">
                        {currentBanner.title}
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm mt-1 font-medium drop-shadow shadow-black">
                        {currentBanner.text}
                    </p>
                </div>

                {/* Progress Indicators */}
                {activeBanners.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {activeBanners.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-4 bg-summo-primary' : 'w-1.5 bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Buttons (Visible only on hover/desktop) */}
            {activeBanners.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % activeBanners.length); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}
        </div>
    );
};
