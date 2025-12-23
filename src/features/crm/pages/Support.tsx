
import React, { memo } from 'react';
import { LifeBuoy, MessageCircle, Book, ShieldCheck, Mail, ExternalLink, PlayCircle, HelpCircle } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';

const Support: React.FC = () => {
    const { settings } = useApp();

    const handleWhatsAppSupport = () => {
        const msg = "Olá! 👋 Sou parceiro SUMMO e preciso de suporte com minha loja.";
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const faqItems = [
        {
            q: "Como integrar com iFood?",
            a: "Vá em Ajustes > Integrações e insira suas credenciais de parceiro iFood."
        },
        {
            q: "Como mudar o preço dos produtos?",
            a: "No módulo 'Cardápio', você pode editar cada produto e definir preços por canal (PDV, Site, iFood)."
        },
        {
            q: "Como cadastrar entregadores?",
            a: "Acesse o módulo 'Logística' para gerenciar sua frota e acompanhar rotas."
        }
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50/50 animate-fade-in custom-scrollbar overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-sky-600 to-blue-800 text-white p-8 lg:p-12 relative overflow-hidden flex-shrink-0">
                <div className="absolute right-0 top-0 p-8 opacity-10 -rotate-12 translate-x-12">
                    <LifeBuoy size={240} />
                </div>
                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl lg:text-5xl font-black mb-4">Central de Ajuda 🛟</h1>
                        <p className="text-sky-100 text-lg font-medium opacity-90 max-w-xl">
                            Estamos aqui para garantir que sua operação nunca pare. Escolha a melhor forma de falar conosco.
                        </p>
                    </div>

                    <button
                        onClick={handleWhatsAppSupport}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                    >
                        <MessageCircle size={28} />
                        Falar no WhatsApp
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 lg:p-12 w-full space-y-12">
                {/* Knowledge Base Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Book className="text-sky-500" /> Base de Conhecimento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                            <div className="bg-sky-50 p-3 rounded-2xl text-sky-600 w-fit mb-4 group-hover:scale-110 transition-transform">
                                <PlayCircle size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">Vídeos Tutoriais</h3>
                            <p className="text-sm text-gray-500">Aprenda visualmente como dominar cada módulo do sistema.</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 w-fit mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">Segurança e Dados</h3>
                            <p className="text-sm text-gray-500">Entenda como seus dados estão protegidos e isolados.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                        <HelpCircle className="text-amber-500" /> Perguntas Frequentes (FAQ)
                    </h2>
                    <div className="space-y-6">
                        {faqItems.map((item, i) => (
                            <div key={i} className="group border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                <p className="font-bold text-gray-800 mb-2">{item.q}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Channels */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-gray-900 text-white p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-3 rounded-2xl text-white"><Mail size={24} /></div>
                            <div>
                                <p className="font-bold">E-mail</p>
                                <p className="text-xs text-gray-400">suporte@summo.com.br</p>
                            </div>
                        </div>
                        <ExternalLink size={20} className="text-gray-600" />
                    </div>

                    <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-sky-50 p-3 rounded-2xl text-sky-600"><ShieldCheck size={24} /></div>
                            <div>
                                <p className="font-bold text-gray-800">Status do Sistema</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-xs text-green-600 font-bold uppercase">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs pb-8">
                    SUMMO Technology © 2025 - Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default memo(Support);
