import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCollection, setCollection } from './localStorage';
import * as Constants from '../constants';

// Mock Constants to avoid importing heavy initial data
vi.mock('../constants', async () => {
    const actual = await vi.importActual('../constants');
    return {
        ...actual,
        GET_INITIAL_PRODUCTS: vi.fn(() => [{ id: 'fallback-prod' }]),
        GET_INITIAL_INGREDIENTS: vi.fn(() => []),
    };
});

describe('localStorage.ts', () => {
    const tenantId = 'test-tenant';
    const collectionName = 'products';
    const key = `summo_db_${collectionName}_${tenantId}`;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('getCollection', () => {
        it('should return data from localStorage if it exists', () => {
            const mockData = [{ id: '1', name: 'Test Product' }];
            localStorage.setItem(key, JSON.stringify(mockData));

            const result = getCollection(tenantId, collectionName);
            expect(result).toStrictEqual(mockData);
        });

        it('should parse ISO date strings back into Date objects', () => {
            const date = new Date('2023-01-01T12:00:00.000Z');
            const mockData = [{ id: '1', createdAt: date.toISOString() }];
            const ordersKey = `summo_db_orders_${tenantId}`; // Correct key for this test case
            localStorage.setItem(ordersKey, JSON.stringify(mockData));

            const result = getCollection(tenantId, 'orders' as any); // cast for dynamic key
            // @ts-ignore
            expect(result[0].createdAt).toBeInstanceOf(Date);
            // @ts-ignore
            expect(result[0].createdAt.toISOString()).toBe(date.toISOString());
        });

        it('should return fallback data if localStorage is empty', () => {
            const result = getCollection(tenantId, collectionName);
            expect(result).toEqual([{ id: 'fallback-prod' }]);

            // Should verify fallback was saved to storage
            expect(localStorage.getItem(key)).toBeTruthy();
        });

        it('should return empty array if no fallback exists for collection', () => {
            const result = getCollection(tenantId, 'clients' as any); // assume 'clients' has no fallback
            expect(result).toEqual([]);
        });

        it('should handle JSON parse errors gracefully by returning fallback', () => {
            localStorage.setItem(key, '{ invalid json }');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = getCollection(tenantId, collectionName);
            expect(result).toEqual([{ id: 'fallback-prod' }]); // Fallback
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('setCollection', () => {
        it('should write data to localStorage', () => {
            const data = [{ id: 'new', name: 'New Item' }];
            setCollection(tenantId, 'products', data as any);

            const stored = localStorage.getItem(key);
            expect(JSON.parse(stored!)).toEqual(data);
        });

        it('should dispatch local-db-updated event', () => {
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
            setCollection(tenantId, 'products', []);
            expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
            expect(dispatchSpy.mock.calls[0][0].type).toBe('local-db-updated');
        });
    });
});
