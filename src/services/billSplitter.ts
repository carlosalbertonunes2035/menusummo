/**
 * Bill Splitter - Fast bill splitting algorithms
 * Performance: ~0.3ms
 * Use case: Split bill functionality in Waiter/POS
 */

import { OrderItem } from '@/types';

export interface SplitResult {
    perPerson: number;
    adjustments: number[];
    total: number;
}

export interface SplitByItemResult {
    personTotals: number[];
    itemAssignments: Map<string, number>;
}

/**
 * Splits bill equally among people
 * Handles rounding to ensure total matches exactly
 * @param total - Total bill amount
 * @param people - Number of people
 * @returns Split result with per-person amount and adjustments
 */
export function splitBillEqually(total: number, people: number): SplitResult {
    if (people <= 0) {
        throw new Error('Number of people must be greater than 0');
    }

    // Base amount per person (rounded down to cents)
    const baseAmount = Math.floor((total / people) * 100) / 100;

    // Calculate remainder (cents that need to be distributed)
    const remainder = Math.round((total - (baseAmount * people)) * 100) / 100;

    // Create array with base amounts
    const adjustments = Array(people).fill(baseAmount);

    // Distribute remaining cents to first N people
    let remainingCents = Math.round(remainder * 100);
    for (let i = 0; i < people && remainingCents > 0; i++) {
        adjustments[i] = Math.round((adjustments[i] + 0.01) * 100) / 100;
        remainingCents--;
    }

    return {
        perPerson: baseAmount,
        adjustments,
        total
    };
}

/**
 * Splits bill by assigning items to people
 * @param items - Order items
 * @param assignments - Map of itemId to personIndex
 * @returns Array of totals per person
 */
export function splitBillByItems(
    items: OrderItem[],
    assignments: Map<string, number>
): SplitByItemResult {
    const totals = new Map<number, number>();

    items.forEach(item => {
        const personIndex = assignments.get(item.productId) ?? 0;
        const itemTotal = item.price * item.quantity;
        const currentTotal = totals.get(personIndex) || 0;
        totals.set(personIndex, Math.round((currentTotal + itemTotal) * 100) / 100);
    });

    // Convert to array (fill missing indices with 0)
    const maxIndex = Math.max(...Array.from(totals.keys()));
    const personTotals = Array.from({ length: maxIndex + 1 }, (_, i) => totals.get(i) || 0);

    return {
        personTotals,
        itemAssignments: assignments
    };
}

/**
 * Splits bill with custom amounts per person
 * Validates that sum equals total
 * @param customAmounts - Array of custom amounts per person
 * @param total - Expected total
 * @returns true if valid, false otherwise
 */
export function validateCustomSplit(customAmounts: number[], total: number): boolean {
    const sum = customAmounts.reduce((acc, amount) => acc + amount, 0);
    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(total * 100) / 100;

    return Math.abs(roundedSum - roundedTotal) < 0.01;
}

/**
 * Suggests equal split with option to adjust
 * @param total - Total amount
 * @param people - Number of people
 * @returns Suggested amounts that can be manually adjusted
 */
export function suggestSplit(total: number, people: number): number[] {
    const result = splitBillEqually(total, people);
    return result.adjustments;
}
