import React, { useEffect } from 'react';
import { StoreSettings } from '@/types';
import { DollarSign, CreditCard, ShoppingBag, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Select } from '@/components/ui/Select'; // Assuming this exists, or use native select

// Presets based on 2024/2025 research
const PROVIDER_PRESETS = {
    'STONE': { debit: 1.29, creditCash: 3.11, creditInstallment: 5.41, pix: 0 },
    'MERCADO_PAGO': { debit: 1.65, creditCash: 3.55, creditInstallment: 13.79, pix: 0.49 },
    'REDE': { debit: 0.97, creditCash: 2.99, creditInstallment: 5.48, pix: 0 }, // Approx installment
    'CIELO': { debit: 1.90, creditCash: 4.30, creditInstallment: 7.70, pix: 0.70 },
    'PAGSEGURO': { debit: 1.99, creditCash: 4.99, creditInstallment: 22.59, pix: 0 }, // Standard plan
    'CUSTOM': { debit: 0, creditCash: 0, creditInstallment: 0, pix: 0 }
};

const IFOOD_PLANS = {
    'BASIC': { commission: 12, paymentFee: 3.2, monthlyFee: 130.00, label: 'Plano Básico (Logística Própria)' },
    'DELIVERY': { commission: 23, paymentFee: 3.2, monthlyFee: 150.00, label: 'Plano Entrega (Logística iFood)' }
};

interface FinancialSettingsProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const FinancialSettings: React.FC<FinancialSettingsProps> = ({ settings, onChange }) => {

