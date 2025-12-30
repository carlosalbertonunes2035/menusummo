'use client';

import React from 'react';
import { ShoppingBag, X, Minus, Plus, Utensils, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import { getProductChannel } from '@/lib/utils';
import { CartCheckoutProps } from './types';

interface BagStepProps extends Pick<CartCheckoutProps, 'cart' | 'updateCartItem' | 'settings' | 'onClose' | 'upsellItems' | 'onAddUpsellItem' | 'appliedCoupon' | 'setAppliedCoupon' | 'coupons' | 'couponInput' | 'setCouponInput' | 'handleApplyCoupon' | 'loyaltySettings' | 'userPoints' | 'redeemPoints' | 'setRedeemPoints' | 'cartTotal' | 'discountValue' | 'loyaltyDiscount' | 'deliveryFee' | 'isDelivery' | 'finalTotal'> {
    animationDirection: 'left' | 'right';
}

// Note: I need to ensure all required props are passed from useCartCheckout or main component
export const BagStep: React.FC<any> = ({
    cart, updateCartItem, settings, onClose, upsellItems, onAddUpsellItem,
    appliedCoupon, setAppliedCoupon, coupons, couponInput, setCouponInput,
    handleApplyCoupon, loyaltySettings, userPoints, redeemPoints, setRedeemPoints,
    cartTotal, discountValue, loyaltyDiscount, deliveryFee, isDelivery, finalTotal,
    animationDirection, showToast
}) => {
    return (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'left' ? 'animate-slide-in-left' : 'animate-fade-in'}`}>
            <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                    <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
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
                        {cart.map((item: any, idx: number) => {
                            const channel = getProductChannel(item.product, 'digital-menu');
                            const price = channel.promotionalPrice || channel.price || 0;
                            const optionsPrice = item.selectedOptions ? item.selectedOptions.reduce((acc: number, opt: any) => acc + opt.price, 0) : 0;
                            return (
                                <div key={idx} className="flex gap-4 bg-white p-1 rounded-2xl group">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                                        {channel.image && <img src={channel.image} className="w-full h-full object-cover" alt={item.product.name} />}
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
                                            <p className="text-[10px] text-gray-500 mt-1 truncate">{item.selectedOptions.map((o: any) => o.optionName).join(', ')}</p>
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
                                {upsellItems.map((prod: any) => {
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
                                        {coupons.map((c: any) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    if (setAppliedCoupon) {
                                                        setAppliedCoupon(c);
                                                        showToast(`Cupom ${c.code} aplicado!`, 'success');
                                                    }
                                                }}
                                                className="border border-green-200 bg-green-50 rounded-xl p-3 min-w-[140px] text-left hover:bg-green-100 transition relative group active:scale-95 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <p className="font-bold text-green-700 text-xs mb-0.5">{c.code}</p>
                                                    <p className="text-[10px] text-green-600 leading-tight">{(c as any).title || `${c.value}% OFF`}</p>
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

                    {loyaltySettings?.enabled && userPoints > 0 && (
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl text-white shadow-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-full"><Sparkles className="text-amber-400" size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Seu Saldo Cashback</p>
                                    <p className="font-bold text-white text-lg flex items-center gap-1">
                                        {userPoints} <span className="text-xs font-normal opacity-70">{loyaltySettings.branding?.name || 'Pontos'}</span>
                                    </p>
                                </div>
                            </div>

                            {userPoints >= (loyaltySettings.minRedemptionPoints || 0) ? (
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-2">
                                        <p className="text-[10px] text-gray-300">Desconto disp.</p>
                                        <p className="font-bold text-green-400">R$ {((userPoints / 100) * (loyaltySettings.cashbackValuePer100Points || 0)).toFixed(2)}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={redeemPoints} onChange={() => setRedeemPoints(!redeemPoints)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Mínimo para uso</p>
                                    <p className="font-bold text-xs text-gray-300">{loyaltySettings.minRedemptionPoints} pts</p>
                                </div>
                            )}
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
                        {loyaltyDiscount > 0 && (
                            <div className="flex justify-between text-sm text-amber-500 font-bold">
                                <span>Cashback Utilizado</span>
                                <span>- R$ {loyaltyDiscount.toFixed(2)}</span>
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
};
