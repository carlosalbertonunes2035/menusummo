import React, { ReactElement } from 'react';
import { render, renderHook, RenderOptions, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 0,
        },
    },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <AuthProvider>
                    <ToastProvider>
                        <MemoryRouter>
                            {children}
                        </MemoryRouter>
                    </ToastProvider>
                </AuthProvider>
            </HelmetProvider>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

const customRenderHook = <Result, Props>(
    render: (props: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) => renderHook(render, { wrapper: AllTheProviders as React.ComponentType<any>, ...options });

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
export { createTestQueryClient };
