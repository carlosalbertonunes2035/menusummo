import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useCouponsQuery } from '@/lib/react-query/queries/useCouponsQuery';
import { CouponFormData, CouponAnalytics, Coupon } from './types';

export function useCouponTable() {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { coupons, saveCoupon, deleteCoupon } = useCouponsQuery(tenantId);
    const { data: orders } = useOrders({ limit: 500 });
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState<CouponFormData>({
        code: '',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 0,
        usageLimit: 0
    });

    const getAnalytics = (code: string): CouponAnalytics => {
        const relevantOrders = orders.filter(o => o.couponCode === code && o.status !== 'CANCELLED');
        const count = relevantOrders.length;
        const revenue = relevantOrders.reduce((sum, o) => sum + o.total, 0);
        const discount = relevantOrders.reduce((sum, o) => sum + (o.discountTotal || 0), 0);
        return { count, revenue, discount };
    };

    const handleCreate = async () => {
        if (!formData.code) return showToast('Código obrigatório', 'error');

        const newCoupon: Partial<Coupon> = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue),
            usageLimit: Number(formData.usageLimit),
            isActive: true,
            createdAt: new Date(),
            usageCount: 0
        };

        try {
            await saveCoupon(newCoupon);
            showToast(`Cupom ${newCoupon.code} criado!`, 'success');
            setIsCreating(false);
            setFormData({ code: '', type: 'PERCENTAGE', value: 10, minOrderValue: 0, usageLimit: 0 });
        } catch (_error) {
            showToast('Erro ao criar cupom', 'error');
        }
    };

    const toggleStatus = async (coupon: Coupon) => {
        await saveCoupon({ id: coupon.id, isActive: !coupon.isActive });
        showToast(`Cupom ${coupon.isActive ? 'pausado' : 'ativado'}`, 'info');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Excluir este cupom?")) return;
        await deleteCoupon(id);
        showToast('Cupom excluído', 'info');
    };

    return {
        coupons,
        isCreating,
        setIsCreating,
        formData,
        setFormData,
        getAnalytics,
        handleCreate,
        toggleStatus,
        handleDelete
    };
}
