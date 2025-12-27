import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { auth, db } from '@/lib/firebase/client';
import * as firebaseAuth from '@firebase/auth';
import * as firebaseFirestore from '@firebase/firestore';

// Mock Firebase Client
vi.mock('@/lib/firebase/client', () => ({
    auth: {
        app: {
            options: {
                apiKey: 'test-api-key'
            }
        }
    },
    db: {}
}));

// Mock Firebase Auth
vi.mock('@firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue({}),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ user: { uid: 'test-uid' } })
}));

// Mock Firebase Firestore
const mockDocRef = { id: 'test-ref', path: 'test/path' };
vi.mock('@firebase/firestore', () => ({
    doc: vi.fn(() => mockDocRef),
    getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({}) }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    runTransaction: vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vi.fn(() => new Date())
}));

// Mock security and session
vi.mock('@/lib/security', () => ({
    securityLogger: {
        logLogin: vi.fn(),
        logRegistration: vi.fn(),
        logFirestoreError: vi.fn()
    }
}));

vi.mock('@/lib/auth/sessionManager', () => ({
    sessionManager: {
        purgeAllTenantData: vi.fn()
    }
}));

vi.mock('@/constants/roles', () => ({
    STANDARD_ROLES: [
        { id: 'OWNER', name: 'Owner', permissions: [] },
        { id: 'MANAGER', name: 'Manager', permissions: [] }
    ]
}));

// Mock UserService
vi.mock('@/services/userService', () => ({
    userService: {
        getSystemUser: vi.fn(),
        recoverUser: vi.fn(),
        updateUserTenant: vi.fn()
    }
}));

describe('AuthContext - Enterprise Version', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        global.alert = vi.fn();
        // Mock window.location.reload
        const mockReload = vi.fn();
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { reload: mockReload }
        });
    });

    describe('Validação Rigorosa de tenantId', () => {
        it('should force logout if user document does not exist', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            // Mock: usuário autenticado
            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: userService returns null (not found/incomplete)
            const { userService } = await import('@/services/userService');
            vi.mocked(userService.getSystemUser).mockResolvedValue(null);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseAuth.signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Dados de usuário não encontrados')
                );
            });
        });

        it('should recover tenantId from localStorage if missing in Firestore', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            const recoveredTenantId = 'recovered-tenant-123';

            localStorage.setItem(`summo_tenant_id_${mockUser.uid}`, recoveredTenantId);

            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            const { userService } = await import('@/services/userService');
            vi.mocked(userService.getSystemUser).mockResolvedValue(null);
            // Mock recovery success
            vi.mocked(userService.updateUserTenant).mockResolvedValue(undefined);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(userService.updateUserTenant).toHaveBeenCalledWith(mockUser.uid, recoveredTenantId);
                expect(window.location.reload).toHaveBeenCalled();
            });
        });

        it('should guarantee tenantId exists in final systemUser', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            const validTenantId = 'valid-tenant-123';

            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            const { userService } = await import('@/services/userService');
            vi.mocked(userService.getSystemUser).mockResolvedValue({
                systemUser: { id: 'test-uid', email: 'test@example.com', tenantId: validTenantId, roleId: 'OWNER', active: true },
                role: { id: 'OWNER', name: 'Owner', permissions: [] }
            } as any);

            const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(result.current.systemUser).toBeDefined();
                expect(result.current.systemUser?.tenantId).toBe(validTenantId);
            });
        });
    });

    describe('Error Handling Enterprise', () => {
        it('should logout on any critical error', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Force a critical error
            const { userService } = await import('@/services/userService');
            vi.mocked(userService.getSystemUser).mockRejectedValue(new Error("Simulated Critical DB Error"));

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseAuth.signOut).toHaveBeenCalled();
            });

            expect(global.alert).toHaveBeenCalled();
        });
    });
});
