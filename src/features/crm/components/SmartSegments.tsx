
import React, { useMemo, useState, useEffect } from 'react';
import { Customer } from '../../../types';
import { Zap, Heart, AlertOctagon, UserPlus, ArrowRight, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { generateWhatsAppLink, formatCurrency } from '../../../lib/utils';
import { getRetentionLoyaltyInsights } from '../../../services/geminiService';

interface SmartSegmentsProps {
    customers: Customer[];
}

// Helper to determine segment
const getSegment = (customer: Customer): 'NEW' | 'ACTIVE' | 'AT_RISK' | 'LOST' => {
    const daysSinceLastOrder = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));

    if (customer.totalOrders === 1 && daysSinceLastOrder < 30) return 'NEW';
    if (daysSinceLastOrder <= 14) return 'ACTIVE';
    if (daysSinceLastOrder > 14 && daysSinceLastOrder <= 45) return 'AT_RISK';
    return 'LOST';
};

const SmartSegments: React.FC<SmartSegmentsProps> = ({ customers }) => {
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        const fetchAiRecs = async () => {
            if (customers.length === 0) return;
            setLoadingAi(true);
            try {
                const recs = await getRetentionLoyaltyInsights(customers.slice(0, 20));
                setAiRecommendations(recs);
            } catch (e) { console.error(e); }
            finally { setLoadingAi(false); }
        };
        fetchAiRecs();
    }, [customers.length]);

    const segments = useMemo(() => {
        const segs = { NEW: [] as Customer[], ACTIVE: [] as Customer[], AT_RISK: [] as Customer[], LOST: [] as Customer[] };
        customers.forEach(c => {
            const s = getSegment(c);
            segs[s].push(c);
        });
        return segs;
    }, [customers]);

    const strategies = [
        {
            id: 'NEW',
            title: 'Novos Clientes',
            subtitle: 'Compraram 1x recentemente',
            count: segments.NEW.length,
            color: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: UserPlus,
            advice: 'Ouro: O momento da "Segunda Compra" é crítico. Se eles não voltarem em 15 dias, você os perde.',
            actionLabel: 'Gerar Oferta de 2ª Compra',
            actionMessage: (c: Customer) => `Olá ${c.name}! 👋 Vi que você experimentou nosso cardápio recentemente. Que tal pedir de novo hoje? Tenho um mimo especial para sua segunda compra: entrega grátis! 🛵💨`
        },
        {
            id: 'ACTIVE',
            title: 'Habituais (Vips)',
            subtitle: 'Compram a cada 14 dias ou menos',
            count: segments.ACTIVE.length,
            color: 'bg-green-50 border-green-200 text-green-800',
            icon: Heart,
            advice: 'Lucro Puro: NUNCA dê desconto em produtos para este grupo. Eles já amam sua marca. Dê mimos de baixo custo (ex: bombom) ou ofereça produtos novos (Upsell).',
            actionLabel: 'Sugerir Novidade (Sem Desconto)',
            actionMessage: (c: Customer) => `Fala ${c.name}! Tudo bem? 😋 Acabamos de lançar um sabor novo que é a sua cara. Dá uma olhada no cardápio! Se pedir hoje, mando um mimo surpresa.`
        },
        {
            id: 'AT_RISK',
            title: 'Em Risco',
            subtitle: 'Ausentes há 15-45 dias',
            count: segments.AT_RISK.length,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: Zap,
            advice: 'Alerta: Estes clientes estão esquecendo de você. Você precisa reativar a memória deles AGORA antes que virem "Perdidos".',
            actionLabel: 'Ativar "Oferta Relâmpago"',
            actionMessage: (c: Customer) => `Oi ${c.name}, sumiu hein! 🥺 Estamos com saudades. Liberei um cupom de 15% OFF válido SÓ HOJE para você matar a vontade. O código é VOLTA15.`
        },
        {
            id: 'LOST',
            title: 'Perdidos / Churn',
            subtitle: 'Sem comprar há +45 dias',
            count: segments.LOST.length,
            color: 'bg-red-50 border-red-200 text-red-800',
            icon: AlertOctagon,
            advice: 'Recuperação: O custo para trazer um novo é 5x maior que recuperar este. Use ofertas agressivas aqui (até margem zero) só para trazê-lo de volta ao hábito.',
            actionLabel: 'Enviar "Oferta Irrecusável"',
            actionMessage: (c: Customer) => `Olá ${c.name}! Faz tempo que não te vemos. 💔 Queremos você de volta! Preparamos um presente: Na compra de qualquer lanche, a bebida é por nossa conta hoje! 🥤`
        }
    ];

    const handleBlast = (strategy: any) => {
        // In a real app, this would open a bulk sender or modal.
        // For now, we simulate picking the first customer to show the action.
        const list = segments[strategy.id as keyof typeof segments];
        if (list.length === 0) return alert('Nenhum cliente neste segmento.');

        const sample = list[0];
        const msg = strategy.actionMessage(sample);
        window.open(generateWhatsAppLink(sample.phone, "", "", msg), '_blank');
    };

    return (
        <div className="space-y-6">
            {/* AI Autopilot Section */}
            {(loadingAi || aiRecommendations.length > 0) && (
                <div className="px-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
                                <h3 className="font-bold text-lg">Autopiloto de Retenção AI</h3>
                            </div>

                            {loadingAi ? (
                                <div className="flex items-center gap-3 py-4">
                                    <Loader2 className="animate-spin" size={20} />
                                    <p className="text-sm font-medium opacity-80">Analisando comportamento dos clientes...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {aiRecommendations.map((rec, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition group">
                                            <p className="font-bold text-sm mb-1">{rec.name}</p>
                                            <p className="text-[11px] opacity-70 mb-3">{rec.reason}</p>
                                            <button
                                                onClick={() => {
                                                    const customer = customers.find(c => c.name === rec.name);
                                                    if (customer) window.open(generateWhatsAppLink(customer.phone, "", "", rec.whatsappDrip), '_blank');
                                                }}
                                                className="w-full bg-white text-indigo-700 py-2 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
                                            >
                                                Tentar Recuperar <MessageCircle size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {strategies.map(strat => (
                    <div key={strat.id} className={`p-5 rounded-2xl border-2 flex flex-col justify-between shadow-sm transition hover:shadow-md ${strat.color}`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-full bg-white bg-opacity-60`}>
                                    <strat.icon size={24} />
                                </div>
                                <span className="text-2xl font-black">{strat.count}</span>
                            </div>
                            <h3 className="font-bold text-lg leading-tight">{strat.title}</h3>
                            <p className="text-xs opacity-80 font-medium mb-3">{strat.subtitle}</p>

                            <div className="bg-white bg-opacity-60 p-3 rounded-xl mb-4">
                                <p className="text-[11px] leading-relaxed font-medium">
                                    💡 <span className="font-bold">Dica do Sistema:</span> {strat.advice}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleBlast(strat)}
                            disabled={strat.count === 0}
                            className="w-full py-3 bg-white hover:bg-opacity-90 text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MessageCircle size={16} /> {strat.actionLabel}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartSegments;
