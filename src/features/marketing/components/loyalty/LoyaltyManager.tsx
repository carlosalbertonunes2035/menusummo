import React from 'react';
import { Sparkles } from 'lucide-react';
import { LoyaltyManagerProps } from './types';
import { useLoyalty } from './useLoyalty';

export const LoyaltyManager: React.FC<LoyaltyManagerProps> = ({
    localSettings,
    handleSettingsChange
}) => {
    const { loyalty, simulation, currencyName } = useLoyalty(localSettings);

    const labelClass = "text-xs font-bold text-slate-500 uppercase mb-1 block";
    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-slate-800 placeholder-slate-400 transition-colors";
    const cardClass = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4";

    return (
        <div className="space-y-6">
            <div className={cardClass}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <Sparkles size={20} className="text-amber-500" /> Programa de Fidelidade
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Transforme clientes eventuais em fãs recorrentes com cashback automático.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="loyalty.enabled"
                                checked={loyalty.enabled}
                                onChange={handleSettingsChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className="text-xs font-bold text-gray-500">{loyalty.enabled ? 'ATIVO' : 'INATIVO'}</span>
                    </div>
                </div>

                {loyalty.enabled && (
                    <div className="mt-6 space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Branding */}
                            <div className="space-y-4">
                                <h5 className="font-bold text-gray-700 text-sm border-b pb-2">Identidade do Programa</h5>
                                <div>
                                    <label className={labelClass}>Nome da Moeda</label>
                                    <input
                                        type="text"
                                        name="loyalty.branding.name"
                                        value={loyalty.branding?.name || ''}
                                        onChange={handleSettingsChange}
                                        className={inputClass}
                                        placeholder="Ex: Moedas, Pontos, Cashback"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Cor do Cartão</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            name="loyalty.branding.color"
                                            value={loyalty.branding?.color || '#FFD700'}
                                            onChange={handleSettingsChange}
                                            className="h-10 w-16 p-1 rounded-lg border cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-400">Cor usada no cartão digital do cliente.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Math */}
                            <div className="space-y-4">
                                <h5 className="font-bold text-gray-700 text-sm border-b pb-2">Regras de Ganho & Uso</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Pontos por R$ 1,00</label>
                                        <input
                                            type="number"
                                            name="loyalty.pointsPerCurrency"
                                            value={loyalty.pointsPerCurrency}
                                            onChange={handleSettingsChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Ganha X pontos a cada Real gasto.</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Valor de 100 Pontos (R$)</label>
                                        <input
                                            type="number"
                                            name="loyalty.cashbackValuePer100Points"
                                            value={loyalty.cashbackValuePer100Points}
                                            onChange={handleSettingsChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Quanto vale o resgate.</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Mínimo para Resgate (Pontos)</label>
                                        <input
                                            type="number"
                                            name="loyalty.minRedemptionPoints"
                                            value={loyalty.minRedemptionPoints}
                                            onChange={handleSettingsChange}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Simulator Preview */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white/50 uppercase mb-2">Simulação para o Cliente</p>
                                <p className="text-lg">
                                    "Se eu gastar <span className="text-green-400 font-bold">R$ 100,00</span>, ganho <span className="text-amber-400 font-bold">{simulation.earnedPoints} {currencyName}</span>."
                                </p>
                                <p className="text-sm mt-1 text-white/70">
                                    Isso equivale a <span className="font-bold text-white">R$ {simulation.discountValue}</span> de desconto futuro.
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[200px] text-center">
                                <p className="text-xs font-bold text-white/60 uppercase">Cashback Efetivo</p>
                                <p className="text-3xl font-black text-amber-400">
                                    {simulation.effectiveCashback}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
