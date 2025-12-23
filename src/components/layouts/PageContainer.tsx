
import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
    maxWidth = 'full'
}) => {
    const maxWidthClasses = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full'
    };

    return (
        <div className={cn(
            'flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8',
            maxWidthClasses[maxWidth],
            className
        )}>
            {children}
        </div>
    );
};
