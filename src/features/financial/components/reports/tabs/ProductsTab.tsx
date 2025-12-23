import React from 'react';
import { TableCard } from '../ui/ReportComponents';

interface ProductsTabProps {
    ranking: any[];
}

const ProductsTab: React.FC<ProductsTabProps> = ({ ranking }) => (
    <TableCard title="Ranking de Produtos" headers={['Produto', 'Qtd. Vendida', 'Receita Gerada']}>
        {ranking.map((p, idx) => (
            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800">{p.name}</td>
                <td className="p-4 text-center">{p.qty}</td>
                <td className="p-4 text-right font-mono font-bold text-green-600">R$ {p.revenue.toFixed(2)}</td>
            </tr>
        ))}
    </TableCard>
);

export default ProductsTab;
