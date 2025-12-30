import { useState } from 'react';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client';
import { RobotService } from '@/services/robotService';
import { SeoManagerProps } from './types';

export function useSeo({
    localSettings,
    products,
    setLocalSettings,
    setHasChanges,
    showToast
}: Omit<SeoManagerProps, 'handleSettingsChange'>) {
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

    const handleQuickSuggestion = () => {
        const catNames = Array.from(new Set(products.map(p => p.category)));
        const base = RobotService.generateBaseSEO(localSettings.brandName, catNames);
        setLocalSettings(prev => ({
            ...prev,
            seo: {
                title: prev.seo?.title || localSettings.brandName,
                description: base.description,
                keywords: base.keywords
            }
        }));
        setHasChanges(true);
        showToast("SEO gerado instantaneamente (Robô)", "success");
    };

    const handleGenerateSeoWithAI = async () => {
        setIsGeneratingSeo(true);
        try {
            const productNames = products.slice(0, 10).map(p => p.name);
            const generateStoreSeoFn = httpsCallable(functions, 'generateStoreSeo');

            const { data } = await generateStoreSeoFn({
                brandName: localSettings.brandName,
                products: productNames
            });
            const result = data as any;

            setLocalSettings(prev => ({
                ...prev,
                seo: {
                    title: result.title || prev.seo?.title || '',
                    description: result.description || '',
                    keywords: result.keywords ? result.keywords.split(',').map((k: string) => k.trim()) : []
                }
            }));
            setHasChanges(true);
            showToast("SEO gerado com IA (Vertex)!", "success");
        } catch (e) {
            console.error(e);
            showToast("Erro ao gerar SEO via Backend.", "error");
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    return {
        isGeneratingSeo,
        handleQuickSuggestion,
        handleGenerateSeoWithAI
    };
}
