import React, { useMemo } from 'react';
import { CheckCircle2, Circle, ArrowRight, Store, UtensilsCrossed, Package, CreditCard, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

interface OnboardingItemProps {
    title: string;
    description: string;
    isCompleted: boolean;
    icon: React.ReactNode;
    onClick: () => void;
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ title, description, isCompleted, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${isCompleted
                ? 'bg-emerald-50/50 border-emerald-100 opacity-75 grayscale-[0.5]'
                : 'bg-white border-slate-100 hover:border-summo-primary hover:shadow-lg hover:shadow-summo-primary/5 active:scale-[0.98]'
            }`}
    >
        <div className={`p-3 rounded-xl transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-summo-primary/10 group-hover:text-summo-primary'
            }`}>
            {icon}
        </div>
        <div className="flex-1">
            <h5 className={`font-bold text-sm ${isCompleted ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                {title}
            </h5>
            <p className="text-xs text-slate-500 font-medium">{description}</p>
        </div>
        <div className={`transition-all duration-300 ${isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:translate-x-1 group-hover:text-summo-primary'}`}>
            {isCompleted ? <CheckCircle2 size={24} /> : <ArrowRight size={20} />}
        </div>
    </button>
);

export const OnboardingChecklist: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { settings } = useApp();
    const { products, ingredients } = useData();

    const progress = useMemo(() => {
        const steps = [
            {
                id: 'config',
                title: 'Configuração Inicial',
                description: 'Dados da empresa e endereço cadastrados.',
                isCompleted: !!(settings.company?.cnpj && settings.address),
                icon: <Store size={20} />,
                path: 'settings'
            },
            {
                id: 'products',
                title: 'Menu Studio',
                description: 'Cadastre seu primeiro produto no cardápio.',
                isCompleted: products.length > 0,
                icon: <UtensilsCrossed size={20} />,
                path: 'menu'
            },
            {
                id: 'ingredients',
                title: 'Controle de Estoque',
                description: 'Cadastre os insumos dos seus pratos.',
                isCompleted: ingredients.length > 0,
                icon: <Package size={20} />,
                path: 'stock'
            },
            {
                id: 'payment',
                title: 'Recebimento (PIX)',
                description: 'Configure sua chave PIX para vendas rápidas.',
                isCompleted: !!settings.payment?.pixKey,
                icon: <CreditCard size={20} />,
                path: 'settings'
            }
        ];

        const completedCount = steps.filter(s => s.isCompleted).length;
        const totalCount = steps.length;
        const percentage = (completedCount / totalCount) * 100;

        return { steps, percentage, isFullyCompleted: completedCount === totalCount };
    }, [settings, products, ingredients]);

    if (progress.isFullyCompleted && settings.onboarding?.isCompleted) return null;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-slate-700/50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-summo-primary/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-summo-primary mb-2">
                            <Sparkles size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">Passo a Passo SUMMO</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                            Vamos turbinar seu negócio? 🚀
                        </h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">Complete o checklist para habilitar todas as funções inteligentes.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    className="text-slate-700"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={175.92}
                                    strokeDashoffset={175.92 - (175.92 * progress.percentage) / 100}
                                    className="text-summo-primary transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">
                                {Math.round(progress.percentage)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">Progresso Total</div>
                            <div className="text-slate-400 text-xs">{progress.steps.filter(s => s.isCompleted).length} de {progress.steps.length} concluídos</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {progress.steps.map((step) => (
                        <OnboardingItem
                            key={step.id}
                            title={step.title}
                            description={step.description}
                            isCompleted={step.isCompleted}
                            icon={step.icon}
                            onClick={() => onNavigate(step.path)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
