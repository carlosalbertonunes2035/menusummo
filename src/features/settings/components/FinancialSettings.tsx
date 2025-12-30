import React from 'react';
import { StoreSettings } from '@/types';
import { DollarSign } from 'lucide-react';
import { useFinancialSettings } from './financial/useFinancialSettings';
import { PaymentRatesCard } from './financial/PaymentRatesCard';
import { AcceptedPaymentsCard } from './financial/AcceptedPaymentsCard';
import { IfoodSettingsCard } from './financial/IfoodSettingsCard';
import { OperationalCostsCard } from './financial/OperationalCostsCard';

interface FinancialSettingsProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const FinancialSettings: React.FC<FinancialSettingsProps> = ({ settings, onChange }) => {
    const {
        handleProviderChange,
        applyProviderRates,
        applyiFoodPlan,
        handleIfoodPayoutModelChange
    } = useFinancialSettings(settings, onChange);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <DollarSign size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Inteligência Financeira</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Configure suas taxas reais para que o "Raio-X do Produto" mostre seu lucro verdadeiro.
                        As taxas configuradas aqui serão descontadas automaticamente nos cálculos de margem.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Taxas de Maquininha (POS) */}
                <PaymentRatesCard
                    settings={settings}
                    onChange={onChange}
                    onProviderChange={handleProviderChange}
                    onApplyPresets={applyProviderRates}
                />
            </div>

            {/* 1.1 Meios de Pagamento Aceitos */}
            <AcceptedPaymentsCard
                settings={settings}
                onChange={onChange}
            />

            {/* 2. Taxas iFood */}
            <IfoodSettingsCard
                settings={settings}
                onChange={onChange}
                onApplyIfoodPlan={applyiFoodPlan}
                onPayoutModelChange={handleIfoodPayoutModelChange}
            />

            {/* 3. Custos Fixos Gerais */}
            <OperationalCostsCard
                settings={settings}
                onChange={onChange}
            />
        </div>
    );
};
