import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ToastContainer from '@/components/ui/Toast';
import LoadingFallback from '@/components/LoadingFallback';
import { PublicDataProvider } from '@/contexts/PublicDataContext';
import { DigitalMenuProvider } from './features/digital-menu/context/DigitalMenuContext';

// Lazy Load Components - All routes are lazy loaded for optimal code splitting
const Launchpad = React.lazy(() => import('@/components/layouts/Launchpad'));
const Marketing = React.lazy(() => import('./features/marketing/pages/Marketing'));
const Reports = React.lazy(() => import('./features/financial/pages/Reports'));
const OrderManager = React.lazy(() => import('./features/orders/pages/OrderManager'));
const POS = React.lazy(() => import('./features/pos/pages/POS'));
const KDS = React.lazy(() => import('./features/orders/pages/KDS'));
const MenuEngineering = React.lazy(() => import('./features/inventory/pages/MenuEngineering'));
const Stock = React.lazy(() => import('./features/inventory/pages/Stock'));
const Logistics = React.lazy(() => import('./features/logistics/pages/Logistics'));
const Finance = React.lazy(() => import('./features/financial/pages/Finance'));
const CRM = React.lazy(() => import('./features/crm/pages/CRM'));
const Settings = React.lazy(() => import('./features/settings/pages/Settings'));
const DriverApp = React.lazy(() => import('./features/logistics/pages/DriverApp'));
const Waiter = React.lazy(() => import('./features/virtual-tab').then(m => ({ default: m.WaiterDashboard })));
const Support = React.lazy(() => import('./features/crm/pages/Support'));
const DigitalMenu = React.lazy(() => import('./features/digital-menu/components/DigitalMenu'));
const ProductPage = React.lazy(() => import('./features/digital-menu/components/ProductPage'));
const LandingPage = React.lazy(() => import('./features/landing-page/components/LandingPage'));
const Terms = React.lazy(() => import('./features/landing-page/components/Terms'));
const Privacy = React.lazy(() => import('./features/landing-page/components/Privacy'));
const SecurityAudit = React.lazy(() => import('./features/auth/pages/SecurityAudit'));
const WaiterTableOrder = React.lazy(() => import('./features/virtual-tab').then(m => ({ default: m.WaiterTableOrder })));


// Wrapper for public routes with PublicDataProvider
const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const params = useParams<{ slugLoja: string }>();
    const slug = params.slugLoja;
    const tenantId = slug || ''; // Use slug directly as tenantId

    return (
        <PublicDataProvider tenantId={tenantId}>
            <DigitalMenuProvider>
                {children}
            </DigitalMenuProvider>
        </PublicDataProvider>
    );
};

const PublicLayout = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary scope="Cardápio Digital">
                <DigitalMenu />
            </ErrorBoundary>
        </Suspense>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense>
    },
    {
        path: '/terms',
        element: <Suspense fallback={<LoadingFallback />}><Terms /></Suspense>
    },
    {
        path: '/privacy',
        element: <Suspense fallback={<LoadingFallback />}><Privacy /></Suspense>
    },
    {
        path: '/loja/:slugLoja', // Main Store Route
        element: <PublicRouteWrapper><PublicLayout /></PublicRouteWrapper>
    },
    {
        path: '/loja/:slugLoja/produto/:slugProduto',
        element: <PublicRouteWrapper><PublicLayout /></PublicRouteWrapper>
    },
    {
        path: '/app',
        element: <RootLayout />,
        children: [
            { path: '', element: <Navigate to="launchpad" replace /> },
            {
                path: 'launchpad',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Launchpad"><Launchpad /></ErrorBoundary></Suspense>
            },
            {
                path: 'marketing',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Marketing"><Marketing /></ErrorBoundary></Suspense>
            },
            {
                path: 'dashboard',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Relatórios"><Reports /></ErrorBoundary></Suspense>
            },
            {
                path: 'orders',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Pedidos"><OrderManager /></ErrorBoundary></Suspense>
            },
            {
                path: 'pos',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="PDV"><POS /></ErrorBoundary></Suspense>
            },
            {
                path: 'kds',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Cozinha (KDS)"><KDS /></ErrorBoundary></Suspense>
            },
            {
                path: 'menu',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Menu Studio"><MenuEngineering /></ErrorBoundary></Suspense>
            },
            {
                path: 'stock',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Estoque"><Stock /></ErrorBoundary></Suspense>
            },
            {
                path: 'logistics',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Logística"><Logistics /></ErrorBoundary></Suspense>
            },
            {
                path: 'finance',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Financeiro"><Finance /></ErrorBoundary></Suspense>
            },
            {
                path: 'crm',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="CRM"><CRM /></ErrorBoundary></Suspense>
            },
            {
                path: 'settings',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Configurações"><Settings /></ErrorBoundary></Suspense>
            },
            {
                path: 'driver',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Motorista"><DriverApp /></ErrorBoundary></Suspense>
            },
            {
                path: 'waiter',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Garçom (Mesa)"><Waiter /></ErrorBoundary></Suspense>
            },
            {
                path: 'waiter/order/:tableId',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Pedido de Mesa"><WaiterTableOrder /></ErrorBoundary></Suspense>
            },
            {
                path: 'support',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Suporte"><Support /></ErrorBoundary></Suspense>
            },
            {
                path: 'security',
                element: <Suspense fallback={<LoadingFallback />}><ErrorBoundary scope="Seguranca"><SecurityAudit /></ErrorBoundary></Suspense>
            },
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />
    }
]);

