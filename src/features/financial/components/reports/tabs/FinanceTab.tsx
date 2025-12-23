import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Order } from '../../../../../types';

interface FinanceTabProps {
    orders: Order[];
    expenses: any[];
}

const ChartCard: React.FC<{ title: string, data: any[], colors: string[], isCurrency: boolean }> = ({ title, data, colors, isCurrency }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-summo-dark mb-4">{title}</h3>
        <div className="h-80 w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const mAngle = midAngle || 0;
                            const x = cx + (innerRadius + (outerRadius - innerRadius) * 1.3) * Math.cos(-mAngle * Math.PI / 180);
                            const y = cy + (innerRadius + (outerRadius - innerRadius) * 1.3) * Math.sin(-mAngle * Math.PI / 180);
                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="#666"
                                    textAnchor={x > cx ? 'start' : 'end'}
                                    dominantBaseline="central"
                                    fontSize={12}
                                >
                                    {`${((percent || 0) * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {data.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => isCurrency ? `R$ ${Number(v).toFixed(2)}` : v} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const FinanceTab: React.FC<FinanceTabProps> = ({ orders, expenses }) => {
    const { revenue, totalExpenses, expenseBreakdown } = useMemo(() => {
        const rev = orders.reduce((acc, o) => acc + o.total, 0);
        const expTotal = expenses.reduce((acc, e) => acc + e.amount, 0);
        const breakdown = expenses.reduce((acc: { [k: string]: number }, e: any) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});
        return {
            revenue: rev,
            totalExpenses: expTotal,
            expenseBreakdown: Object.entries(breakdown).map(([name, value]) => ({ name, value }))
        };
    }, [orders, expenses]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 page-break-avoid">
                <h3 className="text-xl font-bold text-summo-dark mb-4">Receita vs. Despesas</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer>
                        <BarChart data={[{ name: 'Resultado', Receita: revenue, Despesa: totalExpenses }]}>
                            <CartesianGrid />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(v: any) => `R$${Number(v).toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#00E096" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Despesa" fill="#FF3B30" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="page-break-avoid">
                <ChartCard
                    title="Despesas por Categoria"
                    data={expenseBreakdown}
                    colors={['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF']}
                    isCurrency={true}
                />
            </div>
        </div>
    );
};

export default React.memo(FinanceTab);
