
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';

import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FirestoreErrorBoundary } from '@/components/FirestoreErrorBoundary';
import CloudPrintListener from '@/features/settings/components/CloudPrintListener';
import { router } from '@/router';
import { QueryProvider } from '@/lib/react-query/QueryProvider';

export default function App() {
    return (
        <QueryProvider>
            <FirestoreErrorBoundary>
                <HelmetProvider>
                    <AuthProvider>
                        <ToastProvider>
                            <AppProvider>
                                <ErrorBoundary scope="Cloud Print">
                                    <CloudPrintListener />
                                </ErrorBoundary>
                                <RouterProvider router={router} />
                            </AppProvider>
                        </ToastProvider>
                    </AuthProvider>
                </HelmetProvider>
            </FirestoreErrorBoundary>
        </QueryProvider>
    );
}
