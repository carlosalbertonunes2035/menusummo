import React from 'react';
import { User, Smartphone, AlertCircle } from 'lucide-react';

interface IdentityStepProps {
    animationDirection: 'left' | 'right';
    identityName: string;
    setIdentityName: (val: string) => void;
    identityPhone: string;
    setIdentityPhone: (val: string) => void;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
    animationDirection,
    identityName,
    setIdentityName,
    identityPhone,
    setIdentityPhone
}) => {
    return (
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-summo-bg rounded-full flex items-center justify-center mx-auto mb-4 text-summo-primary">
                    <User size={32} />
                </div>
                <h3 className="font-bold text-gray-800 text-xl">Vamos nos conhecer?</h3>
                <p className="text-gray-500 text-sm mt-1 px-6">Precisamos do seu nome e contato para enviar atualizações do pedido.</p>
            </div>
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Seu Nome</label>
                    <input
                        type="text"
                        value={identityName}
                        onChange={e => setIdentityName(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary transition font-medium"
                        placeholder="Como podemos te chamar?"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">WhatsApp / Celular</label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="tel"
                            value={identityPhone}
                            onChange={e => setIdentityPhone(e.target.value)}
                            className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary transition font-medium"
                            placeholder="(00) 90000-0000"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1">
                        <AlertCircle size={10} /> Enviaremos o status do pedido por aqui.
                    </p>
                </div>
            </div>
        </div>
    );
};
