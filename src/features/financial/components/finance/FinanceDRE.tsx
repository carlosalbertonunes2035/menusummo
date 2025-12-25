import React, { memo } from 'react';
import { formatCurrency } from '../../../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface FinanceDREProps {
    revenue: number;
    cmv: number;
    expenses: number;
    netProfit: number;
}

const FinanceDRE: React.FC<FinanceDREProps> = ({ revenue, cmv, expenses, netProfit }) => {
    const dreChart = [
        { name: 'Receita Bruta', value: revenue, fill: '#A95BFF' },
        { name: 'Custos (CMV)', value: cmv, fill: '#FFD600' },
        { name: 'Despesas', value: expenses, fill: '#FF3B30' },
        { name: 'Lucro Líquido', value: netProfit, fill: netProfit >= 0 ? '#00E096' : '#FF3B30' }
    ];

    const exportAccountantReport = () => {
        const text = `RELATÓRIO CONTÁBIL - SUCOS DELÍCIA
-----------------------------------
    Data: ${new Date().toLocaleDateString()}

1. RECEITA OPERACIONAL: R$ ${revenue.toFixed(2)}

2. DEDUÇÕES E CUSTOS
    (-) Custo Mercadoria: R$ ${cmv.toFixed(2)}
(-) Despesas Operacionais: R$ ${expenses.toFixed(2)}

3. RESULTADO
    (=) Lucro / Prejuízo: R$ ${netProfit.toFixed(2)}
-----------------------------------
    Gerado pelo SUMMO`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_contabil_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-gray-700 text-lg">DRE Gerencial</h3>
                        <p className="text-xs text-gray-400">Análise de Resultado do Período</p>
                    </div>
                    <button onClick={exportAccountantReport} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Exportar p/ Contador</button>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dreChart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tick={{ fill: '#666', fontSize: 12 }} interval={0} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f5f5f5' }}
                                formatter={(val: any) => `R$ ${Number(val).toFixed(2)} `}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {dreChart.map((entry, index) => <Cell key={`cell - ${index} `} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Resumo Contábil</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Receita</span>
                            <span className="font-mono font-bold text-gray-800">R$ {revenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> CMV (Insumos)</span>
                            <span className="font-mono font-bold text-red-500">- R$ {cmv.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Despesas</span>
                            <span className="font-mono font-bold text-red-500">- R$ {expenses.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-black text-gray-800 uppercase">Resultado</span>
                            <span className={`font - mono font - black text - lg ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'} `}>R$ {netProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className={`p - 5 rounded - 2xl border flex items - center gap - 4 ${netProfit >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'} `}>
                    <div className={`p - 3 rounded - full ${netProfit >= 0 ? 'bg-green-200' : 'bg-red-200'} `}>
                        {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                        <p className="font-bold text-lg">{netProfit >= 0 ? 'Operação Lucrativa' : 'Prejuízo no Período'}</p>
                        <p className="text-xs opacity-80">{netProfit >= 0 ? 'Parabéns! Continue controlando os custos.' : 'Atenção: Revise o CMV e as despesas fixas.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(FinanceDRE);
