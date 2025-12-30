import React from 'react';
import { LayoutTemplate, ListPlus, Calculator, Monitor, Globe } from 'lucide-react';

export type ProductEditorTab = 'GENERAL' | 'OPTIONS' | 'ENGINEERING' | 'CHANNELS' | 'SEO';

interface ProductEditorTabsProps {
    activeTab: ProductEditorTab;
    setActiveTab: (tab: ProductEditorTab) => void;
}

export const ProductEditorTabs: React.FC<ProductEditorTabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: ProductEditorTab; label: string; icon: React.FC<any> }[] = [
        { id: 'GENERAL', label: 'Cadastro Básico', icon: LayoutTemplate },
        { id: 'OPTIONS', label: 'Complementos', icon: ListPlus },
        { id: 'ENGINEERING', label: 'Engenharia & Lucro', icon: Calculator },
        { id: 'CHANNELS', label: 'Canais de Venda', icon: Monitor },
        { id: 'SEO', label: 'SEO & Marketing', icon: Globe },
    ];

    return (
        <div className="px-6 border-b border-gray-100 flex gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${isActive
                            ? 'border-summo-primary text-summo-primary'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {/* @ts-ignore */}
                        <Icon size={16} className="inline mr-2 mb-0.5" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
