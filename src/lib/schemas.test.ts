import { describe, it, expect } from 'vitest';
import { ProductSchema, StoreSettingsSchema, ChannelConfigSchema } from './schemas';

describe('Validation Schemas', () => {
    describe('ProductSchema', () => {
        it('should validate a correct product', () => {
            const validProduct = {
                id: '123',
                name: 'Coca Cola',
                category: 'Bebidas',
                cost: 2.50,
                ingredients: [],
                channels: []
            };
            const result = ProductSchema.safeParse(validProduct);
            expect(result.success).toBe(true);
        });

        it('should fail if name is too short', () => {
            const invalidProduct = {
                id: '123',
                name: 'A',
                category: 'Bebidas',
                cost: 2.50,
                channels: []
            };
            const result = ProductSchema.safeParse(invalidProduct);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres');
            }
        });

        it('should fail if cost is negative', () => {
            const invalidProduct = {
                id: '123',
                name: 'Coca Cola',
                category: 'Bebidas',
                cost: -1,
                channels: []
            };
            const result = ProductSchema.safeParse(invalidProduct);
            expect(result.success).toBe(false);
        });
    });

    describe('StoreSettingsSchema', () => {
        it('should validate correct settings', () => {
            const validSettings = {
                brandName: 'My Brand',
                name: 'My Company',
                cnpj: '00.000.000/0000-00', // Matches regex helper
                phone: '11999999999',
                address: 'Rua Teste, 123',
                storefront: {
                    storeName: 'My Store',
                    slug: 'my-link'
                },
                financial: {
                    taxRate: 10,
                    fixedCostRate: 5,
                    packagingAvgCost: 2
                },
                delivery: {
                    baseFee: 5,
                    minOrderValue: 20,
                    deliveryRadius: 10,
                    freeShippingThreshold: 50
                }
            };
            const result = StoreSettingsSchema.safeParse(validSettings);
            expect(result.success).toBe(true);
        });

        it('should fail invalid CNPJ', () => {
            const invalidSettings = {
                brandName: 'My Brand',
                name: 'My Company',
                cnpj: '123', // Invalid
                phone: '11999999999',
                address: 'Rua Teste, 123',
                storefront: {
                    storeName: 'My Store',
                    slug: 'my-link'
                },
                financial: { taxRate: 0, fixedCostRate: 0, packagingAvgCost: 0 },
                delivery: { baseFee: 0, minOrderValue: 0, deliveryRadius: 0, freeShippingThreshold: 0 }
            };
            const result = StoreSettingsSchema.safeParse(invalidSettings);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Formato de CNPJ inválido');
            }
        });
    });
});
