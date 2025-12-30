import React from 'react';
import { CreditCard, Info } from 'lucide-react';
import { StoreSettings } from '../../../../types';

interface PaymentRatesCardProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onProviderChange: (provider: string) => void;
    onApplyPresets: () => void;
}

export const PaymentRatesCard: React.FC<PaymentRatesCardProps> = ({
    settings, onChange, onProviderChange, onApplyPresets
}) => {
    const provider = settings.financial?.payment?.provider || 'CUSTOM';

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" /> Maquininha & Cartões
                </h3>
                {provider !== 'CUSTOM' && (
                    <button
                        onClick={onApplyPresets}
                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                        Recarregar Taxas Padrão
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Provedor Principal</label>
                    <select
                        name="financial.payment.provider"
                        value={provider}
                        onChange={(e) => onProviderChange(e.target.value)}
                        className="w-full p-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-gray-700 transition"
                    >
                        <option value="CUSTOM">Outro / Personalizado</option>
                        <option value="STONE">Stone</option>
                        <option value="MERCADO_PAGO">Mercado Pago</option>
                        <option value="REDE">Rede (Itaú)</option>
                        <option value="CIELO">Cielo</option>
                        <option value="PAGSEGURO">PagSeguro</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Débito (%)', name: 'financial.payment.rates.debit', value: settings.financial?.payment?.rates?.debit },
                        { label: 'Crédito à Vista (%)', name: 'financial.payment.rates.creditCash', value: settings.financial?.payment?.rates?.creditCash },
                        { label: 'Crédito Parc. (Médio)', name: 'financial.payment.rates.creditInstallment', value: settings.financial?.payment?.rates?.creditInstallment },
                        { label: 'Pix (%)', name: 'financial.payment.rates.pix', value: settings.financial?.payment?.rates?.pix }
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">{field.label}</label>
                            <div className="relative">
                                <input
                                    type="number" step="0.01"
                                    name={field.name}
                                    value={field.value ?? 0}
                                    onChange={onChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none font-bold text-gray-800 transition"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p>
                        Usaremos a média destas taxas para calcular o custo financeiro aproximado nas vendas de balcão (PDV).
                    </p>
                </div>
            </div>
        </div>
    );
};
