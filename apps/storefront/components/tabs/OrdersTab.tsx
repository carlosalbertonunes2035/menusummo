'use client';


// components/public/OrdersTab.tsx
import React from 'react';
import { Order, OrderStatus } from '../../../types';
import { ClipboardList, ChefHat, Truck, CheckCircle2 } from 'lucide-react';

interface OrdersTabProps {
    orders: Order[];
    user: { phone: string };
}

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return { text: 'Aguardando', icon: ClipboardList, color: 'text-gray-500 bg-gray-100' };
        case OrderStatus.PREPARING: return { text: 'Na Cozinha', icon: ChefHat, color: 'text-orange-500 bg-orange-100' };
        case OrderStatus.READY: return { text: 'Pronto', icon: CheckCircle2, color: 'text-blue-500 bg-blue-100' };
        case OrderStatus.DELIVERING: return { text: 'Em Rota', icon: Truck, color: 'text-orange-500 bg-orange-100' };
        case OrderStatus.COMPLETED: return { text: 'Entregue', icon: CheckCircle2, color: 'text-green-500 bg-green-100' };
        case OrderStatus.CANCELLED: return { text: 'Cancelado', icon: ClipboardList, color: 'text-red-500 bg-red-100' };
        default: return { text: 'Desconhecido', icon: ClipboardList, color: 'text-gray-500 bg-gray-100' };
    }
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, user }) => {
    const myOrders = user.phone ? orders.filter(o => o.customerPhone === user.phone) : [];

    return (
        <div className="px-4 py-4 space-y-4 pb-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Pedidos</h2>
            {myOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <ClipboardList size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="font-bold">Nenhum pedido encontrado.</p>
                    <p className="text-sm">Seu histórico aparecerá aqui.</p>
                </div>
            ) : (
                myOrders.map(order => {
                    const StatusIcon = getStatusInfo(order.status).icon;
                    const statusColor = getStatusInfo(order.status).color;
                    const statusText = getStatusInfo(order.status).text;

                    return (
                        <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-gray-800">Pedido #{order.id.slice(-4)}</span>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${statusColor}`}>
                                    <StatusIcon size={12} /> {statusText}
                                </span>
                            </div>
                            <div className="border-t border-gray-50 pt-2 mt-2">
                                {order.items.map((item, i) => (
                                    <p key={i} className="text-sm text-gray-600">{item.quantity}x {item.productName}</p>
                                ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">Total: R$ {order.total.toFixed(2)}</span>
                                <button className="text-summo-primary text-xs font-bold">Ver Detalhes</button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default OrdersTab;
