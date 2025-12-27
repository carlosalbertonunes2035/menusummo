import { useMemo } from 'react';
import { Product, StoreSettings } from '@/types';

export const useProductPricing = (
    product: Product,
    settings: StoreSettings,
    channel: string = 'pos'
) => {
    const pricing = useMemo(() => {
        const channelData = product.channels?.find(c => c.channel === channel);
        const price = channelData?.promotionalPrice || channelData?.price || 0;

        // Cost Basis
        const cost = product.realCost || product.cost || 0;
        const packagingCost = settings.financial?.packagingAvgCost || 0;
        const totalVariableCost = cost + packagingCost;

        // Fixed Costs & Taxes
        const taxRate = settings.financial?.taxRate || 0;
        const fixedCostRate = settings.financial?.fixedCostRate || 0;

        // Channel Specific Fees
        let channelFeePercent = 0;
        let channelFixedFee = 0;

        if (channel === 'ifood') {
            const ifoodConfig = settings.financial?.ifood || { commission: 12, paymentFee: 3.2 };
            // Commission + Payment Fee (e.g., 23% + 3.2% = 26.2%)
            channelFeePercent = (ifoodConfig.commission || 0) + (ifoodConfig.paymentFee || 0);
        } else if (channel === 'pos') {
            // For POS, we estimate financial cost based on payment provider rates
            const rates = settings.financial?.payment?.rates;
            if (rates) {
                // We use a conservative "Blended Rate" or the Credit Cash rate as a baseline for margin safety
                // If Credit Cash is set, use it. Otherwise average of non-zero rates.
                const validRates = [rates.debit, rates.creditCash, rates.creditInstallment].filter(r => r > 0);
                const avgRate = validRates.length > 0 ? (validRates.reduce((a, b) => a + b, 0) / validRates.length) : 0;
                channelFeePercent = avgRate;
            }
        }

        // --- CALCULATIONS ---

        // 1. Deductions
        const taxValue = price * (taxRate / 100);
        const fixedCostValue = price * (fixedCostRate / 100);
        const channelFeeValue = price * (channelFeePercent / 100) + channelFixedFee;

        // 2. Margins
        const netRevenue = price - taxValue - channelFeeValue; // Revenue after taxes & fees (Sales Revenue)
        const contributionMargin = netRevenue - totalVariableCost - fixedCostValue; // Contribution to profit

        // Net Profit (Final Bottom Line)
        const netProfit = contributionMargin;

        // Formulas
        const marginPercent = price > 0 ? (netProfit / price) * 100 : 0; // Net Margin %
        const markup = totalVariableCost > 0 ? ((price - totalVariableCost) / totalVariableCost) * 100 : 0; // Markup on CMV+Pkg
        const cmvPercent = price > 0 ? (totalVariableCost / price) * 100 : 0;

        return {
            price,
            cost: totalVariableCost, // CMV + Packaging
            rawCost: cost,
            packagingCost,
            taxes: taxValue,
            fixedCost: fixedCostValue,
            channelFees: channelFeeValue,
            netRevenue,
            profit: netProfit,
            margin: marginPercent,
            markup: markup,
            cmvPercent: cmvPercent,
            pieData: [
                { name: 'Custo (CMV + Emb)', value: totalVariableCost, color: '#f59e0b' }, // Amber
                { name: 'Impostos', value: taxValue, color: '#ef4444' }, // Red
                { name: 'Taxas (Card/App)', value: channelFeeValue, color: '#f97316' }, // Orange
                { name: 'Custos Fixos', value: fixedCostValue, color: '#64748b' }, // Slate
                { name: 'Lucro Líquido', value: Math.max(0, netProfit), color: '#22c55e' } // Green
            ].filter(d => d.value > 0.01) // smooth out tiny float errors
        };
    }, [product, settings, channel]);

    return pricing;
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
    // Formula: Price = TotalCost / (1 - (Tax + Fixed + Fees + Margin)/100)
    const denominator = 1 - ((taxRate + fixedCostRate + channelFees + targetMargin) / 100);
    return denominator > 0.05 ? totalCost / denominator : 0; // Prevent divide by zero or negative price
};
