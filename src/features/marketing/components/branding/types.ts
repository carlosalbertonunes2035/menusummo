import { StoreSettings } from '@/types';

export interface BrandingManagerProps {
    localSettings: StoreSettings;
    tenantId: string;
    handleSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
