
import React from 'react';
import { Loader2 } from 'lucide-react';

interface SummoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const SummoButton: React.FC<SummoButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    // Map variants to CSS classes defined in index.css or Tailwind utilities
    const getVariantClass = () => {
        switch (variant) {
            case 'primary': return 'btn-summo-primary'; // Uses defined CSS class
            case 'secondary': return 'bg-summo-secondary text-white shadow-md hover:bg-emerald-600 active:scale-95';
            case 'outline': return 'border-2 border-gray-200 text-gray-700 hover:border-summo-primary hover:text-summo-primary active:bg-gray-50';
            case 'ghost': return 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
            case 'danger': return 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300';
            default: return 'btn-summo';
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'sm': return 'text-xs px-3 py-1.5 h-8';
            case 'lg': return 'text-lg px-6 py-3 h-14';
            default: return ''; // Default handled by CSS class
        }
    };

    const baseClass = variant === 'primary' ? '' : 'btn-summo'; // btn-summo-primary includes base styles

    return (
        <button
            className={`${baseClass} ${getVariantClass()} ${getSizeClass()} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};
