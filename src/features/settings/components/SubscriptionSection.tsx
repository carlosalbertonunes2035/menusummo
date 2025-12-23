import React from 'react';
import { Briefcase } from 'lucide-react';

const SubscriptionSection: React.FC = () => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
            <h4 className="font-bold mb-4 text-gray-800">Seu Plano</h4>
            <div className="bg-summo-bg p-6 rounded-2xl border-2 border-summo-primary/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <span className="font-bold text-2xl text-summo-dark">Plano PRO</span>
                    <p className="text-sm text-gray-500 mt-1">Sua licença está ativa. A próxima cobrança será em 15/08/2024.</p>
                </div>
                <button className="bg-summo-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition w-full sm:w-auto">
                    Gerenciar Assinatura
                </button>
            </div>
        </div>
    );
};

export default SubscriptionSection;
