
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ChevronRight, CheckCircle2, Star,
    Zap, TrendingUp, Smartphone, MessageCircle,
    Menu, X, Laptop, ShieldCheck, Mail, Phone, MapPin,
    Instagram, Facebook, Youtube, Play, ArrowRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600 overflow-x-hidden">
            <Helmet>
                <title>SUMMO | Sistema de Gestão e Delivery Próprio para Restaurantes</title>
                <meta name="description" content="Tenha seu próprio aplicativo de delivery, cardápio digital e sistema de gestão completo. Fuja das taxas e fidelize seu cliente." />
            </Helmet>

            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">S</div>
                        <span className="font-extrabold text-2xl tracking-tight text-slate-900">SUMMO</span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-600 text-sm">
                        <a href="#solucoes" className="hover:text-orange-600 transition-colors">Soluções</a>
                        <a href="#funcionalidades" className="hover:text-orange-600 transition-colors">Funcionalidades</a>
                        <a href="#planos" className="hover:text-orange-600 transition-colors">Planos</a>
                        <a href="#depoimentos" className="hover:text-orange-600 transition-colors">Depoimentos</a>
                    </nav>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/app/launchpad" className="text-sm font-bold text-slate-600 hover:text-orange-600">Entrar</Link>
                        <Link to="/app/launchpad" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all">
                            Experimentar Grátis
                        </Link>
                    </div>

                    <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-4 shadow-xl absolute w-full animate-fade-in-down">
                        <a href="#solucoes" className="font-medium text-slate-600 py-2 border-b border-gray-50">Soluções</a>
                        <a href="#funcionalidades" className="font-medium text-slate-600 py-2 border-b border-gray-50">Funcionalidades</a>
                        <a href="#planos" className="font-medium text-slate-600 py-2 border-b border-gray-50">Planos</a>
                        <Link to="/app/launchpad" className="bg-orange-600 text-white text-center py-3 rounded-xl font-bold">Começar Agora</Link>
                    </div>
                )}
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-orange-50/80 via-white to-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 animate-fade-in-up relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-widest">
                            <Star size={12} className="fill-orange-700" /> A plataforma completa
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight text-slate-900">
                            Venda mais. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Pague menos.</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                            Tenha seu próprio aplicativo de delivery e site de pedidos.
                            Livre-se das taxas abusivas dos marketplaces e assuma o controle do seu lucro.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/app/launchpad" className="flex items-center justify-center gap-3 bg-orange-600 text-white text-lg font-bold px-8 py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30 hover:scale-[1.02]">
                                Criar Loja Grátis <ArrowRight size={20} />
                            </Link>
                            <button className="flex items-center justify-center gap-3 bg-white text-slate-700 text-lg font-bold px-8 py-4 rounded-2xl border-2 border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-colors">
                                <Play size={20} className="fill-slate-700" /> Ver Vídeo
                            </button>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Setup em 2 minutos</span>
                            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Sem fidelidade</span>
                        </div>
                    </div>

                    {/* HERO MOCKUP (CSS Composition) */}
                    <div className="relative perspective-1000 lg:h-[600px] flex items-center justify-center">
                        {/* Background Blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-400/20 to-purple-400/20 rounded-full blur-[100px]"></div>

                        {/* Laptop Mockup */}
                        <div className="relative w-[340px] md:w-[600px] bg-slate-900 rounded-2xl p-2 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-all duration-700 z-10 border border-slate-800">
                            <div className="bg-slate-800 rounded-t-xl h-6 flex items-center px-4 gap-1.5 border-b border-slate-700">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="bg-slate-900 aspect-video rounded-b-xl overflow-hidden relative group">
                                {/* Fake Dashboard UI */}
                                <div className="absolute inset-0 bg-slate-50 flex">
                                    <div className="w-16 bg-slate-900 h-full flex flex-col items-center pt-4 gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-600"></div>
                                        <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                                        <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                                    </div>
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="h-6 w-32 bg-slate-200 rounded"></div>
                                            <div className="h-8 w-8 rounded-full bg-slate-300"></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="h-24 bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                                                <div className="h-8 w-8 rounded-full bg-green-100 mb-2"></div>
                                                <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 mb-2"></div>
                                                <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 mb-2"></div>
                                                <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Mockup (Floating) */}
                        <div className="absolute -right-4 -bottom-10 w-[140px] h-[280px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl z-20 transform rotate-[10deg] animate-float">
                            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                                <div className="bg-orange-600 h-24 p-4 flex items-end pb-2">
                                    <div className="h-4 w-20 bg-white/30 rounded"></div>
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="h-20 bg-white shadow-md rounded-xl p-2 flex gap-2">
                                        <div className="h-14 w-14 bg-slate-200 rounded-lg"></div>
                                        <div className="flex-1 space-y-1">
                                            <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                            <div className="h-2 w-10 bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-20 bg-white shadow-md rounded-xl p-2 flex gap-2">
                                        <div className="h-14 w-14 bg-slate-200 rounded-lg"></div>
                                    </div>
                                </div>
                                {/* Floating Order Notification */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur shadow-lg rounded-lg p-2 text-[10px] flex items-center gap-2 animate-bounce-slow">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Novo Pedido #192
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SOCIAL PROOF --- */}
            <section id="depoimentos" className="py-12 border-y border-gray-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Confiado por grandes operações</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos */}
                        <div className="h-8 w-32 bg-slate-300 rounded"></div>
                        <div className="h-8 w-32 bg-slate-300 rounded"></div>
                        <div className="h-8 w-32 bg-slate-300 rounded"></div>
                        <div className="h-8 w-32 bg-slate-300 rounded"></div>
                    </div>
                </div>
            </section>

            {/* --- SOLUTIONS GRID --- */}
            <section id="solucoes" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-orange-600 font-bold tracking-widest uppercase text-sm">Sua operação unificada</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mt-2 mb-4">Tudo que você precisa em um só lugar.</h2>
                        <p className="text-lg text-slate-500">Substitua 5 ferramentas diferentes pelo SUMMO. Economize tempo e dinheiro.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="text-orange-600" />}
                            title="App Delivery Próprio"
                            desc="Android e iOS com sua marca. Notificações Push ilimitadas e zero taxas por pedido."
                        />
                        <FeatureCard
                            icon={<Zap className="text-yellow-500" />}
                            title="Cardápio Digital QR"
                            desc="Para mesas e balcão. O cliente pede pelo celular e o pedido sai direto na cozinha."
                        />
                        <FeatureCard
                            icon={<Laptop className="text-blue-600" />}
                            title="Frente de Caixa (PDV)"
                            desc="Sistema PDV rápido, integrado com iFood e impressoras térmicas."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-green-600" />}
                            title="Gestão Financeira"
                            desc="DRE automático, contas a pagar/receber e controle de fluxo de caixa."
                        />
                        <FeatureCard
                            icon={<MessageCircle className="text-purple-600" />}
                            title="Robô de Vendas (WhatsApp)"
                            desc="Atendimento automático no Zap. Esqueça ficar respondendo 'qual o cardápio?'."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-slate-600" />}
                            title="Estoque & Ficha Técnica"
                            desc="Baixa automática de ingredientes conforme as vendas. Controle total do CMV."
                        />
                    </div>
                </div>
            </section>

            {/* --- CTA STRIPE --- */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/10 skew-x-12 translate-x-32"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-6">Pronto para dominar seu delivery?</h2>
                    <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                        Junte-se a centenas de restaurantes que aumentaram seu lucro em até 30% saindo da dependência exclusiva dos marketplaces.
                    </p>
                    <Link to="/app/launchpad" className="bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-500 transition-colors shadow-2xl shadow-orange-900/50">
                        Quero meu Teste Grátis
                    </Link>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                            <span className="font-extrabold text-xl text-slate-900">SUMMO</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Tecnologia de ponta para food service. Simplificamos a gestão para você focar no que importa: a comida.
                        </p>
                        <div className="flex gap-4 opacity-70">
                            <Instagram className="cursor-pointer hover:text-orange-600 transition-colors" />
                            <Facebook className="cursor-pointer hover:text-orange-600 transition-colors" />
                            <Youtube className="cursor-pointer hover:text-orange-600 transition-colors" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Produto</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-orange-600">Cardápio Digital</a></li>
                            <li><a href="#" className="hover:text-orange-600">Gestão de Pedidos</a></li>
                            <li><a href="#" className="hover:text-orange-600">Sistema Financeiro</a></li>
                            <li><a href="#" className="hover:text-orange-600">Integração iFood</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Institucional</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-orange-600">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-orange-600">Carreiras</a></li>
                            <li><Link to="/terms" className="hover:text-orange-600">Termos de Uso</Link></li>
                            <li><Link to="/privacy" className="hover:text-orange-600">Política de Privacidade</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Contato</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li className="flex items-center gap-2"><Mail size={16} /> contato@menusummo.com.br</li>
                            <li className="flex items-center gap-2"><Phone size={16} /> (17) 99123-4567</li>
                            <li className="flex items-center gap-2"><MapPin size={16} /> São José do Rio Preto, SP</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
                    <p>&copy; 2025 SUMMO TECNOLOGIA INOVA SIMPLES. CNPJ 64.162.119/0001-43</p>
                    <p>Feito com ❤️ para o Food Service.</p>
                </div>
            </footer>
        </div>
    );
};

// --- SUB COMPONENTS ---

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 group cursor-default">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
);

export default LandingPage;
