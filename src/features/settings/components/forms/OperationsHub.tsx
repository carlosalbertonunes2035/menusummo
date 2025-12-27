import React, { useState } from 'react';
import { SettingsFormProps } from './types';
import { Clock, Truck, SlidersHorizontal, Settings2 } from 'lucide-react';
import { ScheduleForm } from './ScheduleForm';
import { DeliveryForm } from './DeliveryForm';
import { OperationForm } from './OperationForm';

// Unified "Operations" Hub
export const OperationsHub: React.FC<SettingsFormProps & { onScheduleChange: any }> = (props) => {
    const [subTab, setSubTab] = useState<'MODES' | 'HOURS' | 'DELIVERY'>('MODES');

    const tabs = [
        { id: 'MODES', label: 'Modos & Tempos', icon: SlidersHorizontal, desc: 'Delivery, Retirada e KDS' },
        { id: 'HOURS', label: 'Horários', icon: Clock, desc: 'Abertura e Fechamento' },
        { id: 'DELIVERY', label: 'Logística', icon: Truck, desc: 'Áreas e Taxas' },
    ] as const;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Sub-nav */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex p-1.5 gap-1.5 overflow-x-auto">
                {tabs.map(tab => {
                    const isActive = subTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${isActive
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Icon size={18} />
                            <div className="text-left">
                                <span className="block leading-none">{tab.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {subTab === 'MODES' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-4 px-2">
                            <h3 className="font-bold text-xl text-slate-800">Modos de Operação</h3>
                            <p className="text-sm text-slate-500">Configure como sua loja aceita pedidos e os tempos de preparo da cozinha.</p>
                        </div>
                        <OperationForm {...props} />
                    </div>
                )}

                {subTab === 'HOURS' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-4 px-2">
                            <h3 className="font-bold text-xl text-slate-800">Horários de Funcionamento</h3>
                            <p className="text-sm text-slate-500">Defina quando sua loja está aberta para receber pedidos.</p>
                        </div>
                        <ScheduleForm {...props} onScheduleChange={props.onScheduleChange} />
                    </div>
                )}

                {subTab === 'DELIVERY' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-4 px-2">
                            <h3 className="font-bold text-xl text-slate-800">Logística de Entrega</h3>
                            <p className="text-sm text-slate-500">Gerencie áreas de entrega, taxas por km e frete grátis.</p>
                        </div>
                        <DeliveryForm {...props} />
                    </div>
                )}
            </div>
        </div>
    );
};
