import React, { useState, useMemo } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { Customer } from '../../../types';
import { Loader2, Users } from 'lucide-react';
import { searchMatch } from '../../../lib/utils';
import { useDebounce } from '../../../lib/hooks';

// Sub-components
import CustomerList from '../components/CustomerList';
import CustomerDetail from '../components/CustomerDetail';
import SmartSegments from '../components/SmartSegments';

const CRM: React.FC = () => {
    const { data: customers, loading: customersLoading } = useCustomers({ limit: 500 });
    const { data: orders, loading: ordersLoading } = useOrders({ limit: 1000 });

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


    // CHANGED: Default view is now 'LIST' to prioritize "All Clients"
    const [viewMode, setViewMode] = useState<'LIST' | 'STRATEGY'>('LIST');

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter(c =>
            searchMatch(c.name, debouncedSearch) ||
            searchMatch(c.phone, debouncedSearch)
        ).sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
    }, [customers, debouncedSearch]);

    if (!customers || !orders) return <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-full flex flex-col animate-fade-in bg-gray-50/50">
            {/* Header Toggle */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-orange-500" /> Gestão de Clientes (CRM)</h2>
                <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button onClick={() => setViewMode('LIST')} className={`px - 4 py - 2 rounded - md text - xs font - bold transition ${viewMode === 'LIST' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'} `}>Lista Completa</button>
                    <button onClick={() => setViewMode('STRATEGY')} className={`px - 4 py - 2 rounded - md text - xs font - bold transition ${viewMode === 'STRATEGY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'} `}>Estratégia (Growth)</button>
                </div>
            </div>

            {viewMode === 'STRATEGY' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-700 mb-1">Motor de Crescimento 🚀</h3>
                            <p className="text-sm text-gray-500 mb-4">O sistema analisou sua base e separou os clientes por comportamento de compra. Clique para agir.</p>
                            <SmartSegments customers={customers} />
                        </div>

                        {/* Recent Activity Mini-List */}
                        <div className="p-4 pt-0">
                            <h4 className="font-bold text-gray-700 mb-3 ml-1">Últimas Interações</h4>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                {filteredCustomers.slice(0, 5).map(c => (
                                    <div key={c.id} onClick={() => { setSelectedCustomer(c); setViewMode('LIST'); }} className="p-4 border-b border-gray-50 last:border-0 hover:bg-indigo-50 cursor-pointer flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{c.name}</p>
                                            <p className="text-xs text-gray-500">Comprou {new Date(c.lastOrderDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{c.totalOrders} pedidos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <CustomerList
                        customers={filteredCustomers}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={setSelectedCustomer}
                        isMobileHidden={!!selectedCustomer}
                    />
                    <CustomerDetail
                        customer={selectedCustomer}
                        orders={orders}
                        onClose={() => setSelectedCustomer(null)}
                        onNavigateToPOS={() => { }} // Navigation function removed
                    />
                </div>
            )}
        </div>
    );
};

export default CRM;
