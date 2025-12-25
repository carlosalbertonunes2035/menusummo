import React, { useRef, useEffect } from 'react';
import { PromoBanner } from '@/types';

interface PromoBannersProps {
    banners: PromoBanner[];
    rotationSeconds: number;
    fullWidth?: boolean;
}

const PromoBanners: React.FC<PromoBannersProps> = ({ banners, rotationSeconds, fullWidth }) => {
    const activeBanners = banners.filter(b => b.enabled);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto Rotation
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const scrollEnd = scrollWidth - clientWidth;

                if (Math.ceil(scrollLeft) >= scrollEnd) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const cardWidth = window.innerWidth * 0.85;
                    scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, Math.max(3000, rotationSeconds * 1000));

        return () => clearInterval(interval);
    }, [activeBanners.length, rotationSeconds]);

    if (activeBanners.length === 0) return null;

    return (
        <div className={`pt-2 mb-4 ${fullWidth ? '' : 'px-4'}`}>
            <div
                ref={scrollRef}
                className={`flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory w-full ${fullWidth ? 'px-4' : ''}`}
                style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
            >
                {activeBanners.map(banner => (
                    <div key={banner.id} className="flex-shrink-0 w-[85vw] sm:w-[400px] snap-center bg-gray-100 rounded-2xl overflow-hidden relative aspect-[2/1] text-white shadow-md transform transition-transform">
                        <img
                            src={banner.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                            <h3 className="font-bold text-xl leading-tight mb-1 drop-shadow-md">{banner.title}</h3>
                            <p className="text-sm font-medium opacity-90 drop-shadow-sm line-clamp-2">{banner.text}</p>
                        </div>
                    </div>
                ))}
                <div className="w-2 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default PromoBanners;
