
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SummoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    footer?: React.ReactNode;
}

export const SummoModal: React.FC<SummoModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
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

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'w-full h-full rounded-none'
    };

    const content = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className={`
                relative bg-white w-full rounded-2xl shadow-2xl 
                flex flex-col max-h-[90vh] animate-scale-in
                ${sizeClasses[size]}
            `}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    {title ? <h3 className="text-xl font-bold text-gray-900">{title}</h3> : <div />}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100:bg-gray-800 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    // Render to body/portal to ensure it stays on top
    return createPortal(content, document.body);
};
