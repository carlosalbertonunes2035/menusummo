
import React, { useMemo, useEffect, useState } from 'react';
import { Order, OrderStatus, OrderType } from '../../../types';
import { useOrders } from '@/hooks/useOrders';
import { useApp } from '../../../contexts/AppContext';
import { CheckCircle2, ChefHat, Truck, MapPin, MessageCircle, ChevronDown, Phone, Copy, Star } from 'lucide-react';
import { generateWhatsAppLink } from '../../../lib/utils';

interface OrderTrackerProps {
    orderId: string;
    onClose: () => void;
    onNewOrder: () => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onClose, onNewOrder }) => {
    const { data: orders } = useOrders({ limit: 50 });
    const { handleAction, showToast } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);

    if (!order) return (
        <div className="fixed inset-0 z-[120] bg-white flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    const steps = [
        { id: OrderStatus.PENDING, label: 'Confirmado', icon: CheckCircle2, time: '00:00' },
        { id: OrderStatus.PREPARING, label: 'Preparando', icon: ChefHat, time: '00:10' },
        { id: OrderStatus.DELIVERING, label: order.type === OrderType.DELIVERY ? 'Saiu para Entrega' : 'Pronto p/ Retirada', icon: Truck, time: '00:30' },
        { id: OrderStatus.COMPLETED, label: 'Entregue', icon: MapPin, time: '00:45' }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.status);
    const progress = Math.max(5, (currentStepIndex / (steps.length - 1)) * 100);

    const getStatusHeader = () => {
        switch (order.status) {
            case OrderStatus.PENDING: return { title: 'Pedido Recebido!', sub: 'Aguardando confirmação do restaurante.', color: 'bg-blue-600' };
            case OrderStatus.PREPARING: return { title: 'Sendo Preparado', sub: 'A cozinha já está trabalhando no seu pedido.', color: 'bg-orange-500' };
            case OrderStatus.READY: return { title: 'Pronto!', sub: 'Aguardando retirada ou entregador.', color: 'bg-green-500' };
            case OrderStatus.DELIVERING: return { title: order.type === OrderType.DELIVERY ? 'Saiu para Entrega' : 'Pronto para Retirada', sub: order.type === OrderType.DELIVERY ? 'O entregador está a caminho.' : 'Pode vir buscar no balcão.', color: 'bg-purple-600' };
            case OrderStatus.COMPLETED: return { title: 'Pedido Entregue', sub: 'Bom apetite! 😍', color: 'bg-green-600' };
            case OrderStatus.CANCELLED: return { title: 'Pedido Cancelado', sub: 'Entre em contato com o estabelecimento.', color: 'bg-red-500' };
            default: return { title: 'Processando...', sub: 'Atualizando status.', color: 'bg-gray-600' };
        }
    };

    const headerInfo = getStatusHeader();

    const handleWhatsAppContact = () => {
        window.open(`https://wa.me/?text=Olá, gostaria de falar sobre o pedido #${order.id.slice(-4)}`, '_blank');
    };

    const handleSubmitFeedback = async () => {
        if (rating === 0) return;
        setIsSubmittingFeedback(true);
        try {
            await handleAction('orders', 'update', orderId, {
                feedback: {
                    rating,
                    comment,
                    createdAt: new Date()
                }
            });
            showToast("Obrigado pela avaliação!", "success");
        } catch (e) {
            showToast("Erro ao enviar avaliação.", "error");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-gray-50 flex flex-col animate-fade-in">
            {/* Header Status Map Placeholder */}
            <div className={`relative ${isExpanded ? 'h-1/4' : 'h-1/3'} transition-all duration-300 bg-gray-200 overflow-hidden`}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className={`absolute inset-0 ${headerInfo.color} bg-opacity-90 flex flex-col items-center justify-center text-white p-6 text-center transition-colors duration-500`}>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-4 animate-bounce-slow">
                        {order.status === OrderStatus.PREPARING ? <ChefHat size={40} /> :
                            order.status === OrderStatus.DELIVERING ? <Truck size={40} /> :
                                <CheckCircle2 size={40} />}
                    </div>
                    <h2 className="text-2xl font-bold">{headerInfo.title}</h2>
                    <p className="text-white/80 text-sm mt-1 max-w-xs">{headerInfo.sub}</p>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/30 backdrop-blur-md z-10">
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* Tracking Content */}
            <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-xl flex flex-col overflow-hidden">
                <div className="p-2 flex justify-center"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>

                <div className="flex-1 overflow-y-auto p-6 pt-2">

                    {/* FEEDBACK SECTION (Visible on Completion) */}
                    {order.status === OrderStatus.COMPLETED && !order.feedback && (
                        <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-200 text-center animate-slide-in-up">
                            <h3 className="font-bold text-yellow-900 mb-2">Como foi seu pedido?</h3>
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all active:scale-90 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                    >
                                        <Star size={32} />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <div className="animate-fade-in space-y-3">
                                    <textarea
                                        placeholder="Deixe um comentário (opcional)..."
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        className="w-full p-3 bg-white border border-yellow-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleSubmitFeedback}
                                        disabled={isSubmittingFeedback}
                                        className="w-full py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition"
                                    >
                                        {isSubmittingFeedback ? 'Enviando...' : 'Enviar Avaliação'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {order.feedback && (
                        <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                            <p className="font-bold text-green-800 text-sm flex items-center justify-center gap-2">
                                <CheckCircle2 size={16} /> Avaliação enviada!
                            </p>
                            <div className="flex justify-center gap-1 mt-1">
                                {[...Array(order.feedback.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />)}
                            </div>
                        </div>
                    )}

                    {/* Stepper */}
                    <div className="mb-8 relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-500 transition-all duration-1000" style={{ height: `${progress}%` }}></div>

                        <div className="space-y-8 relative">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step.id} className={`flex items-center gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors duration-300 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <step.icon size={20} />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isCurrent ? 'text-gray-800 text-lg' : 'text-gray-600'}`}>{step.label}</p>
                                            {isCurrent && <p className="text-xs text-green-600 font-bold animate-pulse">Em andamento</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Details Accordion-ish */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Detalhes do Pedido #{order.id.slice(-4)}</h3>
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-summo-primary">
                                {isExpanded ? 'Ver menos' : 'Ver tudo'}
                            </button>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.productName}</span>
                                    <span className="text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 mt-2">
                                <span>Total</span>
                                <span>R$ {order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><MapPin size={16} /> <span>{order.type === OrderType.DELIVERY ? 'Entrega' : 'Retirada'}</span></div>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> <span>{order.payments[0]?.method || 'Pagamento na Entrega'}</span></div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white pb-safe">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleWhatsAppContact} className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                            <MessageCircle size={18} className="text-green-600" /> Ajuda
                        </button>
                        {order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED ? (
                            <button onClick={onNewOrder} className="py-3 bg-summo-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-summo-dark transition shadow-lg">
                                Novo Pedido
                            </button>
                        ) : (
                            <button className="py-3 bg-gray-100 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
                                <Truck size={18} /> Acompanhando
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracker;
