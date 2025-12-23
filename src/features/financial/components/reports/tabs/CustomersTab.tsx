import React from 'react';
import { TableCard } from '../ui/ReportComponents';

interface CustomersTabProps {
    ranking: any[];
}

const CustomersTab: React.FC<CustomersTabProps> = ({ ranking }) => (
    <TableCard title="Ranking de Clientes" headers={['Cliente', 'Pedidos', 'Total Gasto']}>
        {ranking.map((c, idx) => (
            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800">{c.name}</td>
                <td className="p-4 text-center">{c.orders}</td>
                <td className="p-4 text-right font-mono font-bold text-green-600">R$ {c.spent.toFixed(2)}</td>
            </tr>
        ))}
    </TableCard>
);

export default CustomersTab;
