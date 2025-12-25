// components/public/CategoryNav.tsx
import React from 'react';
import { Percent } from 'lucide-react';

interface CategoryNavProps {
    settings: any;
    categories: string[];
    activeCategory: string;
    scrollToCategory: (cat: string) => void;
    getCategoryImage: (cat: string) => string | undefined;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
    settings, categories, activeCategory, scrollToCategory, getCategoryImage
}) => {
    const getCategoryName = (cat: string) => {
        return settings?.digitalMenu?.categories?.[cat]?.displayName || cat;
    };

    return (
        <nav className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-4 bg-white sticky top-0 z-40 border-b border-gray-100">
            {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const isPromo = cat === '🔥 Promoções';

                return (
                    <button
                        key={cat}
                        id={`nav-item-${cat}`}
                        onClick={() => scrollToCategory(cat)}
                        className="flex flex-col items-center gap-1 flex-shrink-0 group"
                    >
                        <div className={`
                            w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300
                            ${isActive
                                ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 scale-105 shadow-md'
                                : 'bg-transparent border-2 border-gray-200 group-hover:border-gray-400'
                            }
                        `}>
                            <div className="w-full h-full rounded-full bg-white p-[3px] overflow-hidden relative">
                                {isPromo ? (
                                    <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-500 font-bold">
                                        <Percent size={28} />
                                    </div>
                                ) : (
                                    (() => {
                                        const imgUrl = getCategoryImage(cat);
                                        if (imgUrl) {
                                            return (
                                                <img
                                                    src={imgUrl}
                                                    alt={cat}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            );
                                        }
                                        return (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                                                {cat.charAt(0)}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                        <span className={`
                            text-[10px] font-medium text-center truncate w-20
                            ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500'}
                        `}>
                            {getCategoryName(cat)}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};
