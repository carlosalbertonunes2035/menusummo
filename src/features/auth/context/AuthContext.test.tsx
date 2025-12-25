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

            // Mock: documento não existe
            vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseAuth.signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Dados de usuário não encontrados')
                );
            });
        });

        it('should force logout if tenantId is missing and no recovery possible', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: documento existe mas sem tenantId
            vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    id: 'test-uid',
                    email: 'test@example.com',
                    roleId: 'OWNER'
                })
            } as any);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseAuth.signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Nenhum tenant associado')
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

            // Mock: users document followed by system_users doc
            vi.mocked(firebaseFirestore.getDoc)
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ id: 'test-uid', email: 'test@example.com', roleId: 'OWNER' })
                } as any)
                .mockResolvedValueOnce({ exists: () => false } as any);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({ tenantId: recoveredTenantId }),
                    { merge: true }
                );
            });
        });

        it('should recover from pending registration', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' };
            const pendingTenantId = 'pending-tenant-123';

            localStorage.setItem('summo_pending_tenant_id', pendingTenantId);

            vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback: any) => {
                callback(mockUser as any);
                return vi.fn();
            });

            vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({ exists: () => false } as any);

            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(firebaseFirestore.setDoc).toHaveBeenCalled();
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

            vi.mocked(firebaseFirestore.getDoc)
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ id: 'test-uid', email: 'test@example.com', tenantId: validTenantId, roleId: 'OWNER', active: true })
                } as any)
                .mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'Test User' }) } as any);

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

            console.log('Starting critical error test...');
            renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                console.log('Waiting for signOut call...');
                expect(firebaseAuth.signOut).toHaveBeenCalled();
                console.log('signOut called!');
            }, { timeout: 10000 });

            expect(global.alert).toHaveBeenCalled();
        });
    });
});
