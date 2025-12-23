
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { BostonMetrics } from '@/features/financial/services/analyticsService';

interface BostonMatrixChartProps {
    data: BostonMetrics[];
    thresholds: { avgPopularity: number, avgMargin: number };
}

const QUADRANT_COLORS = {
    'STAR': '#10B981',      // Emerald 500
    'CASH_COW': '#F59E0B',  // Amber 500
    'PUZZLE': '#8B5CF6',    // Violet 500
    'DOG': '#EF4444'        // Red 500
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as BostonMetrics;
        return (
            <div className="bg-white p-4 border-0 shadow-2xl rounded-2xl text-sm z-50 min-w-[200px] ring-1 ring-black/5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[data.quadrant as keyof typeof QUADRANT_COLORS] }}></div>
                    <p className="font-bold text-gray-800">{data.productName}</p>
                </div>
                <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                        <span>Vendas:</span>
                        <span className="font-mono font-bold text-gray-900">{data.totalSold}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Margem:</span>
                        <span className="font-mono font-bold text-gray-900">{data.averageMargin.toFixed(1)}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic border-t pt-2">{data.recommendation}</p>
                </div>
            </div>
        );
    }
    return null;
};

const BostonMatrixChart: React.FC<BostonMatrixChartProps> = ({ data, thresholds }) => {
    const chartData = data.filter(d => d.totalSold > 0 || d.quadrant === 'PUZZLE');

    // Dynamic domains for better centering
    const maxSales = Math.max(...chartData.map(d => d.totalSold), thresholds.avgPopularity * 1.5) * 1.1;
    const maxMargin = 100;

    return (
        <div className="w-full h-[500px] relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Modern Quadrant Backgrounds */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                {/* Top Left: PUZZLE (High Margin, Low Sales) */}
                <div className="bg-gradient-to-br from-violet-50 to-white flex flex-col items-center justify-center border-r border-b border-dashed border-gray-200">
                    <span className="text-violet-200 font-black text-5xl opacity-20 rotate-12 select-none">?</span>
                    <span className="text-violet-400 text-xs font-bold uppercase tracking-widest mt-2">Quebra-Cabeça</span>
                </div>

                {/* Top Right: STAR (High Margin, High Sales) */}
                <div className="bg-gradient-to-bl from-emerald-50 to-white flex flex-col items-center justify-center border-b border-dashed border-gray-200">
                    <span className="text-emerald-200 font-black text-5xl opacity-20 select-none">★</span>
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-2">Estrela</span>
                </div>

                {/* Bottom Left: DOG (Low Margin, Low Sales) */}
                <div className="bg-gradient-to-tr from-red-50 to-white flex flex-col items-center justify-center border-r border-dashed border-gray-200">
                    <span className="text-red-200 font-black text-5xl opacity-20 -rotate-12 select-none">🐕</span>
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest mt-2">Cão</span>
                </div>

                {/* Bottom Right: CASH COW (Low Margin, High Sales) */}
                <div className="bg-gradient-to-tl from-amber-50 to-white flex flex-col items-center justify-center">
                    <span className="text-amber-200 font-black text-5xl opacity-20 select-none">$</span>
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mt-2">Vaca Leiteira</span>
                </div>
            </div>

            <div className="absolute inset-0 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <XAxis
                            type="number"
                            dataKey="averageMargin"
                            name="Margem"
                            unit="%"
                            domain={[0, maxMargin]}
                            hide
                        />
                        <YAxis
                            type="number"
                            dataKey="totalSold"
                            name="Vendas"
                            domain={[0, maxSales]}
                            hide
                        />
                        <ZAxis type="number" range={[100, 600]} /> {/* Bubble size */}
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                        {/* Threshold Lines - Invisible but functional for logic, we use CSS grid for visuals now */}
                        <ReferenceLine x={thresholds.avgMargin} stroke="transparent" />
                        <ReferenceLine y={thresholds.avgPopularity} stroke="transparent" />

                        <Scatter name="Produtos" data={chartData} isAnimationActive={true}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={QUADRANT_COLORS[entry.quadrant as keyof typeof QUADRANT_COLORS]}
                                    stroke="#fff"
                                    strokeWidth={3}
                                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Axis Labels Overlay */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Margem de Lucro →</div>
            <div className="absolute left-2 top-0 bottom-0 flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Volume de Vendas →</div>
        </div>
    );
};

export default BostonMatrixChart;
