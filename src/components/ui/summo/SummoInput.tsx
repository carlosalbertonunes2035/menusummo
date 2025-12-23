
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    helperText?: string;
}

export const SummoInput: React.FC<SummoInputProps> = ({
    label,
    icon: Icon,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <Icon
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-summo-primary'}`}
                    />
                )}
                <input
                    className={`
                        w-full p-3.5 rounded-xl border-2 transition-all outline-none font-medium text-gray-800
                        ${Icon ? 'pl-11' : 'pl-4'}
                        ${error
                            ? 'border-red-100 bg-red-50 focus:border-red-400'
                            : 'border-gray-50 bg-gray-50 focus:bg-white focus:border-summo-primary focus:shadow-lg focus:shadow-orange-500/5'}
                    `}
                    {...props}
                />
            </div>
            {error ? (
                <span className="text-xs text-red-500 font-bold ml-1 animate-fade-in">{error}</span>
            ) : helperText && (
                <span className="text-[10px] text-gray-400 font-medium ml-1">{helperText}</span>
            )}
        </div>
    );
};
