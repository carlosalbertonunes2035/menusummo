import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { StoreSettings } from '@/types';

export function useMarketing() {
    const { settings, setSettings } = useApp();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'SHOWCASE' | 'CAMPAIGNS' | 'LOYALTY' | 'CONTENT' | 'SEO'>('SHOWCASE');
    const [showcaseSubTab, setShowcaseSubTab] = useState<'APPEARANCE' | 'ORGANIZATION'>('APPEARANCE');
    const [appearanceSubTab, setAppearanceSubTab] = useState<'IDENTITY' | 'BANNERS'>('IDENTITY');

    const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        let parsedValue: any = value;

        if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;
        if (type === 'number') parsedValue = parseFloat(value) || 0;

        setLocalSettings(prev => {
            const newS = JSON.parse(JSON.stringify(prev));
            let temp = newS;
            for (let i = 0; i < keys.length - 1; i++) {
                if (temp[keys[i]] === undefined) temp[keys[i]] = {};
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = parsedValue;
            return newS;
        });
        setHasChanges(true);
    };

    const saveSettings = () => {
        setSettings(localSettings);
        setHasChanges(false);
        showToast("Configurações salvas com sucesso!", "success");
    };

    return {
        activeTab,
        setActiveTab,
        showcaseSubTab,
        setShowcaseSubTab,
        appearanceSubTab,
        setAppearanceSubTab,
        localSettings,
        setLocalSettings,
        hasChanges,
        setHasChanges,
        handleSettingsChange,
        saveSettings
    };
}
