import { describe, it, expect } from 'vitest';
import { normalizeText, searchMatch, formatCurrency, generateWhatsAppLink, solveTSPLocal } from './utils';

describe('utils.ts', () => {

    describe('normalizeText', () => {
        it('should lowercase and remove accents', () => {
            // Note: normalizeText performs aggressive phonetic simplification
            // lh -> l, ao -> o, etc.
            expect(normalizeText('Medalhão')).toBe('medalo'); // medalhao -> medalao -> medalo
            expect(normalizeText('AÇÃO')).toBe('aco'); // acao -> aco
            expect(normalizeText('Épico')).toBe('epico');
        });

        it('should handle special replacements', () => {
            expect(normalizeText('Niño')).toBe('nino');
            expect(normalizeText('Pollo')).toBe('polo');
            expect(normalizeText('Alho')).toBe('alo');
        });

        it('should return empty string for null/undefined', () => {
            expect(normalizeText('')).toBe('');
            expect(normalizeText(null as any)).toBe('');
        });
    });

    describe('searchMatch', () => {
        it('should return true for empty query', () => {
            expect(searchMatch('Product', '')).toBe(true);
        });

        it('should match partial strings regardless of case/accents', () => {
            expect(searchMatch('Pizza de Calabreza', 'calabre')).toBe(true);
            expect(searchMatch('Pizza de Calabreza', 'CALABREZA')).toBe(true);
            expect(searchMatch('Açaí Tradicional', 'acai')).toBe(true);
        });

        it('should match multiple terms (AND logic)', () => {
            expect(searchMatch('Pizza de Frango com Catupiry', 'pizza frango')).toBe(true);
            expect(searchMatch('Pizza de Frango com Catupiry', 'catupiry pizza')).toBe(true);
        });

        it('should return false if one term does not match', () => {
            expect(searchMatch('Pizza de Frango', 'pizza carne')).toBe(false);
        });
    });

    describe('formatCurrency', () => {
        it('should format numbers to BRL currency', () => {
            // Note: Exact string depends on locale, but standard BRL usually uses non-breaking space or normal space.
            // We'll normalize spaces for the test to avoid NBSP issues.
            const result = formatCurrency(1234.56).replace(/\s/g, ' ');
            expect(result).toMatch(/R\$ 1\.234,56/);
        });
    });

    describe('generateWhatsAppLink', () => {
        it('should generate a valid whatsapp link with encoded message', () => {
            const link = generateWhatsAppLink('5511999999999', 'João', 'Rua A, 123', '30 min');
            expect(link).toContain('https://wa.me/5511999999999');
            expect(link).toContain('Jo%C3%A3o'); // João encoded
            expect(link).toContain('Rua%20A%2C%20123'); // Address encoded
        });
    });

    // Helper for TSP test
    const origin = { lat: 0, lng: 0 };
    const p1 = { id: '1', lat: 10, lng: 0 }; // Far
    const p2 = { id: '2', lat: 1, lng: 0 };  // Close

    describe('solveTSPLocal', () => {
        it('should sort destinations by nearest neighbor', () => {
            const dests = [p1, p2];
            const sortedIds = solveTSPLocal(origin, dests);

            // Should go to p2 (closer) then p1 (farther)
            expect(sortedIds).toEqual(['2', '1']);
        });

        it('should handle empty destinations', () => {
            expect(solveTSPLocal(origin, [])).toEqual([]);
        });
    });

});
