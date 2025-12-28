import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from '@firebase/auth';
import { SystemUser, Role } from '@/types';
import { registrationService, RegistrationData } from '@/lib/auth/registrationService';
import { securityLogger } from '@/lib/security';
import { sessionManager } from '@/lib/auth/sessionManager';

// QSA Refactor Imports
import { logger } from '@/lib/logger';
import { MOCK_ADMIN_USER, MOCK_SYSTEM_USER } from '@/lib/mocks/userData';
import { userService } from '@/services/userService';

interface AuthContextType {
    user: User | null;
    systemUser: SystemUser | null;
    role: Role | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (data: RegistrationData) => Promise<{ user: User; tenantId: string } | undefined>;
    logout: () => Promise<void>;
    isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [systemUser, setSystemUser] = useState<SystemUser | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMockMode, setIsMockMode] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState<{ count: number, lastAttempt: number }>({ count: 0, lastAttempt: 0 });

    useEffect(() => {
        // Check if we should force Mock Mode due to invalid API Key
        const apiKey = auth.app.options.apiKey;
        const isInvalidKey = !apiKey || apiKey === "AIzaSyDMoFirhePgU3lm91hyNVFugDEIjao93lY";

        if (isInvalidKey) {
            logger.error("CRITICAL ERROR: Invalid Firebase API Key.");
            // Do not enable Mock Mode. Fail hard as requested.
            // setIsMockMode(true); 
            // setLoading(false);
            // return;
            throw new Error("Invalid API Key. System Halted.");
        }

        // Real Firebase Connection - ENTERPRISE VERSION
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setSystemUser(null);
                setRole(null);
                setLoading(false);
                return;
            }

            setUser(firebaseUser);
            logger.info('User authenticated', { uid: firebaseUser.uid });

            try {
                // Try to get complete system profile using our new service
                const profile = await userService.getSystemUser(firebaseUser);

                if (profile) {
                    setSystemUser(profile.systemUser);
                    setRole(profile.role);
                    logger.info('User profile loaded', { email: profile.systemUser.email, tenant: profile.systemUser.tenantId });

                    // SECURITY SYNC: Ensure Custom Claims are synchronized
                    // If the database has a tenantId but the token doesn't, force a refresh.
                    const tokenResult = await firebaseUser.getIdTokenResult();
                    if (!tokenResult.claims.tenantId && profile.systemUser.tenantId) {
                        logger.warn('Custom claims missing. Forcing token refresh...', { uid: firebaseUser.uid });
                        try {
                            await firebaseUser.getIdToken(true);
                        } catch (e) {
                            logger.error('Failed to force refresh token', e);
                        }
                    }
                } else {
                    // Profile not found - attempted recovery logic
                    logger.error('CRITICAL: User authenticated but profile missing/incomplete');

                    const pendingTenantId = localStorage.getItem('summo_pending_tenant_id');

                    if (pendingTenantId) {
                        logger.info('Found pending registration, attempting recovery...');
                        const recovered = await userService.recoverUser(firebaseUser, pendingTenantId);

                        if (recovered) {
                            localStorage.removeItem('summo_pending_tenant_id');
                            localStorage.setItem(`summo_tenant_id_${firebaseUser.uid}`, pendingTenantId);
                            logger.info('Recovery successful, reloading...');
                            window.location.reload();
                            return;
                        }
                    }

                    // Attempt TenantId Recovery from localStorage
                    const storedTenantId = localStorage.getItem(`summo_tenant_id_${firebaseUser.uid}`);
                    if (storedTenantId) {
                        logger.info('Found tenantId in localStorage, updating profile...');
                        await userService.updateUserTenant(firebaseUser.uid, storedTenantId);
                        window.location.reload();
                        return;
                    }

                    // If all fails
                    logger.error('No recovery possible, forcing logout');
                    await signOut(auth);
                    alert('Erro: Dados de usuário não encontrados ou corrompidos. Por favor, entre em contato com o suporte.');
                }

            } catch (error: any) {
                logger.error('Error loading user session', error);
                await signOut(auth);
                alert(`Erro ao carregar dados: ${error.message}`);
                setUser(null);
                setSystemUser(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, pass: string) => {
        const now = Date.now();
        const cooldownMs = 60000;
        const maxAttempts = 5;

        if (loginAttempts.count >= maxAttempts && now - loginAttempts.lastAttempt < cooldownMs) {
            const waitTime = Math.ceil((cooldownMs - (now - loginAttempts.lastAttempt)) / 1000);
            throw new Error(`Muitas tentativas. Por favor, aguarde ${waitTime} segundos.`);
        }

        if (now - loginAttempts.lastAttempt >= cooldownMs) {
            setLoginAttempts({ count: 1, lastAttempt: now });
        } else {
            setLoginAttempts(prev => ({ count: prev.count + 1, lastAttempt: now }));
        }

        if (isMockMode) {
            throw new Error("Modo Simulado: Autenticação Firebase não disponível.");
        }

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            securityLogger.logLogin(email, true);
        } catch (error: any) {
            logger.error("Login failed", error);
            securityLogger.logLogin(email, false, undefined, error.code || error.message);
            throw error;
        }
    };

    const signUp = async (data: RegistrationData) => {
        if (isMockMode) {
            alert("Modo Simulado: Não é possível criar novos negócios.");
            return;
        }
        const result = await registrationService.registerNewBusiness(data);
        return result;
    };

    const logout = async () => {
        const currentTenantId = systemUser?.tenantId;

        if (currentTenantId) {
            logger.info(`Clearing localStorage for tenant: ${currentTenantId}`);
            sessionManager.purgeAllTenantData();
        }

        localStorage.removeItem('summo_mock_session');
        localStorage.removeItem('summo_active_tenant');

        setUser(null);
        setSystemUser(null);
        setRole(null);

        if (!isMockMode) {
            try {
                await signOut(auth);
            } catch (e) {
                logger.warn("Sign out error", e);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, systemUser, role, loading, signIn, signUp, logout, isMockMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
