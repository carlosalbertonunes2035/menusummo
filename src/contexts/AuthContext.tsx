import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from '@firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from '@firebase/firestore';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    tenantId: string;
    role: 'OWNER' | 'MANAGER' | 'WAITER' | 'KITCHEN' | 'CASHIER';
}

interface AuthContextType {
    currentUser: UserData | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                try {
                    // Buscar dados adicionais do usuário no Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setCurrentUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || userData.name || 'Usuário',
                            tenantId: userData.tenantId || '',
                            role: userData.role || 'WAITER',
                        });
                    } else {
                        // Usuário sem documento no Firestore (caso raro)
                        setCurrentUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || 'Usuário',
                            tenantId: '',
                            role: 'WAITER',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setCurrentUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
