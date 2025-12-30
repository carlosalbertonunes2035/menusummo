import React from 'react';
import { Loader2, ArrowLeft, Check, ChefHat, Pizza, ShoppingBag, UtensilsCrossed, Store, Smartphone } from 'lucide-react';
import { DeliveryChannels, DigitalMenuConfig, SalesChannels } from './types';

interface RegisterStep4Props {
    segment: string;
    setSegment: (val: string) => void;
    monthlyRevenue: string;
    setMonthlyRevenue: (val: string) => void;
    salesChannels: SalesChannels;
    toggleSalesChannel: (channel: keyof SalesChannels) => void;
    deliveryChannels: DeliveryChannels;
    toggleChannel: (channel: keyof DeliveryChannels) => void;
    digitalMenu: DigitalMenuConfig;
    setDigitalMenu: (val: DigitalMenuConfig) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

const segments = [
    { id: 'Hamburgueria', icon: ChefHat, label: 'Hamburgueria' },
    { id: 'Pizzaria', icon: Pizza, label: 'Pizzaria' },
    { id: 'Acaiteira', icon: ShoppingBag, label: 'Açaiteria' },
    { id: 'Japonesa', icon: UtensilsCrossed, label: 'Japonesa' },
    { id: 'Brasileira', icon: Store, label: 'Brasileira' },
    { id: 'Outros', icon: Store, label: 'Outros' }
];

export const RegisterStep4: React.FC<RegisterStep4Props> = ({
    segment, setSegment, monthlyRevenue, setMonthlyRevenue, salesChannels, toggleSalesChannel, deliveryChannels, toggleChannel, digitalMenu, setDigitalMenu, onBack, onSubmit, loading
}) => {
    return (
        <div className="space-y-6 animate-slide-in-up" key="step4">
            <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-summo-text">Perfil do seu negócio</h3>
                <p className="text-sm text-summo-text-muted mt-1">Isso nos ajuda a personalizar sua experiência.</p>
            </div>

            <div className="space-y-6">
                {/* Segment Selection */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-3 ml-1 tracking-wider text-center">Qual o seu ramo?</label>
                    <div className="grid grid-cols-3 gap-2">
                        {segments.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSegment(s.id)}
                                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${segment === s.id ? 'border-summo-primary bg-summo-primary/5 text-summo-primary shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                            >
                                <s.icon size={20} />
                                <span className="text-[10px] font-bold uppercase">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sales Channels */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-3 ml-1 tracking-wider">Onde você vende hoje?</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'delivery', label: 'Entrega', sub: 'Moto/App' },
                            { id: 'counter', label: 'Balcão', sub: 'Takeaway' },
                            { id: 'table', label: 'Mesa', sub: 'Local' }
                        ].map((ch) => (
                            <button
                                key={ch.id}
                                type="button"
                                onClick={() => toggleSalesChannel(ch.id as keyof SalesChannels)}
                                className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${salesChannels[ch.id as keyof SalesChannels] ? 'border-summo-primary bg-summo-primary/5 text-summo-primary shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                            >
                                <div className={`p-1 rounded-full transition-colors ${salesChannels[ch.id as keyof SalesChannels] ? 'bg-summo-primary text-white' : 'bg-gray-100'}`}>
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                <span className="text-[11px] font-bold">{ch.label}</span>
                                <span className="text-[9px] opacity-70">{ch.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Digital Menu */}
                <div className={`p-4 rounded-3xl border transition-all ${digitalMenu.hasOwn ? 'border-summo-primary bg-summo-primary/5' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${digitalMenu.hasOwn ? 'bg-summo-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-summo-text leading-none">Cardápio Digital</h4>
                                <p className="text-[11px] text-summo-text-muted mt-1">Já utiliza alguma plataforma?</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setDigitalMenu({ ...digitalMenu, hasOwn: !digitalMenu.hasOwn })} className={`w-12 h-6 rounded-full relative transition-colors ${digitalMenu.hasOwn ? 'bg-summo-primary' : 'bg-gray-300'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${digitalMenu.hasOwn ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {digitalMenu.hasOwn && (
                        <div className="animate-fade-in mt-4">
                            <input
                                type="text"
                                value={digitalMenu.platform}
                                onChange={e => setDigitalMenu({ ...digitalMenu, platform: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-summo-primary/20 rounded-xl focus:border-summo-primary outline-none text-sm font-medium shadow-inner"
                                placeholder="Qual plataforma? (Ex: Goomer, AnotaAI...)"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onBack} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">
                    <ArrowLeft size={18} className="inline mr-1" /> Voltar
                </button>
                <button onClick={onSubmit} disabled={loading} className="flex-[2] bg-summo-primary text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-summo-primary/25 flex justify-center items-center gap-2 text-lg">
                    {loading ? <Loader2 className="animate-spin" /> : 'Começar a Lucrar'}
                </button>
            </div>
        </div>
    );
};
