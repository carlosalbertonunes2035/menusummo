import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// TODO: Implement offline persistence after deployment
// Requires proper configuration of experimental_createQueryPersister or alternative approach

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos de cache padrão
            gcTime: 1000 * 60 * 30,    // 30 minutos de garbage collection
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
