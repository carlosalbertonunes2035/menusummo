import React from 'react';
import { Bike, Store } from 'lucide-react';
import { OrderType } from '@/types';

interface FulfillmentStepProps {
    animationDirection: 'left' | 'right';
    orderMode: OrderType;
    setOrderMode: (mode: OrderType) => void;
    user: any;
    onOpenAddressModal: () => void;
    settings: any;
    isScheduling: boolean;
    setIsScheduling: (val: boolean) => void;
    scheduledTime: string;
    setScheduledTime: (val: string) => void;
    generateTimeSlots: string[];
}

export const FulfillmentStep: React.FC<FulfillmentStepProps> = ({
    animationDirection,
    orderMode,
    setOrderMode,
    user,
    onOpenAddressModal,
    settings,
    isScheduling,
    setIsScheduling,
    scheduledTime,
    setScheduledTime,
    generateTimeSlots
}) => {
    return (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <h3 className="font-bold text-gray-800 text-lg">Como você quer receber?</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Entregar no endereço</p>
                            {user.address ? (
                                <>
                                    <p className="font-bold text-gray-800 text-sm">{user.address.split(',')[0]}</p>
                                    <p className="text-xs text-gray-500">{user.address}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Nenhum endereço selecionado</p>
                            )}
                        </div>
                        <button onClick={onOpenAddressModal} className="text-xs font-bold text-summo-primary bg-summo-bg px-3 py-1.5 rounded-lg">Trocar</button>
                    </div>
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                        {[
                            { id: OrderType.DELIVERY, label: 'Entrega', icon: Bike },
                            { id: OrderType.TAKEOUT, label: 'Retirada', icon: Store }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setOrderMode(m.id)}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${orderMode === m.id ? 'bg-white text-summo-primary shadow' : 'text-gray-500 hover:bg-white/50'}`}
                            >
                                <m.icon size={16} /> {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">Opções de {orderMode === OrderType.DELIVERY ? 'entrega' : 'retirada'}</h4>
                <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${!isScheduling ? 'border-summo-primary bg-summo-bg/20' : 'border-gray-100 bg-white'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isScheduling ? 'border-summo-primary' : 'border-gray-300'}`}>
                                {!isScheduling && <div className="w-2.5 h-2.5 bg-summo-primary rounded-full" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800">Padrão (Agora)</p>
                                <p className="text-xs text-gray-500">{settings.orderModes?.delivery?.minTime || 30}-{settings.orderModes?.delivery?.maxTime || 60} min</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Rápido</span>
                    </label>

                    {settings.orderModes?.scheduling?.enabled && (
                        <div className={`rounded-xl border-2 transition overflow-hidden ${isScheduling ? 'border-summo-primary bg-summo-bg/10' : 'border-gray-100 bg-white'}`}>
                            <label className="flex items-center justify-between p-4 cursor-pointer" onClick={() => { setIsScheduling(true); if (!scheduledTime && generateTimeSlots.length > 0) setScheduledTime(generateTimeSlots[0]); }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isScheduling ? 'border-summo-primary' : 'border-gray-300'}`}>
                                        {isScheduling && <div className="w-2.5 h-2.5 bg-summo-primary rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Agendar</p>
                                        <p className="text-xs text-gray-500">Escolha um horário</p>
                                    </div>
                                </div>
                            </label>
                            {isScheduling && (
                                <div className="px-4 pb-4 animate-fade-in">
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {generateTimeSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setScheduledTime(time)}
                                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition ${scheduledTime === time ? 'bg-summo-primary text-white border-summo-primary' : 'bg-white border-gray-200 text-gray-600'}`}>{time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
