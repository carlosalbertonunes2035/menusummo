
import React from 'react';

interface SummoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glass?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const SummoCard: React.FC<SummoCardProps> = ({
    children,
    hover = false,
    glass = false,
    padding = 'md',
    className = '',
    ...props
}) => {
    const baseClass = hover ? 'card-summo-hover' : 'card-summo';
    const glassClass = glass ? 'glass' : '';

    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return '';
            case 'sm': return 'p-3';
            case 'lg': return 'p-6 md:p-8';
            default: return 'p-4 md:p-6';
        }
    };

    return (
        <div
            className={`${baseClass} ${glassClass} ${getPaddingClass()} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
