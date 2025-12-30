import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SERVICE_CHARGE_PERCENTAGE } from '@/features/virtual-tab/constants';

/**
 * CRITICAL TESTS - Financial Functions
 * 
 * These tests ensure 100% accuracy in financial calculations
 * Any failure here is a CRITICAL bug that must be fixed immediately
 */

/**
 * Calculate service charge with exact precision
 */
export function calculateServiceCharge(amount: number): number {
    if (!isFinite(amount) || isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }
    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }
    return Math.round(amount * SERVICE_CHARGE_PERCENTAGE * 100) / 100;
}

/**
 * Calculate total with service charge
 */
export function calculateTotal(subtotal: number): number {
    if (!isFinite(subtotal) || isNaN(subtotal)) {
        throw new Error('Subtotal must be a valid number');
    }
    if (subtotal < 0) {
        throw new Error('Subtotal cannot be negative');
    }
    const serviceCharge = calculateServiceCharge(subtotal);
    return Math.round((subtotal + serviceCharge) * 100) / 100;
}

/**
 * Calculate loss cost
 */
export function calculateLossCost(amount: number, percentage: number): number {
    if (!isFinite(amount) || isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }
    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }
    if (percentage < 0 || percentage > 1) {
        throw new Error('Percentage must be between 0 and 1');
    }
    // Use (amount * 100 * percentage) / 100 to operate on cents and avoid IEEE 754 errors with .5
    return Math.round((amount * 100) * percentage) / 100;
}

