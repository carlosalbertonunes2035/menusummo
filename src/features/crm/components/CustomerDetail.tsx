
import React, { memo } from 'react';
import { Customer, Order } from '../../../types';
import { Phone, MapPin, ChevronLeft, MessageCircle, ArrowRight, User } from 'lucide-react';
import { generateWhatsAppLink, formatCurrency } from '../../../lib/utils';

interface CustomerDetailProps {
    customer: Customer | null;
    orders: Order[];
    onClose: () => void;
    onNavigateToPOS: () => void;
}

const PlusIconMobile = () => <span className="md:hidden text-lg leading-none mr-1">+</span>;

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, orders, onClose, onNavigateToPOS }) => {

    if (!customer) {
        return (
            <div className="hidden md:flex flex-[2] flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <User size={64} className="text-summo-primary/30" />
                </div>
                <h3 className="font-bold text-lg text-gray-500">Selecione um cliente</h3>
                <p className="text-sm">Veja detalhes, histórico e inicie vendas.</p>
            </div>
        );
    }

    const history = orders.filter(o =>
        o.customerPhone === customer.phone ||
        o.customerName.toLowerCase() === customer.name.toLowerCase()
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex-[2] flex flex-col bg-white md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-slide-in-right h-full w-full fixed inset-0 z-50 md:static md:w-auto md:h-auto">
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start flex-shrink-0 pt-safe md:pt-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-full" onClick={onClose}>
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-summo-dark truncate max-w-[200px]">{customer.name}</h2>
                    </div>
                    <div className="flex flex-col md:flex-row md:gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
                        {customer.address && <span className="flex items-center gap-1 truncate max-w-[250px]"><MapPin size={14} /> {customer.address}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.open(generateWhatsAppLink(customer.phone, customer.name, "", ""), '_blank')} className="bg-green-100 text-green-700 p-2.5 rounded-lg hover:bg-green-200 transition" title="WhatsApp"><MessageCircle size={20} /></button>
                    <button onClick={onNavigateToPOS} className="bg-summo-primary text-white px-3 md:px-4 py-2 rounded-lg font-bold hover:bg-summo-dark transition flex items-center gap-2 shadow-lg shadow-summo-primary/20 whitespace-nowrap"><span className="hidden md:inline">Novo Pedido</span><PlusIconMobile /><ArrowRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 md:p-6 bg-white flex-shrink-0">
                <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100"><p className="text-[10px] md:text-xs font-bold text-blue-600 uppercase mb-1">Total Gasto</p><p className="text-lg md:text-2xl font-bold text-blue-900">{formatCurrency(customer.totalSpent)}</p></div>
                <div className="bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100"><p className="text-[10px] md:text-xs font-bold text-orange-600 uppercase mb-1">Pedidos</p><p className="text-lg md:text-2xl font-bold text-orange-900">{customer.totalOrders}</p></div>
                <div className="bg-green-50 p-3 md:p-4 rounded-xl border border-green-100"><p className="text-[10px] md:text-xs font-bold text-green-600 uppercase mb-1">Última Visita</p><p className="text-sm md:text-lg font-bold text-green-900">{new Date(customer.lastOrderDate).toLocaleDateString()}</p></div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-6 custom-scrollbar">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10"> Histórico de Pedidos</h3>
                <div className="space-y-3">
                    {history.length === 0 ? (<p className="text-gray-400 text-center py-4">Sem histórico recente.</p>) : (
                        history.map(order => (
                            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition render-auto">
                                <div className="flex justify-between mb-2">
                                    <div>
                                        <span className="font-bold text-summo-dark">Pedido #{order.id.slice(-4)}</span>
                                        <span className="text-xs text-gray-400 ml-2 block md:inline">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <span className="font-bold text-green-600">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start">
                                            <span className="font-medium">{item.quantity}x {item.productName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(CustomerDetail);
