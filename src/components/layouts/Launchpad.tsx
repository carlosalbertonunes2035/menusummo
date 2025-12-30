
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useIngredients } from '@/features/inventory/hooks/queries';
import { useApp } from '../../contexts/AppContext';
import { OrderStatus } from '@/types';
import { LaunchpadHeader, AlertWidgets, AppGrid, FooterWidget, GrowthWidget } from './launchpad/LaunchpadWidgets';
import AiInsightsCard from './launchpad/AiInsightsCard';
import { OnboardingChecklist } from '../dashboard/OnboardingChecklist';
import { OnboardingTourController } from '../dashboard/OnboardingTourController';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { calculateDashboardStats } from '@/lib/utils/financialUtils';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface LaunchpadProps {
    isLoading?: boolean;
}

const Launchpad: React.FC<LaunchpadProps> = ({ isLoading = false }) => {
    const { systemUser, isMockMode } = useAuth();
    const { data: ingredients = [] } = useIngredients(systemUser?.tenantId);
    const { data: orders } = useOrders({ limit: 100 });
    const { data: customers } = useCustomers({ limit: 100 });
    const { settings } = useApp();
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate('/app/' + path);
    };

    useEffect(() => {
        // Welcome effect for brand new users
        if (settings.onboarding?.isCompleted === false && !localStorage.getItem('summo_welcome_shown')) {
            toast.success(`Boas-vindas ao seu império, ${systemUser?.name || 'Parceiro'}! 🥂`, {
                duration: 6000,
                icon: '🚀',
                style: {
                    borderRadius: '1rem',
                    background: '#1e293b',
                    color: '#fff',
                    fontWeight: 'bold',
                    border: '1px solid #FF6B00'
                }
            });
            localStorage.setItem('summo_welcome_shown', 'true');
        }
    }, [settings.onboarding, systemUser?.name]);



    const stats = useMemo(() => {
        return calculateDashboardStats(orders);
    }, [orders]);

    // OPERATIONAL ALERTS
    const lateOrders = useMemo(() => {
        if (isLoading || !orders) return 0;
        const now = Date.now();
        return orders.filter((o: typeof orders[number]) =>
            (o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING) &&
            (now - new Date(o.createdAt).getTime()) > (20 * 60 * 1000)
        ).length;
    }, [orders, isLoading]);

    const lowStockItems = useMemo(() => {
        if (isLoading || !ingredients) return 0;
        return ingredients.filter(i => i.currentStock <= i.minStock).length;
    }, [ingredients, isLoading]);

    // CRM / GROWTH ALERTS
    const crmStats = useMemo(() => {
        if (isLoading || !customers) return { atRisk: 0, lost: 0 };
        const now = Date.now();
        const dayMs = 1000 * 60 * 60 * 24;

        let atRisk = 0;
        let lost = 0;

        customers.forEach(c => {
            const daysSince = (now - new Date(c.lastOrderDate).getTime()) / dayMs;
            // Logic: Regulars (>2 orders) who haven't bought in 30-60 days are AT RISK
            if (c.totalOrders > 2) {
                if (daysSince > 30 && daysSince <= 60) atRisk++;
                else if (daysSince > 60) lost++;
            }
        });
        return { atRisk, lost };
    }, [customers, isLoading]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    }, []);

    return (
        <div className="h-full w-full overflow-y-auto space-y-6 lg:space-y-8 animate-fade-in p-4 pb-32 lg:p-8 lg:pb-32 custom-scrollbar bg-gray-50">
            <LaunchpadHeader
                storeName={settings.brandName || 'Sua Loja'}
                greeting={greeting}
                stats={stats}
                isLoading={isLoading}
                onNavigate={handleNavigate}
            />

            {!isLoading && <OnboardingChecklist onNavigate={handleNavigate} />}

            {/* PRIORITY ALERTS ROW */}
            {!isLoading && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">SUMMO</h1>
                            <p className="text-gray-500 font-medium">Gestão Inteligente de Food Service</p>
                        </div>
                        {isMockMode && (
                            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-200 animate-pulse">
                                <AlertCircle size={14} /> MODO SIMULADO (OFFLINE)
                            </div>
                        )}
                        <div className="text-right">
                            {/* This div was empty in the original snippet, keeping it as is or removing if not needed */}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <AiInsightsCard hideOnboarding={true} />
                        <div className="grid grid-cols-1 gap-4">
                            {(lateOrders > 0 || lowStockItems > 0) && (
                                <AlertWidgets lateOrders={lateOrders} lowStock={lowStockItems} onNavigate={handleNavigate} />
                            )}
                        </div>
                        {(crmStats.atRisk > 0 || crmStats.lost > 0) && (
                            <GrowthWidget atRisk={crmStats.atRisk} lost={crmStats.lost} onNavigate={handleNavigate} />
                        )}
                    </div>
                </>
            )}

            <AppGrid onNavigate={handleNavigate} />

            <FooterWidget onNavigate={handleNavigate} />
            <OnboardingTourController />
        </div>
    );
};

export default React.memo(Launchpad);
