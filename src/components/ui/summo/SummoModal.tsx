
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SummoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl';
    footer?: React.ReactNode;
}

export const SummoModal: React.FC<SummoModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
    footer
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const widths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '5xl': 'max-w-5xl'
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative bg-white rounded-[2.5rem] w-full ${widths[maxWidth]} 
                shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90dvh]
                border border-white/20
            `}>
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                    {title ? (
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            {title}
                        </h3>
                    ) : <div />}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-2xl hover:bg-gray-200:bg-gray-800 transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
