import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, ShoppingBag, Activity } from 'lucide-react';
import { Order } from '../../../../../types';
import { KPICard, GaugeCard } from '../ui/ReportComponents';

interface OverviewTabProps {
    orders: Order[];
}

import { SummoCard } from '@/components/ui/SummoCard';

const OverviewTab: React.FC<OverviewTabProps> = ({ orders }) => {
    const stats = useMemo(() => {
        const revenue = orders.reduce((acc, o) => acc + o.total, 0);
        const cost = orders.reduce((acc, o) => acc + o.cost, 0);
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const orderCount = orders.length;
        const ticket = orderCount > 0 ? revenue / orderCount : 0;
        return { revenue, profit, orderCount, ticket, margin };
    }, [orders]);

    const chartData = useMemo(() => {
        const dailyData: { [key: string]: number } = {};
        orders.forEach(order => {
            const day = new Date(order.createdAt).toLocaleDateString('pt-BR');
            dailyData[day] = (dailyData[day] || 0) + order.total;
        });
        return Object.entries(dailyData).map(([name, venda]) => ({ name, venda }));
    }, [orders]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <SummoCard className="lg:col-span-7 page-break-avoid">
                <h3 className="text-xl font-bold text-summo-dark mb-4">Evolução da Receita</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fill: '#666' }} axisLine={false} />
                            <YAxis tick={{ fill: '#666' }} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#EEE8FF' }}
                                formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                            />
                            <Bar dataKey="venda" name="Receita" fill="#A95BFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SummoCard>
            <div className="lg:col-span-5 grid grid-cols-2 gap-6">
                <KPICard title="Faturamento" value={`R$ ${stats.revenue.toFixed(2)}`} icon={DollarSign} />
                <KPICard title="Pedidos" value={stats.orderCount.toString()} icon={ShoppingBag} />
                <KPICard title="Ticket Médio" value={`R$ ${stats.ticket.toFixed(2)}`} icon={Activity} />
                <GaugeCard label="Margem de Lucro" value={stats.margin} unit="%" />
            </div>
        </div>
    );
};

export default React.memo(OverviewTab);
