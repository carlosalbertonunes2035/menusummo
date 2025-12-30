import React from 'react';
import { ShoppingBag, Info } from 'lucide-react';
import { StoreSettings } from '../../../../types';
import { IfoodPlan, IfoodPayoutModel } from './types';

interface IfoodSettingsCardProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onApplyIfoodPlan: (plan: IfoodPlan) => void;
    onPayoutModelChange: (model: IfoodPayoutModel) => void;
}

export const IfoodSettingsCard: React.FC<IfoodSettingsCardProps> = ({
    settings, onChange, onApplyIfoodPlan, onPayoutModelChange
}) => {
    const ifood = settings.financial?.ifood;

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag size={20} className="text-red-600" /> iFood & Delivery
            </h3>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Plano iFood</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { id: 'BASIC', label: 'Básico', sub: 'Logística do Restaurante' },
                                { id: 'DELIVERY', label: 'Entrega', sub: 'Logística iFood' }
                            ].map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => onApplyIfoodPlan(plan.id as IfoodPlan)}
                                    className={`p-3 rounded-xl border-2 text-left transition ${ifood?.plan === plan.id ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">{plan.label}</span>
                                    <span className="text-[11px] text-gray-500">{plan.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Modelo de Repasse</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { id: 'MONTHLY', label: 'Mensal (30 Dias)', sub: 'Sem taxas de antecipação.', color: 'emerald' },
                                { id: 'WEEKLY', label: 'Semanal (7 Dias)', sub: 'Repasse acelerado.', color: 'orange' }
                            ].map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => onPayoutModelChange(model.id as IfoodPayoutModel)}
                                    className={`p-3 rounded-xl border-2 text-left transition ${ifood?.payoutModel === model.id ? `border-${model.color}-500 bg-${model.color}-50` : `border-gray-100 hover:border-${model.color}-200`}`}
                                >
                                    <span className="font-bold text-sm text-gray-800 block">{model.label}</span>
                                    <span className="text-[11px] text-gray-500">{model.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Comissão (%)</label>
                        <div className="relative">
                            <input
                                type="number" step="0.01"
                                name="financial.ifood.commission"
                                value={ifood?.commission ?? 0}
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
                                value={ifood?.paymentFee ?? 0}
                                onChange={onChange}
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-red-500 border-2 outline-none font-bold text-gray-800 transition"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                        </div>
                    </div>
                    <div className={ifood?.payoutModel === 'WEEKLY' ? 'opacity-100' : 'opacity-40 grayscale'}>
                        <label className="text-xs font-bold text-orange-500 uppercase block mb-1">Antecipação (%)</label>
                        <div className="relative">
                            <input
                                type="number" step="0.01"
                                name="financial.ifood.anticipationFee"
                                disabled={ifood?.payoutModel !== 'WEEKLY'}
                                value={ifood?.anticipationFee ?? 0}
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
                                value={ifood?.monthlyFee ?? 0}
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
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
