import { describe, it, expect } from 'vitest';
import { calculateChange, formatChangeBreakdown, isPaymentSufficient } from '@/utils/cashCalculator';

describe('cashCalculator', () => {
    describe('calculateChange', () => {
        it('should calculate correct change for simple case', () => {
            const result = calculateChange(158.00, 200.00);
            expect(result.change).toBe(42.00);
            expect(result.bills).toHaveLength(2);
            expect(result.bills[0]).toEqual({ value: 20, count: 2 });
            expect(result.bills[1]).toEqual({ value: 2, count: 1 });
        });

        it('should handle exact payment (no change)', () => {
            const result = calculateChange(50.00, 50.00);
            expect(result.change).toBe(0);
            expect(result.bills).toHaveLength(0);
        });

        it('should handle insufficient payment', () => {
            const result = calculateChange(100.00, 50.00);
            expect(result.change).toBe(0);
            expect(result.bills).toHaveLength(0);
        });

        it('should handle cents correctly', () => {
            const result = calculateChange(15.75, 20.00);
            expect(result.change).toBe(4.25);
            // Should have 2 reais + 25 centavos
            expect(result.bills).toContainEqual({ value: 2, count: 2 });
            expect(result.bills).toContainEqual({ value: 0.25, count: 1 });
        });

        it('should handle large amounts', () => {
            const result = calculateChange(350.00, 500.00);
            expect(result.change).toBe(150.00);
            expect(result.bills[0]).toEqual({ value: 100, count: 1 });
            expect(result.bills[1]).toEqual({ value: 50, count: 1 });
        });
    });

    describe('formatChangeBreakdown', () => {
        it('should format change breakdown correctly', () => {
            const breakdown = calculateChange(158.00, 200.00);
            const formatted = formatChangeBreakdown(breakdown);
            expect(formatted).toContain('2x R$ 20.00');
            expect(formatted).toContain('1x R$ 2.00');
        });

        it('should handle no change', () => {
            const breakdown = { change: 0, bills: [] };
            const formatted = formatChangeBreakdown(breakdown);
            expect(formatted).toBe('Sem troco');
        });
    });

    describe('isPaymentSufficient', () => {
        it('should return true for sufficient payment', () => {
            expect(isPaymentSufficient(100, 100)).toBe(true);
            expect(isPaymentSufficient(100, 150)).toBe(true);
        });

        it('should return false for insufficient payment', () => {
            expect(isPaymentSufficient(100, 50)).toBe(false);
            expect(isPaymentSufficient(100, 99.99)).toBe(false);
        });
    });
});
