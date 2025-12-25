
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { OrderType, Product, StoreSettings, PaymentMethod, Coupon, CartItem, DiscountType } from '@/types';
import { ShoppingBag, Plus, Minus, X, MapPin, Clock, Loader2, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Ticket, Utensils, Copy, Smartphone, Banknote, Edit2, Calendar, Ticket as TicketIcon, Bike, Store, ArrowRight, AlertCircle, User, Percent, Sparkles } from 'lucide-react';
import { getProductChannel } from '@/lib/utils';

type CheckoutStep = 'BAG' | 'IDENTITY' | 'FULFILLMENT' | 'PAYMENT';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    updateCartItem: (index: number, delta: number) => void;
    settings: StoreSettings;
    user: any;
    onUpdateUser?: (u: Partial<{ name: string; phone: string }>) => void;
    onOpenAddressModal: () => void;
    onSendOrder: () => void;
    isSending: boolean;
    orderMode: OrderType;
    setOrderMode: (mode: OrderType) => void;
    scheduledTime: string;
    setScheduledTime: (time: string) => void;
    tableNumber: string;
    setTableNumber: (num: string) => void;
    paymentMethod: string | null;
    setPaymentMethod: (method: string) => void;
    changeFor: string;
    setChangeFor: (val: string) => void;
    cartTotal: number;
    products?: Product[];
    onAddUpsellItem?: (p: Product) => void;
    onClearCart: () => void;
    appliedCoupon?: Coupon | null;
    setAppliedCoupon?: (c: Coupon | null) => void;
    coupons: Coupon[];
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CartModal: React.FC<CartModalProps> = ({
    isOpen, onClose, cart, updateCartItem, settings, user, onUpdateUser, onOpenAddressModal, onSendOrder, isSending,
    orderMode, setOrderMode, scheduledTime, setScheduledTime, tableNumber, setTableNumber,
    paymentMethod, setPaymentMethod, changeFor, setChangeFor, cartTotal, products = [], onAddUpsellItem, onClearCart,
    appliedCoupon, setAppliedCoupon, coupons, showToast
}) => {
    const [step, setStep] = useState<CheckoutStep>('BAG');
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
    const [isScheduling, setIsScheduling] = useState(false);

    const [identityName, setIdentityName] = useState(user?.name || '');
    const [identityPhone, setIdentityPhone] = useState(user?.phone || '');
    const [couponInput, setCouponInput] = useState('');

    const isDelivery = orderMode === OrderType.DELIVERY;

    const deliveryFee = useMemo(() => {
        if (!isDelivery) return 0;
        if (settings.delivery?.freeShippingThreshold && cartTotal >= settings.delivery.freeShippingThreshold) return 0;
        return settings.delivery?.baseFee || 0;
    }, [isDelivery, cartTotal, settings.delivery]);

    const discountValue = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (cartTotal < (appliedCoupon.minOrderValue || 0)) return 0;

        if (appliedCoupon.type === DiscountType.FIXED) {
            return appliedCoupon.value;
        } else {
            return (cartTotal * appliedCoupon.value) / 100;
        }
    }, [appliedCoupon, cartTotal]);

    const finalTotal = cart.length === 0 ? 0 : Math.max(0, cartTotal + deliveryFee - discountValue);

    useEffect(() => {
        if (isOpen) {
            setStep('BAG');
            setAnimationDirection('right');
            setIsScheduling(false);
            setIdentityName(user?.name || '');
            setIdentityPhone(user?.phone || '');
        }
    }, [isOpen, user?.name, user?.phone]);

    const upsellItems = useMemo(() => {
        if (!products.length) return [];
        const cartIds = cart.map(c => c.product.id);
        return products
            .filter(p => !cartIds.includes(p.id))
            .filter(p => {
                const price = getProductChannel(p, 'digital-menu').price || 0;
                return price < 25 && price > 0;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
    }, [products, cart]);

    const generateTimeSlots = useMemo(() => {
        const slots: string[] = [];
        const now = new Date();
        // Safe access with fallbacks
        const schedulingSettings = settings.orderModes?.scheduling || { enabled: false, minLeadTime: 30, intervalMin: 30 };
        const minLeadTime = schedulingSettings.minLeadTime || 30;
        const interval = schedulingSettings.intervalMin || 30;

        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const todayName = days[now.getDay()];
        const schedule = settings.schedule.find(s => s.day === todayName);

        if (!schedule || !schedule.isOpen) return [];

        const [closeHour, closeMin] = schedule.closeTime.split(':').map(Number);
        const closeTime = new Date(now);
        closeTime.setHours(closeHour, closeMin, 0, 0);

        if (closeTime < now && closeHour < 6) {
            closeTime.setDate(closeTime.getDate() + 1);
        }

        const startTime = new Date(now.getTime() + minLeadTime * 60000);
        const remainder = startTime.getMinutes() % interval;
        if (remainder !== 0) {
            startTime.setMinutes(startTime.getMinutes() + (interval - remainder));
        }
        startTime.setSeconds(0, 0);

        const currentSlot = startTime;
        const lastSlot = new Date(closeTime.getTime() - 30 * 60000);

        while (currentSlot <= lastSlot) {
            const hour = currentSlot.getHours().toString().padStart(2, '0');
            const min = currentSlot.getMinutes().toString().padStart(2, '0');
            slots.push(`${hour}:${min}`);
            currentSlot.setMinutes(currentSlot.getMinutes() + interval);
        }
        return slots;
    }, [settings.schedule, settings.orderModes]);

    if (!isOpen) return null;

    const handleContinue = () => {
        setAnimationDirection('right');
        if (step === 'BAG') {
            if (!user.name || !user.phone) {
                setStep('IDENTITY');
            } else {
                setStep('FULFILLMENT');
            }
        }
        else if (step === 'IDENTITY') {
            if (!identityName || !identityPhone) {
                alert("Por favor, preencha seu nome e WhatsApp.");
                return;
            }
            if (onUpdateUser) {
                onUpdateUser({ name: identityName, phone: identityPhone });
            }
            setStep('FULFILLMENT');
        }
        else if (step === 'FULFILLMENT') {
            if (orderMode === OrderType.DELIVERY && !user.address) {
                onOpenAddressModal();
                return;
            }
            if (orderMode === OrderType.DINE_IN && !tableNumber) {
                alert("Informe o número da mesa.");
                return;
            }
            setStep('PAYMENT');
        }
    };

    const handleBack = () => {
        setAnimationDirection('left');
        if (step === 'PAYMENT') setStep('FULFILLMENT');
        else if (step === 'FULFILLMENT') setStep('BAG');
        else if (step === 'IDENTITY') setStep('BAG');
        else onClose();
    };

    const handleApplyCoupon = () => {
        if (!couponInput.trim()) return;
        const foundCoupon = coupons.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
        if (foundCoupon) {
            if (setAppliedCoupon) {
                setAppliedCoupon(foundCoupon);
                showToast(`Cupom "${foundCoupon.code}" aplicado!`, 'success');
            }
        } else {
            showToast('Cupom inválido ou expirado.', 'error');
        }
        setCouponInput('');
    };

    const getStepLabel = () => {
        if (step === 'BAG') return 'SACOLA';
        if (step === 'IDENTITY') return 'IDENTIFICAÇÃO';
        if (step === 'FULFILLMENT') return 'ENTREGA';
        if (step === 'PAYMENT') return 'PAGAMENTO';
    }

    const renderHeader = () => (
        <div className="px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100:bg-gray-800 rounded-full transition">
                    <ChevronLeft size={24} />
                </button>
                <span className="text-sm font-bold text-gray-500 tracking-widest">{getStepLabel()}</span>
                {step === 'BAG' ? (
                    <button onClick={() => { onClearCart(); onClose(); }} className="text-sm font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition">Limpar</button>
                ) : <div className="w-8"></div>}
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div className={`h-full bg-summo-primary transition-all duration-500 ease-out ${step === 'BAG' ? 'w-1/4' : step === 'IDENTITY' ? 'w-2/4' : step === 'FULFILLMENT' ? 'w-3/4' : 'w-full'}`}></div>
            </div>
        </div>
    );

    const renderBagStep = () => (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'left' ? 'animate-slide-in-left' : 'animate-fade-in'}`}>
            <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                    <img src={settings.logoUrl} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{settings.brandName}</h3>
                    <button onClick={onClose} className="text-xs font-bold text-summo-primary hover:underline">Adicionar mais itens</button>
                </div>
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium text-lg">Sua sacola está vazia.</p>
                    <p className="text-sm mb-6">Que tal experimentar algo novo?</p>
                    <button onClick={onClose} className="bg-summo-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg">Ver Cardápio</button>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-sm">Itens adicionados</h4>
                        {cart.map((item, idx) => {
                            const channel = getProductChannel(item.product, 'digital-menu');
                            const price = channel.promotionalPrice || channel.price || 0;
                            const optionsPrice = item.selectedOptions ? item.selectedOptions.reduce((acc, opt) => acc + opt.price, 0) : 0;
                            return (
                                <div key={idx} className="flex gap-4 bg-white p-1 rounded-2xl group">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                                        {channel.image && <img src={channel.image} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 leading-tight">{channel.displayName || item.product.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{(price + optionsPrice).toFixed(2)} / un</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">R$ {((price + optionsPrice) * item.quantity).toFixed(2)}</p>
                                        </div>
                                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                                            <p className="text-[10px] text-gray-500 mt-1 truncate">{item.selectedOptions.map(o => o.optionName).join(', ')}</p>
                                        )}
                                        {item.notes && <p className="text-[10px] text-orange-500 italic truncate">Obs: {item.notes}</p>}
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 h-fit self-center border border-gray-200">
                                        <button onClick={() => updateCartItem(idx, -1)} className={`text-gray-400 hover:text-red-500 ${item.quantity === 1 ? 'text-red-400' : ''}`}>
                                            {item.quantity === 1 ? <X size={14} /> : <Minus size={14} />}
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateCartItem(idx, 1)} className="text-summo-primary font-bold"><Plus size={14} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {upsellItems.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center px-1">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Sparkles size={16} className="text-summo-primary" />
                                    Peça também
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Sugestões</span>
                            </div>

                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 scroll-smooth snap-x">
                                {upsellItems.map(prod => {
                                    const ch = getProductChannel(prod, 'digital-menu');
                                    const price = ch.promotionalPrice || ch.price || 0;
                                    const originalPrice = ch.price || 0;
                                    const hasPromo = ch.promotionalPrice && ch.promotionalPrice < originalPrice;

                                    return (
                                        <div key={prod.id} className="snap-start min-w-[150px] w-[150px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group active:scale-[0.98]">
                                            <div className="h-32 bg-gray-100 relative overflow-hidden">
                                                {ch.image ? (
                                                    <img src={ch.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={prod.name} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={32} /></div>
                                                )}

                                                {/* Promo Badge */}
                                                {hasPromo && (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">PROMO</div>
                                                )}

                                                <button
                                                    onClick={() => onAddUpsellItem && onAddUpsellItem(prod)}
                                                    className="absolute bottom-2 right-2 bg-summo-primary text-white rounded-full p-2 shadow-lg hover:bg-summo-dark active:scale-90 transition-all z-10"
                                                >
                                                    <Plus size={16} strokeWidth={3} />
                                                </button>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="p-3 flex-1 flex flex-col">
                                                <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 min-h-[32px]">{prod.name}</p>
                                                <div className="mt-2 flex items-baseline gap-1.5">
                                                    <span className="text-sm font-black text-green-600">R$ {price.toFixed(2)}</span>
                                                    {hasPromo && (
                                                        <span className="text-[9px] text-gray-400 line-through">R$ {originalPrice.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}


                    {appliedCoupon ? (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-between gap-3 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-600"><TicketIcon size={20} /></div>
                                <div>
                                    <p className="font-bold text-green-800 text-sm">Cupom Aplicado!</p>
                                    <p className="text-[10px] text-green-700">{appliedCoupon.code} - Economia de R$ {discountValue.toFixed(2)}</p>
                                </div>
                            </div>
                            <button onClick={() => setAppliedCoupon && setAppliedCoupon(null)} className="text-red-500 text-xs font-bold hover:underline">Remover</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {coupons.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <TicketIcon size={16} className="text-summo-primary" />
                                        <h4 className="font-bold text-gray-800 text-sm">Cupons Disponíveis</h4>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {coupons.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    if (setAppliedCoupon) {
                                                        setAppliedCoupon(c);
                                                        showToast(`Cupom ${c.code} aplicado!`, 'success');
                                                    }
                                                }}
                                                className="border border-green-200 bg-green-50 rounded-xl p-3 min-w-[140px] text-left hover:bg-green-100:bg-green-900/50 transition relative group active:scale-95 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <p className="font-bold text-green-700 text-xs mb-0.5">{c.code}</p>
                                                    <p className="text-[10px] text-green-600 leading-tight">{(c as any).title || `${c.value}% OFF`}</p>
                                                </div>
                                                <div className="mt-2 text-[10px] font-bold text-summo-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Aplicar <ChevronRight size={10} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Ou digite o código</div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleApplyCoupon(); }}
                                        placeholder="Digite o código"
                                        className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-mono uppercase border border-gray-200 outline-none focus:ring-1 focus:ring-summo-primary"
                                    />
                                    <button onClick={handleApplyCoupon} className="text-xs font-bold text-summo-primary bg-white border border-summo-primary/20 px-4 py-2 rounded-lg shadow-sm hover:bg-summo-bg">
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-gray-800 text-sm">Resumo de valores</h4>
                        <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>Desconto ({appliedCoupon.code})</span>
                                <span>- R$ {discountValue.toFixed(2)}</span>
                            </div>
                        )}
                        {appliedCoupon && cartTotal < (appliedCoupon.minOrderValue || 0) && (
                            <p className="text-xs text-red-500 text-right">Adicione R$ {(appliedCoupon.minOrderValue! - cartTotal).toFixed(2)} para usar o cupom.</p>
                        )}
                        <div className="flex justify-between text-sm text-gray-600"><span>Taxa de Entrega</span><span className={deliveryFee === 0 ? 'text-green-500 font-bold' : ''}>{isDelivery ? (deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`) : 'N/A'}</span></div>
                        <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100 mt-2">
                            <span>Total a pagar</span>
                            <span>R$ {finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderIdentityStep = () => (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-summo-bg rounded-full flex items-center justify-center mx-auto mb-4 text-summo-primary"><User size={32} /></div>
                <h3 className="font-bold text-gray-800 text-xl">Vamos nos conhecer?</h3>
                <p className="text-gray-500 text-sm mt-1 px-6">Precisamos do seu nome e contato para enviar atualizações do pedido.</p>
            </div>
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Seu Nome</label><input type="text" value={identityName} onChange={e => setIdentityName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary transition font-medium" placeholder="Como podemos te chamar?" autoFocus /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">WhatsApp / Celular</label><div className="relative"><Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="tel" value={identityPhone} onChange={e => setIdentityPhone(e.target.value)} className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary transition font-medium" placeholder="(00) 90000-0000" /></div><p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1"><AlertCircle size={10} /> Enviaremos o status do pedido por aqui.</p></div>
            </div>
        </div>
    );

    const renderFulfillmentStep = () => (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <h3 className="font-bold text-gray-800 text-lg">Como você quer receber?</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Entregar no endereço</p>{user.address ? (<><p className="font-bold text-gray-800 text-sm">{user.address.split(',')[0]}</p><p className="text-xs text-gray-500">{user.address}</p></>) : (<p className="text-sm text-gray-500 italic">Nenhum endereço selecionado</p>)}</div>
                        <button onClick={onOpenAddressModal} className="text-xs font-bold text-summo-primary bg-summo-bg px-3 py-1.5 rounded-lg">Trocar</button>
                    </div>
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                        {[{ id: OrderType.DELIVERY, label: 'Entrega', icon: Bike }, { id: OrderType.TAKEOUT, label: 'Retirada', icon: Store }].map(m => (<button key={m.id} onClick={() => setOrderMode(m.id)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${orderMode === m.id ? 'bg-white text-summo-primary shadow' : 'text-gray-500 hover:bg-white/50'}`}><m.icon size={16} /> {m.label}</button>))}
                    </div>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">Opções de {orderMode === OrderType.DELIVERY ? 'entrega' : 'retirada'}</h4>
                <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${!isScheduling ? 'border-summo-primary bg-summo-bg/20' : 'border-gray-100 bg-white'}`}><div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isScheduling ? 'border-summo-primary' : 'border-gray-300'}`}>{!isScheduling && <div className="w-2.5 h-2.5 bg-summo-primary rounded-full" />}</div><div><p className="font-bold text-sm text-gray-800">Padrão (Agora)</p><p className="text-xs text-gray-500">{settings.orderModes?.delivery?.minTime || 30}-{settings.orderModes?.delivery?.maxTime || 60} min</p></div></div><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Rápido</span></label>
                    {settings.orderModes?.scheduling?.enabled && (<div className={`rounded-xl border-2 transition overflow-hidden ${isScheduling ? 'border-summo-primary bg-summo-bg/10' : 'border-gray-100 bg-white'}`}><label className="flex items-center justify-between p-4 cursor-pointer" onClick={() => { setIsScheduling(true); if (!scheduledTime && generateTimeSlots.length > 0) setScheduledTime(generateTimeSlots[0]); }}><div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isScheduling ? 'border-summo-primary' : 'border-gray-300'}`}>{isScheduling && <div className="w-2.5 h-2.5 bg-summo-primary rounded-full" />}</div><div><p className="font-bold text-sm text-gray-800">Agendar</p><p className="text-xs text-gray-500">Escolha um horário</p></div></div></label>{isScheduling && (<div className="px-4 pb-4 animate-fade-in"><div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{generateTimeSlots.map(time => (<button key={time} onClick={() => setScheduledTime(time)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${scheduledTime === time ? 'bg-summo-primary text-white border-summo-primary' : 'bg-white border-gray-200 text-gray-600'}`}>{time}</button>))}</div></div>)}</div>)}
                </div>
            </div>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-slide-in-right">
            <h3 className="font-bold text-gray-800 text-lg">Pagamento pelo app</h3>
            <div className="space-y-3">{[{ id: 'Pix', label: 'Pix', icon: Smartphone, color: 'text-teal-600', sub: 'Aprovação imediata' }, { id: 'Cartão', label: 'Cartão na Entrega', icon: CreditCard, color: 'text-blue-600', sub: 'Levar maquininha' }, { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-green-600', sub: 'Pagamento na entrega' }].map((method) => (<label key={method.id} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition shadow-sm hover:shadow-md ${paymentMethod === method.id ? 'border-summo-primary bg-summo-bg/10 ring-1 ring-summo-primary/20' : 'border-gray-100 bg-white'}`}><input type="radio" name="payment" className="hidden" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} /><div className={`p-3 rounded-full mr-4 bg-gray-50 ${paymentMethod === method.id ? 'bg-white shadow-sm' : ''}`}><method.icon size={24} className={method.color} /></div><div className="flex-1"><span className="font-bold text-sm text-gray-800 block">{method.label}</span><span className="text-xs text-gray-500">{method.sub}</span></div><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'border-summo-primary bg-summo-primary' : 'border-gray-300'}`}>{paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}</div></label>))}</div>
            {paymentMethod === 'Dinheiro' && (<div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl animate-fade-in"><p className="text-xs font-bold text-yellow-800 mb-2 uppercase">Precisa de troco?</p><div className="flex gap-2 items-center"><span className="text-yellow-600 font-bold">R$</span><input type="text" value={changeFor} onChange={e => setChangeFor(e.target.value)} placeholder="Para quanto? (Ex: 50,00)" className="flex-1 bg-white border-yellow-200 border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-yellow-500" /></div></div>)}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Resumo Final</h4><div className="space-y-2 text-sm"><div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>{isDelivery && <div className="flex justify-between text-gray-600"><span>Taxa de Entrega</span><span>R$ {deliveryFee.toFixed(2)}</span></div>}{discountValue > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Desconto</span><span>- R$ {discountValue.toFixed(2)}</span></div>}<div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200 mt-2"><span>Total a pagar</span><span>R$ {finalTotal.toFixed(2)}</span></div></div></div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col h-full animate-slide-in-right">
            {renderHeader()}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                {step === 'BAG' && renderBagStep()}
                {step === 'IDENTITY' && renderIdentityStep()}
                {step === 'FULFILLMENT' && renderFulfillmentStep()}
                {step === 'PAYMENT' && renderPaymentStep()}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.08)] z-20">
                {step !== 'PAYMENT' ? (
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col"><span className="text-[10px] text-gray-500 font-bold uppercase">Total</span><span className="text-xl font-bold text-gray-900 leading-none">R$ {finalTotal.toFixed(2)}</span></div>
                        <button onClick={handleContinue} disabled={cart.length === 0} className="bg-summo-primary text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-summo-dark transition shadow-lg shadow-summo-primary/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Continuar <ArrowRight size={18} /></button>
                    </div>
                ) : (
                    <button onClick={onSendOrder} disabled={isSending} className="w-full py-4 bg-summo-primary text-white rounded-xl font-bold text-lg hover:bg-summo-dark transition shadow-lg shadow-summo-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95">{isSending ? <Loader2 className="animate-spin" /> : 'Fazer Pedido'}</button>
                )}
            </div>
        </div>
    );
};

export default CartModal;
