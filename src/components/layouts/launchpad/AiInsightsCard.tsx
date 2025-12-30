import React, { useEffect, useState, memo } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Lightbulb, Loader2, Bot, UtensilsCrossed } from 'lucide-react';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { useOrders } from '@/hooks/useOrders';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useProducts } from '@/features/inventory/hooks/queries';

interface AiInsightsCardProps {
    hideOnboarding?: boolean;
}

const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ hideOnboarding = false }) => {
    const { systemUser } = useAuth();
    const { data: products = [] } = useProducts(systemUser?.tenantId);
    const { data: orders, loading: ordersLoading } = useOrders({ limit: 50 });
    const { data: expenses, loading: expensesLoading } = useExpenses({ limit: 20 });
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const dataLoading = ordersLoading || expensesLoading;

    useEffect(() => {
        const fetchInsights = async () => {
            if (dataLoading || products.length === 0 || orders.length === 0) return;

            setLoading(true);
            try {
                // Prepare simplified data for AI
                const productStats = (products as any[]).map(p => {
                    const price = p.channels?.find((c: any) => c.channel === 'pos')?.price || 0;
                    const cost = p.cost || 0;
                    const marginPercent = price > 0 ? ((price - cost) / price) * 100 : 0;
                    return { name: p.name, marginPercent };
                });

                const getProfitInsightsFn = httpsCallable(functions, 'getProfitInsights');
                const { data } = await getProfitInsightsFn({
                    data: {
                        products: productStats,
                        orders: orders.slice(-50), // Last 50 orders for context
                        expenses: expenses.slice(-20)
                    }
                });
                const result = (data as any).recommendations || []; // Backend returns object with analysis, recommendations, potentialImpact
                setInsights(result);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("Failed to fetch AI insights", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [dataLoading, products.length, orders.length]);

    if (loading && insights.length === 0) {
        return (
            <div className="bg-gradient-to-br from-orange-900 to-amber-900 p-6 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center justify-center min-h-[160px] animate-pulse">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-sm font-medium opacity-70">O Conselheiro SUMMO está analisando seus números...</p>
            </div>
        );
    }

    if (insights.length === 0) {
        if (hideOnboarding) return null;
        // Welcome / Onboarding Tips
        return (
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    <Sparkles size={140} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Bot size={24} className="text-indigo-200" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl leading-none">Bem-vindo ao Futuro! 🚀</h3>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60 mt-1">Dicas de Primeiro Dia</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <div className="bg-indigo-500/30 p-2 rounded-lg h-fit">
                                <UtensilsCrossed size={18} className="text-indigo-200" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Monte seu Cardápio</h4>
                                <p className="text-xs opacity-70 mt-1">Comece cadastrando seus produtos no Menu Studio para habilitar a inteligência de lucro.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <div className="bg-purple-500/30 p-2 rounded-lg h-fit">
                                <TrendingUp size={18} className="text-purple-200" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Monitore seu CMV</h4>
                                <p className="text-xs opacity-70 mt-1">Ao cadastrar ingredientes, o SUMMO calculará automaticamente seu custo por prato.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => document.querySelector('[href="/app/menu"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        className="w-full mt-8 bg-white text-indigo-900 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        Configurar Meu Cardápio
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-amber-900 p-6 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group border border-white/10">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 -rotate-12 translate-x-4">
                <Bot size={140} />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">Conselheiro SUMMO</h3>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60 mt-1">
                            {lastUpdated ? `Atualizado em ${lastUpdated.toLocaleTimeString()}` : 'Inteligência Proativa'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {insights.map((insight, idx) => (
                        <div key={idx} className="flex gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/5 transition group/item cursor-default">
                            <div className="bg-orange-500/30 p-1.5 rounded-lg h-fit">
                                <Lightbulb size={16} className="text-yellow-200" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">{insight}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('summo_ai_cache_profitability_insights_' + products.length + '_' + orders.length);
                        window.location.reload();
                    }}
                    className="w-full mt-6 bg-white text-orange-900 py-3.5 rounded-2xl font-bold text-sm shadow-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 group/btn"
                >
                    Recalcular Insights
                    <TrendingUp size={18} className="group-hover/btn:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default memo(AiInsightsCard);
