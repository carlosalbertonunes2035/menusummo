
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../../types';
import { ChevronLeft } from 'lucide-react';
import ProductDetailView from './ProductDetailView';

interface ProductDetailModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, notes: string, selectedOptions: { groupTitle: string; optionName: string; price: number }[]) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
    // --- DRAG TO DISMISS LOGIC ---
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only allow drag if scrolled to top (approx check as inner Scroll view might be different)
        // Ideally we pass a ref to View to check scroll, or just allow drag on header
        // For now, allow drag on header only is safer or check if touch is in header area
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        if (diff > 0) {
            // e.preventDefault(); // Removed to avoid interfering with inner scrolls if not careful
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (translateY > 150) {
            onClose(); // Dismiss if dragged enough
        } else {
            setTranslateY(0); // Snap back
        }
    };

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTranslateY(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[105] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-gray-900 flex flex-col overflow-hidden max-h-[90vh] h-[90vh] rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]"
                style={{
                    transform: `translateY(${translateY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                {/* Drag Handle Area */}
                <div
                    className="w-full flex items-center justify-center pt-3 pb-1 z-30 touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500"
                    >
                        <ChevronLeft className="rotate-[-90deg]" size={20} />
                    </button>
                </div>

                {/* Content View */}
                <div className="flex-1 overflow-hidden relative">
                    <ProductDetailView key={product.id} product={product} onAddToCart={onAddToCart} />
                </div>
            </div>
        </>
    );
};

export default ProductDetailModal;
