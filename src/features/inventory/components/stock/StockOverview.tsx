import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Clock, DollarSign,
    ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { useData } from '../../../../contexts/DataContext';
import { formatCurrency } from '../../../../lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export const StockOverview: React.FC = () => {
    const { ingredients } = useData();

    // 1. Calculations
    const totalStockValue = useMemo(() => {
        return ingredients.reduce((acc, ing) => acc + (ing.currentStock * (ing.costPerUnit || 0)), 0);
    }, [ingredients]);

    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        ingredients.forEach(ing => {
            const cat = ing.category || 'Outros';
            const value = ing.currentStock * (ing.costPerUnit || 0);
            categories[cat] = (categories[cat] || 0) + value;
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [ingredients]);

    const lowStockItems = useMemo(() => {
        return ingredients.filter(ing => ing.currentStock <= ing.minStock).length;
    }, [ingredients]);

    const criticalValuePercent = useMemo(() => {
        // Mock percentage for demo - in real life would compare with last month
        return 12.5;
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Capital Investido</p>
                    <h3 className="text-2xl font-black text-gray-800">{formatCurrency(totalStockValue)}</h3>
                    <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>+{criticalValuePercent}% vs mês ant.</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={80} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Risco de Ruptura</p>
                    <h3 className="text-2xl font-black text-gray-800">{lowStockItems} itens</h3>
                    <div className="mt-2 flex items-center gap-1 text-red-500 text-xs font-bold">
                        <Clock size={14} />
                        <span>Ação imediata sugerida</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Giro Médio</p>
                    <h3 className="text-2xl font-black text-gray-800">4.2x</h3>
                    <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs font-bold">
                        <span>Saudável para o setor</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-blue-100 bg-blue-50/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-blue-200 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Sparkles size={80} />
                    </div>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Potencial Lead Time</p>
                    <h3 className="text-2xl font-black text-blue-700">3.5 dias</h3>
                    <div className="mt-2 text-blue-600 text-[10px] font-bold">
                        IA analisando tendências...
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CHART: DISTRIBUTION */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-summo-primary" />
                        Distribuição Financeira por Categoria
                    </h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    formatter={(value: any) => [formatCurrency(value as number), 'Valor']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#6366f1"
                                    radius={[0, 10, 10, 0]}
                                    barSize={24}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI INSIGHTS CARD */}
                <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-summo-primary/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-summo-primary">
                            <Sparkles size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">Summo AI Insights</span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition rotate-1 group cursor-pointer">
                                <p className="text-yellow-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Alerta de Custo
                                </p>
                                <p className="text-sm font-medium leading-tight">O preço da <b>Carne Bovina</b> subiu 15% nos últimos 30 dias. Sugerimos revisar o preço no cardápio.</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition -rotate-1 group cursor-pointer">
                                <p className="text-blue-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                    <Clock size={10} /> Otimização
                                </p>
                                <p className="text-sm font-medium leading-tight">Itens de <b>Hortifruti</b> estão vencendo em 2 dias. Ative uma promoção no PDV para evitar perdas.</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition rotate-1 group cursor-pointer">
                                <p className="text-green-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                    <TrendingUp size={10} /> Eficiência
                                </p>
                                <p className="text-sm font-medium leading-tight">Seu estoque de <b>Bebidas</b> está 20% acima do necessário para sua média de vendas semanal.</p>
                            </div>
                        </div>

                        <button className="mt-8 w-full py-3 bg-white text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition shadow-lg">
                            Ver Relatório Completo <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
