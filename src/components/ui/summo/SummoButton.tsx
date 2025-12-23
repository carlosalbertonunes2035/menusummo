
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'black';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: LucideIcon;
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const SummoButton: React.FC<SummoButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    isLoading,
    fullWidth,
    className = '',
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-summo-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20',
        secondary: 'bg-orange-50 text-summo-primary hover:bg-orange-100',
        black: 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
        outline: 'bg-transparent border-2 border-gray-200 hover:border-summo-primary text-gray-600 hover:text-summo-primary'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
        xl: 'px-10 py-4 text-lg'
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`
                flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : Icon && (
                <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2.5} />
            )}
            {children}
        </button>
    );
};
