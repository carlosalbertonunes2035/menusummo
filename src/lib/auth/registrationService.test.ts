import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registrationService } from './registrationService';
import { auth } from '@/lib/firebase/client';
import { signInWithCustomToken } from '@firebase/auth';
import { getFunctions, httpsCallable } from '@firebase/functions';

// Mock Firebase Client
vi.mock('@/lib/firebase/client', () => ({
    auth: { currentUser: null },
    db: {}
}));

// Mock Firebase Auth
vi.mock('@firebase/auth', () => ({
    signInWithCustomToken: vi.fn(),
    getAuth: vi.fn(() => ({ currentUser: null }))
}));

// Mock Firebase Functions
vi.mock('@firebase/functions', () => ({
    getFunctions: vi.fn(),
    httpsCallable: vi.fn()
}));

describe('registrationService - Enterprise Version', () => {
    const mockRegistrationData = {
        ownerName: 'John Doe',
        ownerRole: 'owner' as const,
        email: 'john@example.com',
        phone: '11999999999',
        password: 'SecurePass123!',
        businessName: 'Test Business',
        establishmentType: 'restaurant' as const,
        operationTime: 'new' as const,
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
        salesChannels: {
            ownDelivery: true,
            counter: true,
            dineIn: true,
            ifood: false,
            rappi: false,
            aiqfome: false,
            otherApps: []
        },
        digitalMenu: {
            hasOwn: false,
            platform: ''
        },
        currentSystem: 'none' as const,
        goals: ['cost_control' as const],
        mainChallenge: 'profit' as const,
        deliveryChannels: {
            ownDelivery: true,
            ifood: false,
            rappi: false,
            aiqfome: false,
            others: false
        },
        serviceTypes: ['delivery']
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Setup default mock for functions
        vi.mocked(getFunctions).mockReturnValue({} as any);
        vi.mocked(httpsCallable).mockImplementation(() => {
            return vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    token: 'mock-custom-token',
                    tenantId: 'mock-tenant-id'
                }
            }) as any;
        });

        // Setup default mock for auth
        vi.mocked(signInWithCustomToken).mockResolvedValue({
            user: { uid: 'mock-uid', email: 'john@example.com' }
        } as any);
    });

    describe('registerNewBusiness - Cloud Function Flow', () => {
        it('should call the createTenant cloud function', async () => {
            const mockCreateTenant = vi.fn().mockResolvedValue({
                data: { success: true, token: 't1', tenantId: 'tenant-1' }
            });
            vi.mocked(httpsCallable).mockReturnValue(mockCreateTenant as any);

            await registrationService.registerNewBusiness(mockRegistrationData);

            expect(mockCreateTenant).toHaveBeenCalledWith(mockRegistrationData);
        });

        it('should sign in with custom token on success', async () => {
            await registrationService.registerNewBusiness(mockRegistrationData);

            expect(signInWithCustomToken).toHaveBeenCalledWith(auth, 'mock-custom-token');
        });

        it('should store tenantId in localStorage hints', async () => {
            await registrationService.registerNewBusiness(mockRegistrationData);

            expect(localStorage.getItem('summo_pending_tenant_id')).toBe('mock-tenant-id');
            expect(localStorage.getItem(`summo_tenant_id_${mockRegistrationData.email}`)).toBe('mock-tenant-id');
        });

        it('should throw error if cloud function returns failure', async () => {
            vi.mocked(httpsCallable).mockReturnValue(vi.fn().mockResolvedValue({
                data: { success: false, error: 'Registration failed' }
            }) as any);

            await expect(
                registrationService.registerNewBusiness(mockRegistrationData)
            ).rejects.toThrow('Registration failed');
        });

        it('should handle email already in use error', async () => {
            vi.mocked(httpsCallable).mockReturnValue(vi.fn().mockRejectedValue({
                message: 'auth/email-already-in-use'
            }) as any);

            await expect(
                registrationService.registerNewBusiness(mockRegistrationData)
            ).rejects.toThrow('Este e-mail já está cadastrado');
        });
    });
});
