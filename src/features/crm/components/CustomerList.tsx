
import React, { memo } from 'react';
import { Customer } from '../../../types';
import { User, Search, Phone } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface CustomerListProps {
    customers: Customer[];
    searchQuery: string;
    setSearchQuery: (s: string) => void;
    selectedCustomer: Customer | null;
    onSelectCustomer: (c: Customer) => void;
    isMobileHidden: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
    customers, searchQuery, setSearchQuery, selectedCustomer, onSelectCustomer, isMobileHidden
}) => {
    return (
        <div className={`flex-1 flex flex-col bg-white md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${isMobileHidden ? 'hidden md:flex md:w-1/3 md:flex-none' : 'w-full h-full'}`}>
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-summo-dark mb-3 flex items-center gap-2">
                    <User size={20} className="text-summo-primary" /> Base de Clientes
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-32 md:pb-2">
                {customers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 px-4">
                        <User size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="font-bold">Nenhum cliente encontrado.</p>
                        <p className="text-xs">Tente um termo de busca diferente.</p>
                    </div>
                ) : (
                    customers.map(c => (
                        <div
                            key={c.id}
                            onClick={() => onSelectCustomer(c)}
                            className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center active:scale-[0.98] render-auto
                                ${selectedCustomer?.id === c.id ? 'bg-summo-bg border-summo-primary ring-1 ring-summo-primary' : 'bg-white border-gray-100 hover:border-summo-primary/50'}`}
                        >
                            <div>
                                <h3 className="font-bold text-gray-800">{c.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {c.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-summo-primary text-sm">{formatCurrency(c.totalSpent)}</p>
                                <p className="text-[10px] text-gray-400">{c.totalOrders} pedidos</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default memo(CustomerList);
