import { SalesChannel } from './product';

export interface Option {
    id: string;
    name: string;
    price: number;
    maxQuantity?: number;
    isAvailable?: boolean;
}

export interface OptionGroup {
    id: string;
    title: string;
    name?: string; // Backward compatibility
    type?: 'SINGLE' | 'MULTIPLE';
    required?: boolean;
    min?: number; // Backward compatibility
    max?: number; // Backward compatibility
    minSelection?: number;
    maxSelection?: number;
    options: Option[];
}

export type OptionGroupLibraryItem = OptionGroup;
