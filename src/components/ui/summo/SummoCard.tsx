
import React from 'react';

interface SummoCardProps {
    children: React.ReactNode;
    variant?: 'white' | 'glass' | 'gray';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

export const SummoCard: React.FC<SummoCardProps> = ({
    children,
    variant = 'white',
    padding = 'md',
    className = '',
    onClick
}) => {
    const variants = {
        white: 'bg-white border border-gray-100 shadow-sm',
        glass: 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl',
        gray: 'bg-gray-50 border border-transparent'
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            onClick={onClick}
            className={`
                rounded-2xl transition-all duration-300
                ${variants[variant]}
                ${paddings[padding]}
                ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
