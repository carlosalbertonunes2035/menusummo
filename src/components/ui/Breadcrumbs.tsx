
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
    className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app');

    // Map of path segments to readable names
    const breadcrumbNameMap: Record<string, string> = {
        dashboard: 'Relatórios',
        orders: 'Pedidos',
        pos: 'PDV',
        kds: 'Cozinha',
        menu: 'Cardápio',
        stock: 'Estoque',
        logistics: 'Logística',
        finance: 'Financeiro',
        crm: 'CRM',
        settings: 'Configurações',
        launchpad: 'Início',
        marketing: 'Marketing',
        waiter: 'Garçom',
        support: 'Suporte',
    };

    return (
        <nav className={cn('flex items-center space-x-2 text-sm text-gray-400 mb-6', className)}>
            <Link to="/app/launchpad" className="hover:text-summo-primary transition-colors flex items-center gap-1">
                <Home size={14} />
            </Link>

            {pathnames.length > 0 && <ChevronRight size={14} />}

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/app/${pathnames.slice(0, index + 1).join('/')}`;
                const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                return (
                    <React.Fragment key={to}>
                        {last ? (
                            <span className="text-gray-900 font-bold">{name}</span>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to={to} className="hover:text-summo-primary transition-colors">
                                    {name}
                                </Link>
                                <ChevronRight size={14} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
