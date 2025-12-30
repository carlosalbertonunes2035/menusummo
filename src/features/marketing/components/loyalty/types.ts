import { StoreSettings } from '@/types';

export interface LoyaltyBranding {
    name: string;
    color: string;
}

export interface LoyaltySettings {
    enabled: boolean;
    pointsPerCurrency: number;
    cashbackValuePer100Points: number;
    minRedemptionPoints: number;
    branding: LoyaltyBranding;
}

export interface LoyaltyManagerProps {
    localSettings: StoreSettings;
    handleSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}
