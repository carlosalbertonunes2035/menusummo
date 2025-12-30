import React, { useState } from 'react';
import {
    Loader2, ArrowLeft, Check, ChefHat, Pizza, ShoppingBag, UtensilsCrossed, Store,
    Smartphone, Target, TrendingUp, Package, Users, BarChart3, Heart, Zap,
    Truck, ShoppingCart, Coffee, X
} from 'lucide-react';
import { SalesChannels, DigitalMenuConfig, CurrentSystem, BusinessGoal, MainChallenge } from './types';

interface RegisterStep3Props {
    segment: string;
    setSegment: (val: string) => void;
    monthlyRevenue: string;
    setMonthlyRevenue: (val: string) => void;
    salesChannels: SalesChannels;
    toggleSalesChannel: (channel: keyof SalesChannels) => void;
    addOtherApp: (app: string) => void;
    removeOtherApp: (app: string) => void;
    digitalMenu: DigitalMenuConfig;
    setDigitalMenu: (val: DigitalMenuConfig) => void;
    currentSystem: CurrentSystem;
    setCurrentSystem: (val: CurrentSystem) => void;
    currentSystemName: string;
    setCurrentSystemName: (val: string) => void;
    goals: BusinessGoal[];
    toggleGoal: (goal: BusinessGoal) => void;
    mainChallenge: MainChallenge;
    setMainChallenge: (val: MainChallenge) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

const segments = [
    { id: 'Hamburgueria', icon: ChefHat, label: 'Hamburgueria' },
    { id: 'Pizzaria', icon: Pizza, label: 'Pizzaria' },
    { id: 'Açaiteria', icon: ShoppingBag, label: 'Açaiteria' },
    { id: 'Japonesa', icon: UtensilsCrossed, label: 'Japonesa' },
    { id: 'Brasileira', icon: Store, label: 'Brasileira' },
    { id: 'Padaria', icon: Coffee, label: 'Padaria' },
    { id: 'Confeitaria', icon: ChefHat, label: 'Confeitaria' },
    { id: 'Outros', icon: Store, label: 'Outros' }
];

const revenueRanges = [
    'Até R$ 5k', 'R$ 5k - R$ 15k', 'R$ 15k - R$ 30k',
    'R$ 30k - R$ 50k', 'R$ 50k - R$ 100k', 'Acima de R$ 100k', 'Prefiro não informar'
];

const goalOptions = [
    { value: 'cost_control' as BusinessGoal, label: 'Controlar custos e lucro', icon: BarChart3 },
    { value: 'inventory' as BusinessGoal, label: 'Gerenciar estoque', icon: Package },
    { value: 'orders' as BusinessGoal, label: 'Organizar pedidos', icon: ShoppingCart },
    { value: 'team' as BusinessGoal, label: 'Gerenciar equipe', icon: Users },
    { value: 'sales' as BusinessGoal, label: 'Aumentar vendas', icon: TrendingUp },
    { value: 'loyalty' as BusinessGoal, label: 'Fidelizar clientes', icon: Heart },
    { value: 'professionalize' as BusinessGoal, label: 'Profissionalizar operação', icon: Zap }
];

const challengeOptions = [
    { value: 'waste' as MainChallenge, label: 'Desperdício de ingredientes' },
    { value: 'profit' as MainChallenge, label: 'Não sei meu lucro real' },
    { value: 'orders' as MainChallenge, label: 'Pedidos desorganizados' },
    { value: 'team' as MainChallenge, label: 'Equipe desalinhada' },
    { value: 'customers' as MainChallenge, label: 'Poucos clientes' },
    { value: 'retention' as MainChallenge, label: 'Clientes não voltam' },
    { value: 'manual' as MainChallenge, label: 'Operação manual demais' }
];

export const RegisterStep3: React.FC<RegisterStep3Props> = ({
    segment, setSegment, monthlyRevenue, setMonthlyRevenue,
    salesChannels, toggleSalesChannel, addOtherApp, removeOtherApp,
    digitalMenu, setDigitalMenu, currentSystem, setCurrentSystem, currentSystemName, setCurrentSystemName,
    goals, toggleGoal, mainChallenge, setMainChallenge,
    onBack, onSubmit, loading
}) => {
    const [newApp, setNewApp] = useState('');

    const handleAddApp = () => {
        if (newApp.trim()) {
            addOtherApp(newApp.trim());
            setNewApp('');
        }
    };

    return (
        <div className="space-y-6 animate-slide-in-up" key="step3">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-3 shadow-lg shadow-purple-500/25">
                    <Target size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-summo-text">Vamos personalizar sua experiência 🎯</h3>
                <p className="text-sm text-summo-text-muted mt-2">Quanto mais soubermos, melhor te ajudaremos</p>
            </div>

            <div className="space-y-6">
                {/* Segment */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-3 ml-1 tracking-wider">Qual o seu ramo?</label>
                    <div className="grid grid-cols-4 gap-2">
                        {segments.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSegment(s.id)}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${segment === s.id ? 'border-summo-primary bg-summo-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <s.icon size={18} className={segment === s.id ? 'text-summo-primary' : 'text-gray-400'} />
                                <span className={`text-[10px] font-bold uppercase ${segment === s.id ? 'text-summo-primary' : 'text-gray-600'}`}>
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Faturamento Mensal</label>
                    <select
                        value={monthlyRevenue}
                        onChange={e => setMonthlyRevenue(e.target.value)}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-summo-primary focus:bg-white outline-none transition-all font-medium text-summo-text"
                    >
                        {revenueRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>

                {/* Sales Channels */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-3 ml-1 tracking-wider">Onde você vende hoje? (Múltipla escolha)</label>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'ownDelivery', label: 'Delivery Próprio', icon: Truck },
                                { id: 'counter', label: 'Balcão', icon: ShoppingCart },
                                { id: 'dineIn', label: 'Mesas', icon: Coffee }
                            ].map((ch) => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    onClick={() => toggleSalesChannel(ch.id as keyof SalesChannels)}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${salesChannels[ch.id as keyof SalesChannels]
                                            ? 'border-summo-primary bg-summo-primary/5 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <ch.icon size={18} className={salesChannels[ch.id as keyof SalesChannels] ? 'text-summo-primary' : 'text-gray-400'} />
                                    <span className={`text-[10px] font-bold ${salesChannels[ch.id as keyof SalesChannels] ? 'text-summo-primary' : 'text-gray-600'}`}>
                                        {ch.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'ifood', label: 'iFood' },
                                { id: 'rappi', label: 'Rappi' },
                                { id: 'aiqfome', label: 'Aiqfome' }
                            ].map((app) => (
                                <button
                                    key={app.id}
                                    type="button"
                                    onClick={() => toggleSalesChannel(app.id as keyof SalesChannels)}
                                    className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${salesChannels[app.id as keyof SalesChannels]
                                            ? 'border-summo-primary bg-summo-primary/5 text-summo-primary shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span className="text-xs font-bold">{app.label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Other Apps */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newApp}
                                onChange={e => setNewApp(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddApp())}
                                placeholder="Outro app? (Ex: Uber Eats)"
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddApp}
                                className="px-4 py-2 bg-summo-primary text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                        {salesChannels.otherApps.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {salesChannels.otherApps.map(app => (
                                    <div key={app} className="inline-flex items-center gap-2 px-3 py-1.5 bg-summo-primary/10 text-summo-primary rounded-full text-xs font-bold">
                                        {app}
                                        <button type="button" onClick={() => removeOtherApp(app)} className="hover:bg-summo-primary/20 rounded-full p-0.5">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Digital Menu */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${digitalMenu.hasOwn ? 'border-summo-primary bg-summo-primary/5' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Smartphone size={20} className={digitalMenu.hasOwn ? 'text-summo-primary' : 'text-gray-400'} />
                            <div>
                                <h4 className="text-sm font-bold text-summo-text">Cardápio Digital</h4>
                                <p className="text-xs text-summo-text-muted">Já utiliza alguma plataforma?</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDigitalMenu({ ...digitalMenu, hasOwn: !digitalMenu.hasOwn })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${digitalMenu.hasOwn ? 'bg-summo-primary' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${digitalMenu.hasOwn ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                    {digitalMenu.hasOwn && (
                        <input
                            type="text"
                            value={digitalMenu.platform}
                            onChange={e => setDigitalMenu({ ...digitalMenu, platform: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-summo-primary/20 rounded-xl focus:border-summo-primary outline-none text-sm font-medium"
                            placeholder="Qual? (Ex: Goomer, AnotaAI...)"
                        />
                    )}
                </div>

                {/* Current System */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Sistema Atual</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: 'paper' as CurrentSystem, label: 'Caderninho/Papel' },
                            { value: 'spreadsheet' as CurrentSystem, label: 'Excel/Planilhas' },
                            { value: 'other_system' as CurrentSystem, label: 'Outro sistema' },
                            { value: 'none' as CurrentSystem, label: 'Nada organizado' }
                        ].map((sys) => (
                            <button
                                key={sys.value}
                                type="button"
                                onClick={() => setCurrentSystem(sys.value)}
                                className={`p-3 rounded-xl border-2 transition-all ${currentSystem === sys.value
                                        ? 'border-summo-primary bg-summo-primary/5 text-summo-primary shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <span className="text-xs font-bold">{sys.label}</span>
                            </button>
                        ))}
                    </div>
                    {currentSystem === 'other_system' && (
                        <input
                            type="text"
                            value={currentSystemName}
                            onChange={e => setCurrentSystemName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none text-sm font-medium mt-2"
                            placeholder="Qual sistema?"
                        />
                    )}
                </div>

                {/* Goals */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-3 ml-1 tracking-wider">O que te traz ao SUMMO? (Múltipla escolha)</label>
                    <div className="grid grid-cols-2 gap-2">
                        {goalOptions.map((goal) => (
                            <button
                                key={goal.value}
                                type="button"
                                onClick={() => toggleGoal(goal.value)}
                                className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${goals.includes(goal.value)
                                        ? 'border-summo-primary bg-summo-primary/5 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <goal.icon size={16} className={goals.includes(goal.value) ? 'text-summo-primary' : 'text-gray-400'} />
                                <span className={`text-xs font-bold ${goals.includes(goal.value) ? 'text-summo-primary' : 'text-gray-600'}`}>
                                    {goal.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Challenge */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Maior desafio hoje?</label>
                    <select
                        value={mainChallenge}
                        onChange={e => setMainChallenge(e.target.value as MainChallenge)}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-summo-primary focus:bg-white outline-none transition-all font-medium text-summo-text"
                    >
                        {challengeOptions.map(ch => (
                            <option key={ch.value} value={ch.value}>{ch.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} /> Voltar
                </button>
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/30 flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Começar Minha Jornada 🚀'}
                </button>
            </div>
        </div>
    );
};
