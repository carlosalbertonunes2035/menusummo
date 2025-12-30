import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StoreSettings } from '../../../../types';

interface OperationalCostsCardProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const OperationalCostsCard: React.FC<OperationalCostsCardProps> = ({ settings, onChange }) => {
    const financial = settings.financial;

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
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
                            value={financial?.taxRate ?? 0}
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
                            value={financial?.fixedCostRate ?? 0}
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
                            value={financial?.packagingAvgCost ?? 0}
                            onChange={onChange}
                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 border-2 outline-none font-bold text-gray-800 transition"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Valor padrão caso o produto não tenha embalagem na ficha técnica.</p>
                </div>
            </div>
        </div>
    );
};