    // Auto-fill rates when provider changes
    // Auto-fill rates when provider changes
    const handleProviderChange = (provider: string) => {
        // 1. Set the provider
        onChange({
            target: { name: 'financial.payment.provider', value: provider }
        } as React.ChangeEvent<HTMLSelectElement>);

        // 2. Auto-apply rates if preset exists
        const preset = PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS];
        if (preset) {
            // Emulate multiple field updates. 
            // Since onChange updates state in parent, doing this sequentially relies on the parent safely handling rapid updates.
            // If the parent uses `setLocalSettings(prev => ...)` it is safe.
            setTimeout(() => {
                onChange({ target: { name: 'financial.payment.rates.debit', value: preset.debit.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.creditCash', value: preset.creditCash.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.creditInstallment', value: preset.creditInstallment.toString() } } as any);
                onChange({ target: { name: 'financial.payment.rates.pix', value: preset.pix.toString() } } as any);
            }, 50); // Small delay to ensure the provider update propagates or at least doesn't race condition poorly in UI
        }
    };

    const applyProviderRates = () => {
        const provider = settings.financial?.payment?.provider || 'CUSTOM';
        const preset = PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS];
        if (!preset) return;

        onChange({ target: { name: 'financial.payment.rates.debit', value: preset.debit.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.creditCash', value: preset.creditCash.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.creditInstallment', value: preset.creditInstallment.toString() } } as any);
        onChange({ target: { name: 'financial.payment.rates.pix', value: preset.pix.toString() } } as any);
    };

    const applyiFoodPlan = (plan: 'BASIC' | 'DELIVERY') => {
        const p = IFOOD_PLANS[plan];
        onChange({ target: { name: 'financial.ifood.plan', value: plan } } as any);
        onChange({ target: { name: 'financial.ifood.commission', value: p.commission.toString() } } as any);
        onChange({ target: { name: 'financial.ifood.paymentFee', value: p.paymentFee.toString() } } as any);
        onChange({ target: { name: 'financial.ifood.monthlyFee', value: p.monthlyFee.toString() } } as any);
    };

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
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard size={20} className="text-blue-600" /> Maquininha & Cartões
                        </h3>
                        {settings.financial?.payment?.provider && settings.financial.payment.provider !== 'CUSTOM' && (
                            <button
                                onClick={applyProviderRates}
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
                                value={settings.financial?.payment?.provider || 'CUSTOM'}
                                onChange={(e) => handleProviderChange(e.target.value)}
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
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Débito (%)</label>
                                <div className="relative">
                                    <input
                                        type="number" step="0.01"
                                        name="financial.payment.rates.debit"
                                        value={settings.financial?.payment?.rates?.debit ?? 0}
                                        onChange={onChange}
                                        className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none font-bold text-gray-800 transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Crédito à Vista (%)</label>
                                <div className="relative">
                                    <input
                                        type="number" step="0.01"
                                        name="financial.payment.rates.creditCash"
                                        value={settings.financial?.payment?.rates?.creditCash ?? 0}
                                        onChange={onChange}
                                        className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none font-bold text-gray-800 transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Crédito Parc. (Médio)</label>
                                <div className="relative">
                                    <input
                                        type="number" step="0.01"
                                        name="financial.payment.rates.creditInstallment"
                                        value={settings.financial?.payment?.rates?.creditInstallment ?? 0}
                                        onChange={onChange}
                                        className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none font-bold text-gray-800 transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Pix (%)</label>
                                <div className="relative">
                                    <input
                                        type="number" step="0.01"
                                        name="financial.payment.rates.pix"
                                        value={settings.financial?.payment?.rates?.pix ?? 0}
                                        onChange={onChange}
                                        className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none font-bold text-gray-800 transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p>
                                Usaremos a média destas taxas para calcular o custo financeiro aproximado nas vendas de balcão (PDV).
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* 1.1 Meios de Pagamento Aceitos (NEW MERGED SECTION) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" /> Meios de Pagamento e Destinos
                </h3>

                <div className="space-y-4">
                    {/* Dinheiro & Pix */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="font-bold text-gray-700 text-sm">Dinheiro (Espécie)</span>
                            <div className="flex items-center gap-3">
                                {/* Destination Account Selector for Cash */}
                                <select
                                    name="financial.payment.destinations.cash"
                                    value={(settings.financial?.payment as any)?.destinations?.cash || ''}
                                    onChange={onChange}
                                    className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                                >
                                    <option value="">Selecione o Destino...</option>
                                    {(settings.bankAccounts || []).filter(a => a.accountType === 'CASH_DRAWER' || a.accountType === 'WALLET').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="payment.acceptCash" checked={settings.payment?.acceptCash || false} onChange={onChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700 text-sm">Pix</span>
                                <div className="flex items-center gap-3">
                                    <select
                                        name="financial.payment.destinations.pix"
                                        value={(settings.financial?.payment as any)?.destinations?.pix || ''}
                                        onChange={onChange}
                                        className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Conta de Destino...</option>
                                        {(settings.bankAccounts || []).filter(a => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS').map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="payment.acceptPix" checked={settings.payment?.acceptPix || false} onChange={onChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>
                            {settings.payment?.acceptPix && (
                                <div className="animate-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        name="payment.pixKey"
                                        value={settings.payment?.pixKey || ''}
                                        onChange={onChange}
                                        placeholder="Chave Pix (CPF, CNPJ, Email...)"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500 transition"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bandeiras & Vales */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-700 text-sm">Cartões de Crédito/Débito</span>
                            <div className="flex items-center gap-3">
                                <select
                                    name="financial.payment.destinations.card"
                                    value={(settings.financial?.payment as any)?.destinations?.card || ''}
                                    onChange={onChange}
                                    className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                                >
                                    <option value="">Conta de Recebimento...</option>
                                    {(settings.bankAccounts || []).filter(a => a.accountType === 'CHECKING').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="payment.acceptCard" checked={settings.payment?.acceptCard || false} onChange={onChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`grid grid-cols-2 gap-2 ${!settings.payment?.acceptCard ? 'opacity-50 pointer-events-none' : ''}`}>
                            {['visa', 'mastercard', 'elo', 'amex', 'hipercard'].map(brand => (
                                <label key={brand} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 cursor-pointer hover:bg-white transition">
                                    <input type="checkbox" name={`payment.brands.${brand}`} checked={(settings.payment?.brands as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-blue-500" />
                                    <span className="capitalize">{brand}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-700 text-sm">Vales Refeição</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="payment.acceptVouchers" checked={settings.payment?.acceptVouchers || false} onChange={onChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div className={`grid grid-cols-2 gap-2 ${!settings.payment?.acceptVouchers ? 'opacity-50 pointer-events-none' : ''}`}>
                            {['alelo', 'ticket', 'sodexo', 'vr'].map(brand => (
                                <label key={brand} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 cursor-pointer hover:bg-white transition">
                                    <input type="checkbox" name={`payment.vouchers.${brand}`} checked={(settings.payment?.vouchers as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-blue-500" />
                                    <span className="capitalize">{brand}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Taxas iFood */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-red-600" /> iFood & Delivery
                    </h3>
                </div>

                <div className="space-y-6">
                    {/* Plano & Repasse */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Plano iFood</label>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => applyiFoodPlan('BASIC')}
                                    className={`p-3 rounded-xl border-2 text-left transition ${settings.financial?.ifood?.plan === 'BASIC' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">Básico</span>
                                    <span className="text-[11px] text-gray-500">Logística do Restaurante</span>
                                </button>
                                <button
                                    onClick={() => applyiFoodPlan('DELIVERY')}
                                    className={`p-3 rounded-xl border-2 text-left transition ${settings.financial?.ifood?.plan === 'DELIVERY' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">Entrega</span>
                                    <span className="text-[11px] text-gray-500">Logística iFood (Entregador Parceiro)</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Modelo de Repasse</label>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        onChange({ target: { name: 'financial.ifood.payoutModel', value: 'MONTHLY' } } as any);
                                        onChange({ target: { name: 'financial.ifood.anticipationFee', value: '0' } } as any);
                                    }}
                                    className={`p-3 rounded-xl border-2 text-left transition ${settings.financial?.ifood?.payoutModel === 'MONTHLY' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">Mensal (30 Dias)</span>
                                    <span className="text-[11px] text-gray-500">Sem taxas de antecipação.</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onChange({ target: { name: 'financial.ifood.payoutModel', value: 'WEEKLY' } } as any);
                                        // Suggest 2.5% if switching to weekly and currently 0
                                        if (!settings.financial?.ifood?.anticipationFee) {
                                            onChange({ target: { name: 'financial.ifood.anticipationFee', value: '2.5' } } as any);
                                        }
                                    }}
                                    className={`p-3 rounded-xl border-2 text-left transition ${settings.financial?.ifood?.payoutModel === 'WEEKLY' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">Semanal (7 Dias)</span>
                                    <span className="text-[11px] text-gray-500">Repasse acelerado (iFood Pago).</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Taxas Detalhadas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Comissão (%)</label>
                            <div className="relative">
                                <input
                                    type="number" step="0.01"
                                    name="financial.ifood.commission"
                                    value={settings.financial?.ifood?.commission ?? 0}
                                    onChange={onChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-red-500 border-2 outline-none font-bold text-gray-800 transition"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Taxa Pagto. (%)</label>
                            <div className="relative">
                                <input
                                    type="number" step="0.01"
                                    name="financial.ifood.paymentFee"
                                    value={settings.financial?.ifood?.paymentFee ?? 0}
                                    onChange={onChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-red-500 border-2 outline-none font-bold text-gray-800 transition"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                            </div>
                        </div>
                        <div className={settings.financial?.ifood?.payoutModel === 'WEEKLY' ? 'opacity-100' : 'opacity-40 grayscale'}>
                            <label className="text-xs font-bold text-orange-500 uppercase block mb-1">Antecipação (%)</label>
                            <div className="relative">
                                <input
                                    type="number" step="0.01"
                                    name="financial.ifood.anticipationFee"
                                    disabled={settings.financial?.ifood?.payoutModel !== 'WEEKLY'}
                                    value={settings.financial?.ifood?.anticipationFee ?? 0}
                                    onChange={onChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-orange-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none font-bold text-gray-800 transition"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Mensalidade (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                                <input
                                    type="number" step="0.01"
                                    name="financial.ifood.monthlyFee"
                                    value={settings.financial?.ifood?.monthlyFee ?? 0}
                                    onChange={onChange}
                                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-red-500 border-2 outline-none font-bold text-gray-800 transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl flex gap-3 text-slate-600 text-xs border border-slate-100">
                        <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                        <div>
                            <p className="font-bold text-slate-700 mb-1">Estrutura de DRE (Conciliação Futura)</p>
                            <p>
                                O sistema usará estas taxas para calcular o <b>Resultado Líquido Estimado</b>:
                                <br />Venda Bruta - (Comissão + Taxa Pagto + Antecipação) = Receita Líquida.
                                <br />A antecipação é tratada como despesa financeira.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Custos Fixos Gerais */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-orange-500" /> Custos Operacionais Base
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Imposto Simples Nacional (%)</label>
                        <div className="relative">
                            <input
                                type="number" step="0.01"
                                name="financial.taxRate"
                                value={settings.financial?.taxRate ?? 0}
                                onChange={onChange}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none font-bold text-gray-800 transition"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">DAS médio mensal sobre faturamento.</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Custo Fixo Estimado (%)</label>
                        <div className="relative">
                            <input
                                type="number" step="0.01"
                                name="financial.fixedCostRate"
                                value={settings.financial?.fixedCostRate ?? 0}
                                onChange={onChange}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none font-bold text-gray-800 transition"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Aluguel, Luz, Água / Faturamento Médio.</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Custo Médio Embalagem (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                            <input
                                type="number" step="0.01"
                                name="financial.packagingAvgCost"
                                value={settings.financial?.packagingAvgCost ?? 0}
                                onChange={onChange}
                                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none font-bold text-gray-800 transition"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Valor padrão caso o produto não tenha embalagem cadastrada na ficha técnica.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};
