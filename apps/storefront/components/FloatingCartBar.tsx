'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface FloatingCartBarProps {
    cartCount: number;
    cartTotal: number;
    onClick: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ cartCount, cartTotal, onClick }) => {
    if (cartCount === 0) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
            <button
                onClick={onClick}
                className="w-full bg-orange-600 text-white p-4 rounded-xl shadow-lg shadow-orange-600/30 flex justify-between items-center active:scale-95 transition-transform"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {cartCount}
                    </div>
                    <span className="font-bold text-sm">Ver Sacola</span>
                </div>

                <div className="flex items-center gap-2 font-bold text-lg">
                    R$ {cartTotal.toFixed(2)}
                    <ShoppingBag size={20} fill="currentColor" className="text-white/80" />
                </div>
            </button>
        </div>
    );
};
