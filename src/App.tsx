
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';

import { DataProvider } from '@/contexts/DataContext';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FirestoreErrorBoundary } from '@/components/FirestoreErrorBoundary';
import CloudPrintListener from '@/features/settings/components/CloudPrintListener';
import { router } from '@/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache by default
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <FirestoreErrorBoundary>
                <HelmetProvider>
                    <AuthProvider>
                        <ToastProvider>
                            <AppProvider>
                                <DataProvider>
                                    <ErrorBoundary scope="Cloud Print">
                                        <CloudPrintListener />
                                    </ErrorBoundary>
                                    <RouterProvider router={router} />
                                </DataProvider>
                            </AppProvider>
                        </ToastProvider>
                    </AuthProvider>
                </HelmetProvider>
            </FirestoreErrorBoundary>
        </QueryClientProvider>
    );
}
