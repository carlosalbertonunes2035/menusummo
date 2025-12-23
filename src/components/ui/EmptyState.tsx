import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action
}) => {
    const ActionIcon = action?.icon;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Icon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-summo-primary text-white rounded-xl font-bold 
                     hover:bg-summo-primary/90 transition-all shadow-md hover:shadow-lg
                     flex items-center gap-2"
                >
                    {ActionIcon && <ActionIcon size={18} />}
                    {action.label}
                </button>
            )}
        </div>
    );
};