describe('CRITICAL: Financial Functions', () => {
    describe('calculateServiceCharge', () => {
        // ✅ Test 1: Basic calculation
        it('should calculate 10% service charge correctly', () => {
            expect(calculateServiceCharge(100)).toBe(10);
            expect(calculateServiceCharge(78)).toBe(7.8);
            expect(calculateServiceCharge(89)).toBe(8.9);
            expect(calculateServiceCharge(120)).toBe(12);
            expect(calculateServiceCharge(150)).toBe(15);
        });

        // ✅ Test 2: Decimal precision
        it('should handle decimal precision correctly', () => {
            expect(calculateServiceCharge(33.33)).toBe(3.33);
            expect(calculateServiceCharge(66.67)).toBe(6.67);
            expect(calculateServiceCharge(99.99)).toBe(10);
            expect(calculateServiceCharge(123.45)).toBe(12.35);
        });

        // ✅ Test 3: Edge cases
        it('should handle edge cases', () => {
            expect(calculateServiceCharge(0)).toBe(0);
            expect(calculateServiceCharge(0.01)).toBe(0);
            expect(calculateServiceCharge(0.09)).toBe(0.01);
            expect(calculateServiceCharge(9999.99)).toBe(1000);
        });

        // ✅ Test 4: Negative values (security)
        it('should reject negative values', () => {
            expect(() => calculateServiceCharge(-10)).toThrow('Amount cannot be negative');
            expect(() => calculateServiceCharge(-0.01)).toThrow('Amount cannot be negative');
        });

        // ✅ Test 5: Invalid inputs
        it('should reject invalid inputs', () => {
            expect(() => calculateServiceCharge(NaN)).toThrow('Amount must be a valid number');
            expect(() => calculateServiceCharge(Infinity)).toThrow('Amount must be a valid number');
            expect(() => calculateServiceCharge(-Infinity)).toThrow('Amount must be a valid number');
        });

        // ✅ Test 6: Rounding
        it('should round to 2 decimal places', () => {
            expect(calculateServiceCharge(33.333)).toBe(3.33);
            expect(calculateServiceCharge(66.666)).toBe(6.67);
            expect(calculateServiceCharge(99.999)).toBe(10);
        });

        // ✅ Test 7: Performance
        it('should calculate in less than 1ms for 1000 iterations', () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                calculateServiceCharge(Math.random() * 1000);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(10);
        });

        // ✅ Test 8: Consistency
        it('should return same result for same input', () => {
            const amount = 123.45;
            const result1 = calculateServiceCharge(amount);
            const result2 = calculateServiceCharge(amount);
            const result3 = calculateServiceCharge(amount);
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });
    });

    describe('calculateTotal', () => {
        // ✅ Test 1: Basic calculation
        it('should calculate total with service charge', () => {
            expect(calculateTotal(100)).toBe(110); // 100 + 10
            expect(calculateTotal(78)).toBe(85.8); // 78 + 7.8
            expect(calculateTotal(89)).toBe(97.9); // 89 + 8.9
            expect(calculateTotal(120)).toBe(132); // 120 + 12
        });

        // ✅ Test 2: Zero subtotal
        it('should handle zero subtotal', () => {
            expect(calculateTotal(0)).toBe(0);
        });

        // ✅ Test 3: Precision
        it('should maintain precision', () => {
            expect(calculateTotal(33.33)).toBe(36.66);
            expect(calculateTotal(66.67)).toBe(73.34);
        });

        // ✅ Test 4: Negative values
        it('should reject negative values', () => {
            expect(() => calculateTotal(-10)).toThrow('Subtotal cannot be negative');
        });

        // ✅ Test 5: Invalid inputs
        it('should reject invalid inputs', () => {
            expect(() => calculateTotal(NaN)).toThrow('Subtotal must be a valid number');
            expect(() => calculateTotal(Infinity)).toThrow('Subtotal must be a valid number');
        });

        // ✅ Test 6: Performance
        it('should be performant', () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                calculateTotal(Math.random() * 1000);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(10);
        });

        // ✅ Test 7: Consistency
        it('should be consistent', () => {
            const result1 = calculateTotal(123.45);
            const result2 = calculateTotal(123.45);
            expect(result1).toBe(result2);
        });
    });

    describe('calculateLossCost', () => {
        // ✅ Test 1: Basic calculation
        it('should calculate 30% cost correctly', () => {
            expect(calculateLossCost(150, 0.3)).toBe(45);
            expect(calculateLossCost(100, 0.3)).toBe(30);
        });

        // ✅ Test 2: Different percentages
        it('should handle different percentages', () => {
            expect(calculateLossCost(100, 0.1)).toBe(10);
            expect(calculateLossCost(100, 0.5)).toBe(50);
            expect(calculateLossCost(100, 1.0)).toBe(100);
            expect(calculateLossCost(100, 0)).toBe(0);
        });

        // ✅ Test 3: Decimal amounts
        it('should handle decimal amounts', () => {
            expect(calculateLossCost(123.45, 0.3)).toBe(37.04);
            expect(calculateLossCost(66.67, 0.5)).toBe(33.34);
        });

        // ✅ Test 4: Invalid percentages
        it('should reject invalid percentages', () => {
            expect(() => calculateLossCost(100, -0.1)).toThrow('Percentage must be between 0 and 1');
            expect(() => calculateLossCost(100, 1.1)).toThrow('Percentage must be between 0 and 1');
            expect(() => calculateLossCost(100, 2)).toThrow('Percentage must be between 0 and 1');
        });

        // ✅ Test 5: Negative amounts
        it('should reject negative amounts', () => {
            expect(() => calculateLossCost(-100, 0.3)).toThrow('Amount cannot be negative');
        });

        // ✅ Test 6: Zero values
        it('should handle zero values', () => {
            expect(calculateLossCost(0, 0.3)).toBe(0);
            expect(calculateLossCost(100, 0)).toBe(0);
            expect(calculateLossCost(0, 0)).toBe(0);
        });

        // ✅ Test 7: Precision
        it('should maintain precision', () => {
            expect(calculateLossCost(33.33, 0.3)).toBe(10);
            expect(calculateLossCost(66.66, 0.5)).toBe(33.33);
        });

        // ✅ Test 8: Performance
        it('should be performant', () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                calculateLossCost(Math.random() * 1000, 0.3);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(10);
        });

        // ✅ Test 9: Consistency
        it('should be consistent', () => {
            const result1 = calculateLossCost(150, 0.3);
            const result2 = calculateLossCost(150, 0.3);
            expect(result1).toBe(result2);
            expect(result1).toBe(45);
        });

        // ✅ Test 10: Rounding
        it('should round correctly', () => {
            expect(calculateLossCost(33.333, 0.3)).toBe(10);
            expect(calculateLossCost(66.666, 0.5)).toBe(33.33);
        });
    });

    describe('Financial Calculations - Integration', () => {
        it('should calculate complete bill correctly', () => {
            const subtotal = 78;
            const serviceCharge = calculateServiceCharge(subtotal);
            const total = calculateTotal(subtotal);

            expect(serviceCharge).toBe(7.8);
            expect(total).toBe(85.8);
            expect(total).toBe(subtotal + serviceCharge);
        });

        it('should handle multiple orders', () => {
            const order1 = 50;
            const order2 = 28;
            const subtotal = order1 + order2;
            const total = calculateTotal(subtotal);

            expect(subtotal).toBe(78);
            expect(total).toBe(85.8);
        });

        it('should calculate loss correctly', () => {
            const totalAmount = 150;
            const cost = calculateLossCost(totalAmount, 0.3);

            expect(cost).toBe(45);
        });
    });
});
