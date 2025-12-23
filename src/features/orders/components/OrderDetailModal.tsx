import React from 'react';
import { Order } from '../../../types';
import { Calendar, X, Printer, DollarSign, TrendingDown, Activity, Clock, CreditCard, Package } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onPrint: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onPrint }) => {
    const profit = order.total - order.cost;
    const margin = order.total > 0 ? (profit / order.total) * 100 : 0;

    // Determine Health Color
    const getHealthColor = (m: number) => {
        if (m >= 20) return 'text-green-600 bg-green-50 border-green-200';
        if (m > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const healthStyle = getHealthColor(margin);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-800">Pedido #{order.id.slice(-4)}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {order.status === 'CANCELLED' ? 'CANCELADO' : 'CONCLUÍDO'}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-gray-700">{order.customerName}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onPrint} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm" title="Imprimir"><Printer size={20} /></button>
                        <button onClick={onClose} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {/* Financial KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Receita Total</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Custo Total (CMV)</p>
                            <p className="text-2xl font-bold text-red-500 flex items-center gap-1">
                                <TrendingDown size={16} /> {formatCurrency(order.cost)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm ${healthStyle}`}>
                            <p className="text-xs font-bold opacity-80 uppercase mb-1">Lucro Bruto</p>
                            <p className="text-2xl font-bold flex items-center gap-1">
                                <DollarSign size={20} /> {formatCurrency(profit)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm ${healthStyle}`}>
                            <p className="text-xs font-bold opacity-80 uppercase mb-1">Margem %</p>
                            <p className="text-2xl font-bold flex items-center gap-1">
                                <Activity size={20} /> {margin.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Product Breakdown Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><Package size={18} /> Detalhamento dos Itens</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Produto</th>
                                    <th className="p-4 text-center">Qtd</th>
                                    <th className="p-4 text-right">Custo Un.</th>
                                    <th className="p-4 text-right">Preço Venda</th>
                                    <th className="p-4 text-right">Lucro Item</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item, idx) => {
                                    const estimatedUnitCost = item.basePrice * 0.4;
                                    const itemProfit = (item.price - estimatedUnitCost) * item.quantity;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-800">{item.productName}</p>
                                                {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                                                {item.selectedOptions && <p className="text-xs text-gray-500">{item.selectedOptions.map(o => o.optionName).join(', ')}</p>}
                                            </td>
                                            <td className="p-4 text-center font-medium text-gray-600">{item.quantity}</td>
                                            <td className="p-4 text-right text-red-400 font-mono text-xs">
                                                ~{formatCurrency(estimatedUnitCost)}
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-800 font-mono">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="p-4 text-right font-bold font-mono text-green-600">
                                                +{formatCurrency(itemProfit)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <div className="p-3 bg-blue-50 text-blue-700 text-xs text-center font-medium">
                            * Custos estimados baseados na ficha técnica do momento da venda.
                        </div>
                    </div>

                    {/* Timeline & Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Clock size={16} /> Linha do Tempo</h4>
                            <div className="space-y-4 relative pl-2">
                                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                <div className="relative flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Pedido Criado</p>
                                        <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 ring-4 ring-white z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Finalizado / Entregue</p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(new Date(order.createdAt).getTime() + 45 * 60000).toLocaleString()} (Est.)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><CreditCard size={16} /> Pagamento & Entrega</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Método</span>
                                    <span className="font-bold text-gray-800">{order.payments[0]?.method || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Canal</span>
                                    <span className="font-bold text-gray-800">{order.origin === 'DIGITAL' ? 'Online' : 'Loja Física'}</span>
                                </div>
                                <div className="border-t border-gray-200 my-2 pt-2">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Endereço</p>
                                    <p className="text-gray-800 font-medium">{order.deliveryAddress || 'Retirada no Balcão'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
