import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ChefHat, Package, Truck, Settings, Rocket, DollarSign, ClipboardList, CarFront, BookOpen, Users, ChevronLeft, ChevronRight, LifeBuoy, GalleryVertical, Megaphone, Droplet, Utensils } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../features/auth/context/AuthContext';

export const ALL_MODULES = [
    { id: 'launchpad', label: 'Início', icon: Rocket, gradient: 'from-orange-400 to-red-500', description: 'Visão Geral' },
    { id: 'marketing', label: 'Marketing & Vitrine', icon: Megaphone, gradient: 'from-rose-400 to-red-500', description: 'Loja, Cupons e IA' },
    { id: 'pos', label: 'Caixa', icon: ShoppingCart, gradient: 'from-orange-500 to-amber-500', description: 'Vender' },
    { id: 'orders', label: 'Pedidos', icon: ClipboardList, gradient: 'from-blue-500 to-cyan-500', description: 'Acompanhar' },
    { id: 'kds', label: 'Cozinha', icon: ChefHat, gradient: 'from-red-500 to-rose-600', description: 'Produção' },
    { id: 'finance', label: 'Dinheiro', icon: DollarSign, gradient: 'from-yellow-400 to-amber-500', description: 'Contas' },
    { id: 'stock', label: 'Estoque', icon: Package, gradient: 'from-green-500 to-emerald-700', description: 'Insumos' },
    { id: 'menu', label: 'Cardápio', icon: BookOpen, gradient: 'from-pink-500 to-rose-500', description: 'Produtos' },
    { id: 'crm', label: 'Clientes', icon: Users, gradient: 'from-indigo-500 to-violet-600', description: 'Fidelidade' },
    { id: 'logistics', label: 'Entregas', icon: Truck, gradient: 'from-cyan-500 to-blue-600', description: 'Rotas' },
    { id: 'driver', label: 'Motoboy', icon: CarFront, gradient: 'from-slate-500 to-slate-700', description: 'App' },
    { id: 'waiter', label: 'Garçom', icon: Utensils, gradient: 'from-orange-500 to-amber-600', description: 'Mesas' },
    { id: 'dashboard', label: 'Relatórios', icon: LayoutDashboard, gradient: 'from-teal-400 to-emerald-600', description: 'Gráficos' },
    { id: 'settings', label: 'Ajustes', icon: Settings, gradient: 'from-slate-600 to-slate-800', description: 'Config' },
    { id: 'support', label: 'Suporte', icon: LifeBuoy, gradient: 'from-sky-400 to-blue-500', description: 'Ajuda e Contato' },
];

const Sidebar: React.FC = () => {
    const { settings } = useApp();
    const { role, user, systemUser } = useAuth();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const { mainItems, utilityItems } = useMemo(() => {
        // 1. Filter by Permissions

        // Robust check: Handle cases where role object might be missing but user is known
        const permissions = role?.permissions || [];

        // CRITICAL FIX: Ensure OWNER always has full access, even if role object is malformed or missing
        const isOwner = systemUser?.roleId === 'OWNER' || role?.id === 'OWNER';
        const hasFullAccess = isOwner || permissions.includes('*');

        const accessibleModules = ALL_MODULES.filter(m => {
            // Always allow Launchpad, Support, and Settings (so users can fix role issues)
            if (m.id === 'launchpad' || m.id === 'support' || m.id === 'settings') return true;
            if (hasFullAccess) return true;
            return permissions.includes(m.id) || permissions.includes(`view:${m.id}`) || permissions.includes(`manage:${m.id}`);
        });

        // 2. Filter by Dock Settings (User Preference)
        const dockIds = settings.dockItems && settings.dockItems.length > 0
            ? settings.dockItems
            : ['launchpad', 'marketing', 'pos', 'orders', 'kds', 'menu', 'settings'];

        // Ensure only permitted items are shown. 
        // We use accessibleModules directly for the sidebar to ensure full visibility of allowed tools.
        const displayed = accessibleModules;

        return {
            mainItems: displayed.filter(m => !['settings', 'support'].includes(m.id)),
            utilityItems: displayed.filter(m => ['settings', 'support'].includes(m.id))
        };
    }, [settings.dockItems, role]);

    const mode = settings.interface?.navigationMode || 'SIDEBAR';

    const MobileDock = (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-[100] h-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center h-full overflow-x-auto no-scrollbar px-2 gap-1 justify-between sm:justify-start">
                {mainItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={`/app/${item.id}`}
                            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[4.5rem] h-full transition-all active:scale-90 relative ${isActive ? 'text-summo-primary' : 'text-gray-400'}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-orange-50 -translate-y-1' : ''}`}>
                                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-summo-primary' : 'text-gray-400'} />
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 leading-none transition-opacity duration-300 ${isActive ? 'opacity-100 text-summo-primary' : 'opacity-70'}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );

    if (mode === 'DOCK') {
        return (
            <>
                {MobileDock}
                <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 justify-center">
                    <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl px-6 py-4 flex gap-4 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] hover:scale-[1.01]">
                        {mainItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={`/app/${item.id}`}
                                    className={({ isActive }) => `group relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-200 active:scale-95
                                        ${isActive ? 'bg-gradient-to-br from-summo-primary to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-110 -translate-y-4' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                                            <span className={`absolute -bottom-8 text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50`}>
                                                {item.label}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {MobileDock}
            <div className={`hidden md:flex ${isCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-gray-200 flex-col h-full z-40 flex-shrink-0 animate-fade-in relative transition-all duration-300`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 z-50 text-gray-500 hover:text-summo-primary transition-colors"
                    aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
                    title={isCollapsed ? "Expandir" : "Recolher"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-8'} border-b border-gray-100 transition-all duration-300`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-summo-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 text-white">
                        <Droplet size={24} fill="currentColor" className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-4 overflow-hidden animate-fade-in">
                            <h1 className="font-bold text-gray-800 text-lg leading-tight whitespace-nowrap tracking-tight">SUMMO</h1>
                            <p className="text-xs text-gray-400 truncate w-40">{settings.brandName || 'Sua Loja'}</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 md:px-4 space-y-2 custom-scrollbar">
                    {mainItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.id}
                                to={`/app/${item.id}`}
                                className={({ isActive }) => `w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} p-3.5 rounded-2xl transition-all duration-200 group relative active:scale-95 ${isActive ? 'bg-orange-50 text-summo-primary shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                title={item.label}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white shadow-sm text-summo-primary' : 'bg-transparent text-gray-400 group-hover:text-summo-primary'}`}>
                                            <Icon size={isCollapsed ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        {!isCollapsed && (
                                            <div className="ml-3 text-left animate-fade-in">
                                                <span className={`block text-[15px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                                                <span className="text-[11px] opacity-60 font-medium">{item.description}</span>
                                            </div>
                                        )}
                                        {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-summo-primary rounded-full"></div>}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className={`mt-auto p-3 md:p-4 border-t border-gray-100 space-y-2`}>
                    {utilityItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.id}
                                to={`/app/${item.id}`}
                                className={({ isActive }) => `w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} p-3 rounded-xl transition-all duration-200 group active:scale-95 ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                title={item.label}
                            >
                                <Icon size={isCollapsed ? 24 : 20} />
                                {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                            </NavLink>
                        )
                    })}
                </div>
            </div>
        </>
    );
};

export default React.memo(Sidebar);
