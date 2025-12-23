import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut } from '@firebase/auth';
import { getDoc, setDoc } from '@firebase/firestore';

// Mock Firebase
vi.mock('@/lib/firebase/client', () => ({
    auth: {},
    db: {}
}));

vi.mock('@firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn()
}));

vi.mock('@firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn()
}));

describe('AuthContext - Enterprise Version', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        global.alert = vi.fn();
        global.window.location.reload = vi.fn();
    });

    describe('Validação Rigorosa de tenantId', () => {
        it('should force logout if user document does not exist', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            // Mock: usuário autenticado
            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: documento não existe
            vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Dados de usuário não encontrados')
                );
            });
        });

        it('should force logout if tenantId is missing and no recovery possible', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: documento existe mas sem tenantId
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    id: 'test-uid',
                    email: 'test@example.com',
                    roleId: 'OWNER',
                    // tenantId: undefined ❌
                })
            } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Nenhum tenant associado')
                );
            });
        });

        it('should recover tenantId from localStorage if missing in Firestore', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            const recoveredTenantId = 'recovered-tenant-123';

            // Set localStorage hint
            localStorage.setItem(`summo_tenant_id_${mockUser.uid}`, recoveredTenantId);

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: documento existe mas sem tenantId
            vi.mocked(getDoc).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    id: 'test-uid',
                    email: 'test@example.com',
                    roleId: 'OWNER'
                    // tenantId missing
                })
            } as any);

            // Mock: system_users document
            vi.mocked(getDoc).mockResolvedValueOnce({
                exists: () => false
            } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                // Should update Firestore with recovered tenantId
                expect(setDoc).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({ tenantId: recoveredTenantId }),
                    { merge: true }
                );
            });
        });

        it('should recover from pending registration', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            const pendingTenantId = 'pending-tenant-123';

            // Set pending registration hint
            localStorage.setItem('summo_pending_tenant_id', pendingTenantId);

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: documento não existe
            vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                // Should create missing documents
                expect(setDoc).toHaveBeenCalled();
                // Should reload page
                expect(global.window.location.reload).toHaveBeenCalled();
            });
        });

        it('should log detailed steps for audit', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    id: 'test-uid',
                    email: 'test@example.com',
                    tenantId: 'valid-tenant-123',
                    roleId: 'OWNER'
                })
            } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[AuthContext]')
                );
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('User authenticated')
                );
            });
        });

        it('should guarantee tenantId exists in final systemUser', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            const validTenantId = 'valid-tenant-123';

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: users document
            vi.mocked(getDoc).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    id: 'test-uid',
                    email: 'test@example.com',
                    tenantId: validTenantId,
                    roleId: 'OWNER',
                    active: true
                })
            } as any);

            // Mock: system_users document
            vi.mocked(getDoc).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    name: 'Test User'
                })
            } as any);

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                expect(result.current.systemUser).toBeDefined();
                expect(result.current.systemUser?.tenantId).toBe(validTenantId);
                expect(result.current.systemUser?.tenantId).not.toBeUndefined();
                expect(result.current.systemUser?.tenantId).not.toBe('');
            });
        });
    });

    describe('Error Handling Enterprise', () => {
        it('should logout on any critical error', async () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };

            vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
                callback(mockUser as any);
                return vi.fn();
            });

            // Mock: erro ao buscar documento
            vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalled();
                expect(global.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Erro ao carregar dados')
                );
            });
        });
    });
});
