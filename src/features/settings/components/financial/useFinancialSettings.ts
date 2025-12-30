import React from 'react';
import { StoreSettings } from '../../../../types';
import { PaymentProvider, IfoodPlan, IfoodPayoutModel } from './types';

export const PROVIDER_PRESETS = {
    'STONE': { debit: 1.29, creditCash: 3.11, creditInstallment: 5.41, pix: 0 },
    'MERCADO_PAGO': { debit: 1.65, creditCash: 3.55, creditInstallment: 13.79, pix: 0.49 },
    'REDE': { debit: 0.97, creditCash: 2.99, creditInstallment: 5.48, pix: 0 },
    'CIELO': { debit: 1.90, creditCash: 4.30, creditInstallment: 7.70, pix: 0.70 },
    'PAGSEGURO': { debit: 1.99, creditCash: 4.99, creditInstallment: 22.59, pix: 0 },
    'CUSTOM': { debit: 0, creditCash: 0, creditInstallment: 0, pix: 0 }
};

export const IFOOD_PLANS = {
    'BASIC': { commission: 12, paymentFee: 3.2, monthlyFee: 130.00, label: 'Plano Básico (Logística Própria)' },
    'DELIVERY': { commission: 23, paymentFee: 3.2, monthlyFee: 150.00, label: 'Plano Entrega (Logística iFood)' }
};

export function useFinancialSettings(settings: StoreSettings, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {

    const handleProviderChange = (provider: string) => {
        onChange({
            target: { name: 'financial.payment.provider', value: provider }
        } as React.ChangeEvent<HTMLSelectElement>);

        const preset = PROVIDER_PRESETS[provider as PaymentProvider];
        if (preset) {
            setTimeout(() => {
                onChange({ target: { name: 'financial.payment.rates.debit', value: preset.debit.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.creditCash', value: preset.creditCash.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.creditInstallment', value: preset.creditInstallment.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.pix', value: preset.pix.toString() } } as any);
            }, 50);
        }
    };

    const applyProviderRates = () => {
        const provider = settings.financial?.payment?.provider || 'CUSTOM';
        const preset = PROVIDER_PRESETS[provider as PaymentProvider];
        if (!preset) return;

        onChange({ target: { name: 'financial.payment.rates.debit', value: preset.debit.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.creditCash', value: preset.creditCash.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.creditInstallment', value: preset.creditInstallment.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.pix', value: preset.pix.toString() } } as any);
    };

    const applyiFoodPlan = (plan: IfoodPlan) => {
        const p = IFOOD_PLANS[plan];
        onChange({ target: { name: 'financial.ifood.plan', value: plan } } as any);
        onChange({ target: { name: 'financial.ifood.commission', value: p.commission.toString() } } as any);
        onChange({ target: { name: 'financial.ifood.paymentFee', value: p.paymentFee.toString() } } as any);
        onChange({ target: { name: 'financial.ifood.monthlyFee', value: p.monthlyFee.toString() } } as any);
    };

    const handleIfoodPayoutModelChange = (model: IfoodPayoutModel) => {
        onChange({ target: { name: 'financial.ifood.payoutModel', value: model } } as any);
        if (model === 'MONTHLY') {
            onChange({ target: { name: 'financial.ifood.anticipationFee', value: '0' } } as any);
        } else if (model === 'WEEKLY' && !settings.financial?.ifood?.anticipationFee) {
            onChange({ target: { name: 'financial.ifood.anticipationFee', value: '2.5' } } as any);
        }
    };

    return {
        handleProviderChange,
        applyProviderRates,
        applyiFoodPlan,
        handleIfoodPayoutModelChange
    };
}
