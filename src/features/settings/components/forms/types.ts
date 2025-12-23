import { StoreSettings, Driver } from '../../../../types';

export interface SettingsFormProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onScheduleChange?: (dayIndex: number, field: string, value: any) => void;
    onToggleDockItem?: (id: string) => void;
    drivers?: Driver[];
    onDriverAction?: (action: 'add' | 'delete', data?: any) => void;
}
