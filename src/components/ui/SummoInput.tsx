
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface SummoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    rightElement?: React.ReactNode;
}

export const SummoInput = forwardRef<HTMLInputElement, SummoInputProps>(({
    label,
    error,
    icon: Icon,
    rightElement,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-bold text-gray-700 mb-2"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full rounded-xl bg-gray-50 border 
                        outline-none transition-all duration-200
                        ${Icon ? 'pl-11' : 'pl-4'} 
                        ${rightElement ? 'pr-12' : 'pr-4'}
                        py-3
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-summo-primary focus:ring-2 focus:ring-summo-primary/20'
                        }
                        text-gray-900 placeholder-gray-400
                        disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

SummoInput.displayName = 'SummoInput';
