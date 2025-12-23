/**
 * Pricing Calculator Utilities
 * Centralized pricing calculations for products
 */

export const pricingCalculator = {
    /**
     * Calculate CMV (Cost of Goods Sold) percentage
     */
    calculateCMV: (cost: number, price: number): number => {
        return price > 0 ? (cost / price) * 100 : 0;
    },

    /**
     * Calculate profit margin percentage
     */
    calculateMargin: (cost: number, price: number): number => {
        const profit = price - cost;
        return price > 0 ? (profit / price) * 100 : 0;
    },

    /**
     * Calculate ideal price based on target margin and costs
     */
    calculateIdealPrice: (
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
    },

    /**
     * Calculate profit after all costs
     */
    calculateProfit: (
        price: number,
        cost: number,
        packagingCost: number,
        taxRate: number,
        fixedCostRate: number,
        channelFees: number
    ): number => {
        const taxes = price * (taxRate / 100);
        const fixedCost = price * (fixedCostRate / 100);
        const fees = price * (channelFees / 100);
        return price - cost - packagingCost - taxes - fixedCost - fees;
    },

    /**
     * Calculate break-even price (minimum price to cover costs)
     */
    calculateBreakEven: (
        cost: number,
        packagingCost: number,
        taxRate: number,
        fixedCostRate: number,
        channelFees: number
    ): number => {
        const totalCost = cost + packagingCost;
        const denominator = 1 - ((taxRate + fixedCostRate + channelFees) / 100);
        return denominator > 0 ? totalCost / denominator : 0;
    }
};
