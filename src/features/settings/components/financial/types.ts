import { StoreSettings } from '../../../../types';

export type PaymentProvider = 'STONE' | 'MERCADO_PAGO' | 'REDE' | 'CIELO' | 'PAGSEGURO' | 'CUSTOM';
export type IfoodPlan = 'BASIC' | 'DELIVERY';
export type IfoodPayoutModel = 'MONTHLY' | 'WEEKLY';

export interface FinancialRates {
    debit: number;
    creditCash: number;
    creditInstallment: number;
    pix: number;
}

export interface IfoodFinancialConfig {
    plan: IfoodPlan;
    commission: number;
    paymentFee: number;
    monthlyFee: number;
    payoutModel: IfoodPayoutModel;
    anticipationFee: number;
}

export interface FinancialSettingsState {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}
