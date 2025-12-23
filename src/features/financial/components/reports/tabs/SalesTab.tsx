import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Order, OrderType } from '../../../../../types';

interface SalesTabProps {
    orders: Order[];
    drivers: any[];
}

const COLORS = ['#A95BFF', '#FF5BE0', '#00E096', '#FFD600'];

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

const SalesTab: React.FC<SalesTabProps> = ({ orders, drivers }) => {
    const channelData = useMemo(() => {
        const d = orders.reduce((a: { [k: string]: number }, o) => {
            const t = o.type === OrderType.DELIVERY ? 'Entrega' : o.type === OrderType.TAKEOUT ? 'Retirada' : 'Mesa';
            a[t] = (a[t] || 0) + 1;
            return a;
        }, {});
        return Object.entries(d).map(([n, v]) => ({ name: n, value: v }));
    }, [orders]);

    const paymentData = useMemo(() => {
        const d = orders.flatMap(o => o.payments).reduce((a: { [k: string]: number }, p) => {
            a[p.method] = (a[p.method] || 0) + p.amount;
            return a;
        }, {});
        return Object.entries(d).map(([n, v]) => ({ name: n, value: v }));
    }, [orders]);

    const driverSales = useMemo(() => {
        const d = orders.reduce((a: { [k: string]: number }, o) => {
            if (o.driverId) { a[o.driverId] = (a[o.driverId] || 0) + o.total; }
            return a;
        }, {});
        return Object.entries(d).map(([id, v]) => ({
            name: drivers.find((d: any) => d.id === id)?.name || `ID ${id.slice(0, 4)}`,
            value: v
        })).sort((a, b) => Number(b.value) - Number(a.value));
    }, [orders, drivers]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 page-break-avoid">
                <ChartCard title="Pedidos por Canal" data={channelData} colors={COLORS} isCurrency={false} />
            </div>
            <div className="lg:col-span-6 page-break-avoid">
                <ChartCard title="Receita por Pagamento" data={paymentData} colors={COLORS} isCurrency={true} />
            </div>
            <div className="lg:col-span-12 page-break-avoid">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-summo-dark mb-4">Vendas por Entregador</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={driverSales} layout="vertical" margin={{ left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#666', fontSize: 12 }} width={80} />
                                <XAxis type="number" tickFormatter={v => `R$${v}`} />
                                <Tooltip formatter={(v: any) => `R$${Number(v).toFixed(2)}`} />
                                <Bar dataKey="value" fill="#A95BFF" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SalesTab);
