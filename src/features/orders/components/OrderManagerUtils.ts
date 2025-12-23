import { Order, OrderType } from '../../../types';
import { Smartphone, Utensils, ShoppingBag, CheckCircle2 } from 'lucide-react';

export const getChannelInfo = (order: Order) => {
    if (order.origin === 'DIGITAL') return { label: 'Site/App', icon: Smartphone, color: 'text-purple-600 bg-purple-50' };
    if (order.origin === 'POS') {
        if (order.type === OrderType.DINE_IN) return { label: 'Mesa/Salão', icon: Utensils, color: 'text-orange-600 bg-orange-50' };
        return { label: 'Balcão', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' };
    }
    return { label: 'Outro', icon: CheckCircle2, color: 'text-gray-600 bg-gray-50' };
};

export const getPaymentLabel = (order: Order) => {
    if (!order.payments || order.payments.length === 0) return 'Pendente';
    return order.payments.map(p => {
        switch (p.method) {
            case 'PIX': return 'Pix';
            case 'CREDIT_CARD': return 'Crédito';
            case 'DEBIT_CARD': return 'Débito';
            case 'CASH': return 'Dinheiro';
            default: return 'Outro';
        }
    }).join(', ');
};
