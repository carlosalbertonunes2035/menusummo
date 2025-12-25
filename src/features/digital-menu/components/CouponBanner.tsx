import React from 'react';
import { Ticket, ChevronRight } from 'lucide-react';
import { Coupon } from '@/types';

interface CouponBannerProps {
    coupons: Coupon[];
    onSelect: (coupon: Coupon) => void;
}

const CouponBanner: React.FC<CouponBannerProps> = ({ coupons, onSelect }) => {
    if (!coupons || coupons.length === 0) return null;

    return (
        <div className="px-4 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Ticket size={12} /> Clube de Descontos</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {coupons.map(coupon => (
                    <div
                        key={coupon.id}
                        onClick={() => onSelect(coupon)}
                        className="flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-0 flex overflow-hidden min-w-[240px] cursor-pointer relative group active:scale-95 transition-transform"
                    >
                        {/* Visual Ticket Stub Effect */}
                        <div className="bg-summo-primary w-2 h-full absolute left-0 top-0"></div>
                        <div className="bg-summo-primary/10 p-3 flex items-center justify-center border-r border-dashed border-summo-primary/30">
                            <Ticket className="text-summo-primary" size={20} />
                        </div>
                        <div className="p-3 flex-1">
                            <p className="font-bold text-summo-dark text-sm">Cupom Especial</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Mínimo: R$ {(coupon.minOrderValue || 0).toFixed(2)}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">{coupon.code}</span>
                                <span className="text-[10px] text-summo-primary font-bold flex items-center gap-1">Pegar <ChevronRight size={10} /></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouponBanner;
