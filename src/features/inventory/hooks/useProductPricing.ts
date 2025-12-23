import { useMemo } from 'react';
import { Product, StoreSettings } from '@/types';

export const useProductPricing = (
    product: Product,
    settings: StoreSettings,
    channel: string = 'pos'
) => {
    return useMemo(() => {
        const channelData = product.channels?.find(c => c.channel === channel);
        const price = channelData?.promotionalPrice || channelData?.price || 0;
        const cost = product.realCost || product.cost || 0;

        const packagingCost = settings.financial?.packagingAvgCost || 0;
        const taxRate = settings.financial?.taxRate || 0;
        const fixedCostRate = settings.financial?.fixedCostRate || 0;

        // Channel-specific fees
        const ifoodSettings = settings.integrations?.ifood;
        const feesPercent = channel === 'ifood'
            ? ((ifoodSettings?.commissionRate || 0) + (ifoodSettings?.financialFee || 0))
            : 0;

        const cmv = cost;
        const cmvPercent = price > 0 ? (cmv / price) * 100 : 0;
        const taxes = price * (taxRate / 100);
        const fixedCost = price * (fixedCostRate / 100);
        const channelFees = price * (feesPercent / 100);
        const profit = price - cmv - packagingCost - taxes - fixedCost - channelFees;
        const margin = price > 0 ? (profit / price) * 100 : 0;

        return {
            price,
            cost: cmv,
            packagingCost,
            taxes,
            fixedCost,
            channelFees,
            profit,
            margin,
            cmvPercent,
            pieData: [
                { name: 'Insumos', value: cmv, color: '#f59e0b' },
                { name: 'Embalagem', value: packagingCost, color: '#64748b' },
                { name: 'Impostos/Fixo', value: taxes + fixedCost, color: '#ef4444' },
                { name: 'Taxas Canal', value: channelFees, color: '#f43f5e' },
                { name: 'Lucro Real', value: Math.max(0, profit), color: '#22c55e' }
            ].filter(d => d.value > 0)
        };
    }, [product, settings, channel]);
};

export const calculateIdealPrice = (
    cost: number,
    targetMargin: number,
    taxRate: number,
    fixedCostRate: number,
    channelFees: number,
    packagingCost: number = 0
): number => {
    const totalCost = cost + packagingCost;
    const denominator = 1 - ((taxRate + fixedCostRate + channelFees + targetMargin) / 100);
    return denominator > 0 ? totalCost / denominator : 0;
};
