import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/Sidebar';
import ToastContainer from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import AuthForms from '@/features/auth/components/AuthForms';
import { Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const RootLayout: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { settings } = useApp();
    const { toasts, removeToast } = useToast();
    const location = useLocation();

    useNotifications();

    if (authLoading) {
        return <div className="h-screen flex items-center justify-center bg-summo-bg"><Loader2 className="animate-spin text-summo-primary" size={40} /></div>;
    }

    if (!user) {
        return <AuthForms />;
    }

    const navigationMode = settings.interface?.navigationMode || 'SIDEBAR';

    return (
        <div className={`fixed inset-0 overflow-hidden bg-summo-bg font-sans text-summo-text flex ${navigationMode === 'SIDEBAR' ? 'flex-col md:flex-row' : 'flex-col'} md:pb-0`}>
            <a href="#main-content" className="skip-to-content focus:z-50">Pular para o conteúdo principal</a>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            {navigationMode === 'SIDEBAR' && <Sidebar />}
            <main id="main-content" className="flex-1 w-full h-full overflow-y-auto relative custom-scrollbar flex flex-col">
                <ErrorBoundary>
                    <Suspense fallback={
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-3 bg-gray-50/50">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                            <span className="text-sm font-medium animate-pulse">Carregando módulo...</span>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </main>
            {navigationMode === 'DOCK' && <Sidebar />}
        </div>
    );
};
