import React, { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TableGridSelectionProps {
    activeTableIds: string[];
}

export function TableGridSelection({ activeTableIds }: TableGridSelectionProps) {
    const { settings } = useApp();
    const navigate = useNavigate();

    const tables = useMemo(() => {
        const config = settings.tables || { totalTables: 20, prefix: 'Mesa', startNumber: 1 };
        return Array.from({ length: config.totalTables }, (_, i) => {
            const tableNum = config.startNumber + i;
            const tableId = `table-${tableNum}`;
            const isOccupied = activeTableIds.includes(tableId);
            return {
                id: tableId,
                number: tableNum,
                label: `${config.prefix} ${tableNum.toString().padStart(2, '0')}`,
                isOccupied
            };
        });
    }, [settings.tables, activeTableIds]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus size={20} className="text-orange-500" />
                    Abrir Nova Mesa
                </h2>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-gray-200" /> Livre
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Ocupada
                    </span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {tables.map((table) => (
                    <button
                        key={table.id}
                        disabled={table.isOccupied}
                        onClick={() => {
                            // In a real scenario, this would open a "Quick Registration" modal
                            // For now, we'll navigate to the order page which handles session creation or shows a fallback
                            navigate(`/app/waiter/order/${table.id}`);
                        }}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${table.isOccupied
                                ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-orange-500 hover:text-orange-600 shadow-sm'
                            }`}
                        title={table.isOccupied ? 'Mesa Ocupada' : 'Clique para abrir'}
                    >
                        <span className="text-lg font-bold">{table.number}</span>
                        {table.isOccupied && <Users size={12} />}
                    </button>
                ))}
            </div>

            <div className="p-3 bg-orange-50 border-t border-orange-100 text-[11px] text-orange-800 text-center font-medium">
                DICA: Mesas azuis já possuem comanda ativa e devem ser acessadas na seção "Minhas Mesas"
            </div>
        </div>
    );
}
