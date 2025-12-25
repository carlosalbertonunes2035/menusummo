import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registrationService } from './registrationService';
import { auth, db } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { runTransaction, getDocs, getDoc } from '@firebase/firestore';

// Mock Firebase
vi.mock('@/lib/firebase/client', () => ({
    auth: {},
    db: {}
}));

vi.mock('@firebase/auth', () => ({
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn()
}));

vi.mock('@firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }), // Default: doc not found
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    runTransaction: vi.fn(),
    serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('@/services/googleMapsService', () => ({
    geocodeAddress: vi.fn()
}));

describe('registrationService - Enterprise Version', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('generateUniqueTenantId', () => {
        it('should generate slug from business name', async () => {
            vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

            const slug = await registrationService.generateUniqueTenantId('Hamburgueria do João');

            expect(slug).toBe('hamburgueria-do-joao');
        });

        it('should add suffix if slug already exists', async () => {
            vi.mocked(getDoc)
                .mockResolvedValueOnce({ exists: () => true } as any) // First attempt exists
                .mockResolvedValue({ exists: () => false } as any);   // Suffix attempt available

            const slug = await registrationService.generateUniqueTenantId('Test Store');

            expect(slug).toMatch(/^test-store-[a-z0-9]{3}$/);
        });

        it('should handle empty business name', async () => {
            vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

            const slug = await registrationService.generateUniqueTenantId('');

            expect(slug).toMatch(/^store-[a-z0-9]{5}$/);
        });
    });

    describe('registerNewBusiness - Atomic Transaction', () => {
        const mockRegistrationData = {
            ownerName: 'John Doe',
            email: 'john@example.com',
            phone: '11999999999',
            password: 'SecurePass123!',
            businessName: 'Test Business',
            legalName: 'Test Business LTDA',
            cnpj: '12345678000190',
            address: {
                zip: '12345-678',
                street: 'Test Street',
                number: '123',
                neighborhood: 'Test Neighborhood',
                city: 'Test City',
                state: 'TS',
                complement: ''
            },
            segment: 'Hamburgueria',
            monthlyRevenue: 'R$ 10k - R$ 30k',
            deliveryChannels: {
                ownDelivery: true,
                ifood: false,
                rappi: false,
                aiqfome: false,
                others: false
            },
            digitalMenu: {
                hasOwn: false,
                platform: ''
            },
            serviceTypes: ['delivery', 'takeaway']
        };

        it('should use atomic transaction for registration', async () => {
            const mockUser = { uid: 'test-uid', delete: vi.fn() };
            vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
            vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
            vi.mocked(runTransaction).mockResolvedValue(undefined);

            await registrationService.registerNewBusiness(mockRegistrationData);

            // Verify transaction was called
            expect(runTransaction).toHaveBeenCalledTimes(1);
        });

        it('should rollback auth user if transaction fails', async () => {
            const mockUser = { uid: 'test-uid', delete: vi.fn() };
            vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
            vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
            vi.mocked(runTransaction).mockRejectedValue(new Error('Transaction failed'));

            await expect(
                registrationService.registerNewBusiness(mockRegistrationData)
            ).rejects.toThrow('Falha ao criar empresa');

            // Verify auth user was deleted (rollback)
            expect(mockUser.delete).toHaveBeenCalled();
        });

        it('should store tenantId in localStorage before auth creation', async () => {
            const mockUser = { uid: 'test-uid', delete: vi.fn() };
            vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
            vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
            vi.mocked(runTransaction).mockResolvedValue(undefined);

            await registrationService.registerNewBusiness(mockRegistrationData);

            // Verify localStorage was set
            expect(localStorage.getItem('summo_pending_tenant_id')).toBeTruthy();
            expect(localStorage.getItem(`summo_tenant_id_${mockRegistrationData.email}`)).toBeTruthy();
        });

        it('should clear localStorage hints if transaction fails', async () => {
            const mockUser = { uid: 'test-uid', delete: vi.fn() };
            vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
            vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
            vi.mocked(runTransaction).mockRejectedValue(new Error('Transaction failed'));

            try {
                await registrationService.registerNewBusiness(mockRegistrationData);
            } catch (error) {
                // Expected to fail
            }

            // Verify localStorage was cleared
            expect(localStorage.getItem('summo_pending_tenant_id')).toBeNull();
            expect(localStorage.getItem(`summo_tenant_id_${mockRegistrationData.email}`)).toBeNull();
        });

        it('should log detailed steps for audit', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            const mockUser = { uid: 'test-uid', delete: vi.fn() };
            vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
            vi.mocked(getDocs).mockResolvedValue({ empty: true } as any);
            vi.mocked(runTransaction).mockResolvedValue(undefined);

            await registrationService.registerNewBusiness(mockRegistrationData);

            // Verify logging
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Registration]'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Starting enterprise registration flow'));
        });
    });
});
