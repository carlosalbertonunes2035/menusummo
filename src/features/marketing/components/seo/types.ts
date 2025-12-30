import { StoreSettings, Product } from '@/types';

export interface SeoManagerProps {
    localSettings: StoreSettings;
    products: Product[];
    handleSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setLocalSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
