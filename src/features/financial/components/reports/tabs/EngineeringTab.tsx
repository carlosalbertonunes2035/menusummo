import React, { useMemo } from 'react';
import { Order, Product } from '@/types';
import { calculateMenuEngineering, BostonMetrics } from '@/features/financial/services/analyticsService';
import BostonMatrixChart from '../BostonMatrixChart';

interface EngineeringTabProps {
    orders: Order[];
    products: Product[];
}

const EngineeringTab: React.FC<EngineeringTabProps> = ({ orders, products }) => {
    const analyticsData = useMemo(() => {
        return calculateMenuEngineering(orders, products);
    }, [orders, products]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Matriz de Engenharia (BCG)</h3>
                        <p className="text-sm text-gray-500">Análise de Popularidade x Lucratividade</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-400 font-bold uppercase">Base de Análise</span>
                        <p className="text-lg font-bold text-summo-primary">{orders.length} pedidos</p>
                    </div>
                </div>
                <BostonMatrixChart data={analyticsData.metrics} thresholds={analyticsData.thresholds} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-emerald-500">
                    <h4 className="font-bold text-emerald-600 mb-1">⭐ Estrelas</h4>
                    <p className="text-xs text-gray-500 mb-2">Alta Venda / Alta Margem</p>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {analyticsData.metrics.filter((m: BostonMetrics) => m.quadrant === 'STAR').map((m: BostonMetrics) => (
                            <div key={m.productId} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                <span>{m.productName}</span>
                                <span className="font-bold">{m.totalSold}un</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-amber-500">
                    <h4 className="font-bold text-amber-600 mb-1">🐮 Vacas Leiteiras</h4>
                    <p className="text-xs text-gray-500 mb-2">Alta Venda / Baixa Margem</p>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {analyticsData.metrics.filter((m: BostonMetrics) => m.quadrant === 'CASH_COW').map((m: BostonMetrics) => (
                            <div key={m.productId} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                <span>{m.productName}</span>
                                <span className="font-bold">{m.totalSold}un</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-violet-500">
                    <h4 className="font-bold text-violet-600 mb-1">? Quebra-Cabeça</h4>
                    <p className="text-xs text-gray-500 mb-2">Baixa Venda / Alta Margem</p>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {analyticsData.metrics.filter((m: BostonMetrics) => m.quadrant === 'PUZZLE').map((m: BostonMetrics) => (
                            <div key={m.productId} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                <span>{m.productName}</span>
                                <span className="font-bold">{m.totalSold}un</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-red-500">
                    <h4 className="font-bold text-red-600 mb-1">🐕 Cães</h4>
                    <p className="text-xs text-gray-500 mb-2">Baixa Venda / Baixa Margem</p>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {analyticsData.metrics.filter((m: BostonMetrics) => m.quadrant === 'DOG').map((m: BostonMetrics) => (
                            <div key={m.productId} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                <span>{m.productName}</span>
                                <span className="font-bold">{m.totalSold}un</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngineeringTab;
