import React from 'react';
import { Megaphone, GalleryVertical, Ticket, Sparkles, Wand2, Smartphone, Eye } from 'lucide-react';

interface MarketingHeaderProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    onViewStore: () => void;
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
    activeTab,
    setActiveTab,
    onViewStore
}) => {
    const tabs = [
        { id: 'SHOWCASE', label: 'Vitrine (Loja Online)', icon: GalleryVertical },
        { id: 'CAMPAIGNS', label: 'Campanhas & Cupons', icon: Ticket },
        { id: 'LOYALTY', label: 'Fidelidade & Cashback', icon: Sparkles },
        { id: 'CONTENT', label: 'Conteúdo (IA)', icon: Wand2 },
        { id: 'SEO', label: 'Config. Técnicas (SEO)', icon: Smartphone },
    ];

    return (
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm sticky top-0 z-20 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl text-white shadow-lg shadow-pink-200">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Marketing & Vitrine</h2>
                        <p className="text-sm text-gray-500">Hub do Cliente: Aparência da Loja, Campanhas e Conteúdo.</p>
                    </div>
                </div>
                <button
                    onClick={onViewStore}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition active:scale-95 whitespace-nowrap"
                >
                    <Eye size={18} /> Ver Loja Online
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-rose-50'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
