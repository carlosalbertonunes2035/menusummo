import React from 'react';
import { BarChart, Activity, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { SeoManagerProps } from './types';
import { useSeo } from './useSeo';

export const SeoManager: React.FC<Omit<SeoManagerProps, 'showToast'>> = ({
    localSettings,
    products,
    handleSettingsChange,
    setLocalSettings,
    setHasChanges
}) => {
    const { showToast } = useToast();
    const {
        isGeneratingSeo,
        handleQuickSuggestion,
        handleGenerateSeoWithAI
    } = useSeo({ localSettings, products, setLocalSettings, setHasChanges, showToast });

    const labelClass = "text-xs font-bold text-slate-500 uppercase mb-1 block";
    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-slate-800 placeholder-slate-400 transition-colors";
    const cardClass = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4";

    return (
        <div className="space-y-6">
            <div className={cardClass}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <BarChart size={16} /> SEO (Busca Google)
                    </h4>
                    <div className="flex gap-2">
                        <button
                            onClick={handleQuickSuggestion}
                            className="flex items-center gap-1 text-[10px] text-gray-600 font-bold hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                        >
                            <Activity size={12} /> Sugestão Rápida
                        </button>
                        <button
                            onClick={handleGenerateSeoWithAI}
                            disabled={isGeneratingSeo}
                            className="flex items-center gap-1 text-[10px] text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                        >
                            {isGeneratingSeo ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Refinar com IA
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Título da Página (Title Tag)</label>
                        <input
                            type="text"
                            name="seo.title"
                            value={localSettings.seo?.title || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Descrição (Meta Description)</label>
                        <textarea
                            name="seo.description"
                            value={localSettings.seo?.description || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Palavras-chave (Keywords)</label>
                        <input
                            type="text"
                            name="seo.keywords"
                            value={localSettings.seo?.keywords?.join(', ') || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                            placeholder="Ex: açaí, delivery, lanches"
                        />
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={16} /> Analytics & Pixels
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>ID do Google Analytics 4</label>
                        <input
                            type="text"
                            name="analytics.googleAnalyticsId"
                            value={localSettings.analytics?.googleAnalyticsId || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                            placeholder="G-XXXXXXXXXX"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>ID do Pixel da Meta (Facebook)</label>
                        <input
                            type="text"
                            name="analytics.metaPixelId"
                            value={localSettings.analytics?.metaPixelId || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                            placeholder="Apenas o número de ID"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
