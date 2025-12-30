import React from 'react';
import { Rocket, BookOpen, Plus, ArrowRight, Store } from 'lucide-react';
import { SummoModal } from '../ui/summo/SummoModal';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownerName: string;
    businessName: string;
    onStartTour: () => void;
    onAddProduct: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
    isOpen, onClose, ownerName, businessName, onStartTour, onAddProduct
}) => {
    // Custom Header for the "Wow" effect
    const Header = (
        <div className="relative bg-gradient-to-br from-summo-primary via-orange-500 to-orange-600 p-8 text-center overflow-hidden -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-6">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-75" />
            </div>
            <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-lg animate-scale-in">
                    <Rocket size={40} className="text-white drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    Bem-vindo(a), {ownerName.split(' ')[0]}!
                </h2>
                <p className="text-white/90 text-lg font-medium">
                    O <strong>{businessName}</strong> está pronto para decolar 🚀
                </p>
            </div>
        </div>
    );

    return (
        <SummoModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="2xl"
        >
            {Header}

            <div className="text-center px-2 pb-4">
                <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                    Você deu o primeiro passo! O SUMMO já criou sua loja online e configurou seu painel.
                    <br /><br />
                    <span className="font-semibold text-summo-primary">O que você quer fazer agora?</span>
                </p>

                {/* Quick Actions Grid */}
                <div className="grid gap-4 md:grid-cols-1 max-w-lg mx-auto">

                    <button
                        onClick={onAddProduct}
                        className="w-full p-5 rounded-2xl border-2 border-summo-primary bg-summo-primary/5 hover:bg-summo-primary/10 transition-all group flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-1 bg-yellow-400 text-[10px] font-bold text-yellow-900 rounded-bl-lg shadow-sm">
                            RECOMENDADO
                        </div>
                        <div className="p-3.5 rounded-xl bg-summo-primary text-white shadow-orange-md group-hover:scale-110 transition-transform">
                            <Plus size={26} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-bold text-summo-text text-lg">Cadastrar 1º Produto</h3>
                            <p className="text-sm text-gray-600">Gera seu Cardápio Digital instantaneamente</p>
                        </div>
                        <ArrowRight size={22} className="text-summo-primary group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onStartTour}
                        className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-summo-primary/30 hover:bg-gray-50 transition-all group flex items-center gap-4"
                    >
                        <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-summo-primary group-hover:bg-summo-primary group-hover:text-white transition-colors">
                            <BookOpen size={26} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-bold text-summo-text text-lg">Tour Rápido (2 min)</h3>
                            <p className="text-sm text-gray-600">Aprenda a Vender e organizar a Cozinha</p>
                        </div>
                        <ArrowRight size={22} className="text-gray-300 group-hover:text-summo-primary group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-2 py-3 text-gray-400 hover:text-summo-primary text-sm font-medium transition-colors"
                    >
                        Pular introdução e ir para o painel
                    </button>
                </div>

                {/* Micro-learning / Value Prop */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400 opacity-80">
                    <div className="flex items-center gap-2">
                        <Store size={14} /> <span>Loja Online Pronta</span>
                    </div>
                </div>
            </div>
        </SummoModal>
    );
};
