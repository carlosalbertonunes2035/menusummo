/**
 * Cash Calculator - Ultrafast change calculation
 * Performance: ~0.1ms
 * Use case: Waiter payment flow
 */

export interface ChangeBreakdown {
    change: number;
    bills: { value: number; count: number }[];
}

/**
 * Calculates change and provides optimal bill breakdown
 * @param total - Total amount to pay
 * @param paid - Amount paid by customer
 * @returns Change amount and bill breakdown
 */
export function calculateChange(total: number, paid: number): ChangeBreakdown {
    const change = paid - total;

    if (change < 0) {
        return { change: 0, bills: [] };
    }

    // Brazilian currency denominations in descending order
    const denominations = [200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.25, 0.10, 0.05, 0.01];
    const bills: { value: number; count: number }[] = [];

    // Round to avoid floating point precision issues
    let remaining = Math.round(change * 100) / 100;

    for (const denom of denominations) {
        const count = Math.floor(remaining / denom);
        if (count > 0) {
            bills.push({ value: denom, count });
            remaining = Math.round((remaining - (denom * count)) * 100) / 100;
        }

        // Early exit if we've distributed all change
        if (remaining < 0.01) break;
    }

    return { change, bills };
}

/**
 * Formats change breakdown for display
 * @param breakdown - Change breakdown from calculateChange
 * @returns Human-readable string
 */
export function formatChangeBreakdown(breakdown: ChangeBreakdown): string {
    if (breakdown.bills.length === 0) {
        return 'Sem troco';
    }

    return breakdown.bills
        .map(b => `${b.count}x R$ ${b.value.toFixed(2)}`)
        .join(', ');
}

/**
 * Validates if payment is sufficient
 * @param total - Total amount
 * @param paid - Amount paid
 * @returns true if payment covers total
 */
export function isPaymentSufficient(total: number, paid: number): boolean {
    return paid >= total;
}
