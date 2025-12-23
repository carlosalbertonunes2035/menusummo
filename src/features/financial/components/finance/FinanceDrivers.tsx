
import React, { memo } from 'react';
import { Order } from '../../../../types';
import { Bike } from 'lucide-react';

interface FinanceDriversProps {
    orders: Order[];
}

const FinanceDrivers: React.FC<FinanceDriversProps> = ({ orders }) => {
    // Extract unique driver IDs from filtered orders
    const driverIds: string[] = Array.from(new Set(orders.map(o => o.driverId).filter((id): id is string => !!id)));

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bike size={20} className="text-summo-primary" /> Acerto com Entregadores
            </h3>
            <p className="text-sm text-gray-500 mb-6">Simulação de valores a pagar baseado nas entregas realizadas no período selecionado.</p>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr className="text-xs text-gray-500 uppercase">
                            <th className="p-4">Motoboy</th>
                            <th className="p-4 text-center">Entregas</th>
                            <th className="p-4 text-right">Total Taxas</th>
                            <th className="p-4 text-right">A Pagar (Est.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {driverIds.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhuma entrega registrada no período.</td></tr>
                        ) : driverIds.map((driverId) => {
                            const driverOrders = orders.filter(o => o.driverId === driverId);
                            const deliveryCount = driverOrders.length;
                            const estimatedFee = deliveryCount * 5.00; // Mock fee calculation
                            return (
                                <tr key={driverId} className="border-b border-gray-50 hover:bg-gray-50 render-auto">
                                    <td className="p-4 font-bold text-gray-700">ID: {driverId.slice(0, 6)}...</td>
                                    <td className="p-4 text-center">{deliveryCount}</td>
                                    <td className="p-4 text-right font-mono">R$ {estimatedFee.toFixed(2)}</td>
                                    <td className="p-4 text-right font-mono text-red-500 font-bold">R$ {estimatedFee.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(FinanceDrivers);
