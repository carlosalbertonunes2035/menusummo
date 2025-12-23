
import React from 'react';
import { ArrowRight, BarChart3, TrendingUp, HandCoins, ChefHat, LayoutDashboard, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-summo-bg font-sans selection:bg-summo-primary selection:text-white">
            <Helmet>
                <title>SUMMO | Sistema de Gestão para Restaurantes e Delivery</title>
                <meta name="description" content="Pare de trabalhar pelo prejuízo. O SUMMO extrai o máximo de lucro do seu restaurante com inteligência financeira, cardápio digital e gestão de custos." />
                <meta name="keywords" content="sistema restaurante, gestão financeira, delivery, cardápio digital, kds, pdv, automação comercial, summo" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://summo.app/" />
                <meta property="og:title" content="SUMMO | Extraia o Máximo de Lucro" />
                <meta property="og:description" content="Sistema de gestão completo com inteligência financeira para restaurantes. Teste grátis." />
                <meta property="og:image" content="https://summo.app/assets/cover-social.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://summo.app/" />
                <meta property="twitter:title" content="SUMMO | Gestão de Lucro" />
                <meta property="twitter:description" content="Pare de trabalhar pelo prejuízo. Extraia o lucro real do seu negócio." />
                <meta property="twitter:image" content="https://summo.app/assets/cover-social.png" />
            </Helmet>

            {/* Header / Nav */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-summo-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-summo-primary p-2 rounded-lg">
                            <span className="text-white font-display font-bold text-xl tracking-tighter">SUMMO</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-summo-text-muted">
                        <a href="#solucao" className="hover:text-summo-primary transition-colors">Solução</a>
                        <a href="#funcionalidades" className="hover:text-summo-primary transition-colors">Funcionalidades</a>
                        <a href="#sobre" className="hover:text-summo-primary transition-colors">Manifesto</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/app/launchpad" className="text-sm font-bold text-summo-text hover:text-summo-primary transition-colors px-4 py-2">Acessar App</Link>
                        <Link to="/app/launchpad" className="bg-summo-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-summo-primary/20 hover:scale-105 transition-transform">Extrair Lucro Agora</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-summo-primary/10 border border-summo-primary/20 text-summo-primary text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> Inteligência Financeira
                        </div>
                        <h1 className="text-6xl md:text-7xl font-display font-bold text-summo-text leading-[1.1] mb-8">
                            Extraia o <span className="text-summo-primary">Máximo</span> de Lucro.
                        </h1>
                        <p className="text-xl text-summo-text-muted leading-relaxed mb-10 max-w-lg">
                            Pare de trabalhar pelo prejuízo. O SUMMO é a prensa que espreme os custos invisíveis do seu restaurante e entrega o lucro real no seu bolso.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/app/launchpad" className="flex items-center justify-center gap-2 bg-summo-primary text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-summo-primary/20 hover:bg-orange-600 transition-colors">
                                Começar Gratuitamente <ArrowRight size={20} />
                            </Link>
                            <a href="#solucao" className="flex items-center justify-center gap-2 bg-white text-summo-text text-lg font-bold px-8 py-4 rounded-2xl border border-summo-border hover:bg-gray-50 transition-colors">
                                Ver como funciona
                            </a>
                        </div>
                        <p className="mt-6 text-sm text-summo-text-muted italic flex items-center gap-2">
                            ✓  Não deixe seu negócio virar só bagaço.
                        </p>
                    </div>

                    <div className="relative animate-slide-in-right lg:block hidden">
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-summo-primary/10 rounded-full blur-3xl"></div>
                        <div className="relative bg-white p-8 rounded-[40px] shadow-2xl border border-summo-border overflow-hidden group">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-xs font-bold text-summo-text-muted uppercase tracking-widest">Lucro Extraído de Hoje</p>
                                    <h3 className="text-3xl font-display font-bold text-summo-text">R$ 4.280,00</h3>
                                </div>
                                <div className="p-3 bg-summo-secondary/10 rounded-2xl text-summo-secondary">
                                    <TrendingUp size={32} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-4 bg-gray-100 rounded-full w-full overflow-hidden">
                                    <div className="h-full bg-summo-primary w-[75%]"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-summo-bg rounded-2xl border border-summo-border">
                                        <p className="text-[10px] font-bold text-summo-text-muted uppercase">Eficiência</p>
                                        <p className="text-lg font-display font-bold text-summo-secondary">+28%</p>
                                    </div>
                                    <div className="p-4 bg-summo-bg rounded-2xl border border-summo-border">
                                        <p className="text-[10px] font-bold text-summo-text-muted uppercase">Desperdício</p>
                                        <p className="text-lg font-display font-bold text-red-500">-12%</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-summo-text rounded-3xl text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ChefHat size={18} className="text-summo-primary" />
                                        <p className="text-xs font-medium opacity-80 italic">Ação recomendada pela IA:</p>
                                    </div>
                                    <p className="text-sm leading-relaxed">"O custo do insumo **Alcatra** subiu 15%. Recomendo atualizar a ficha técnica do espetinho agora para manter a margem de 35%."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem / Pain Section */}
            <section id="solucao" className="py-24 bg-summo-text text-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                            Você trabalha o dia todo e, no fim, só fica com o <span className="text-summo-primary">bagaço?</span>
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            Muitos sistemas de gestão são apenas repositórios de dados. Eles mostram o que aconteceu, mas não dizem o que fazer. O SUMMO inverte a lógica.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-summo-primary/50 transition-all group">
                            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <HandCoins size={24} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Taxas Abusivas</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                iFood e Adquirentes comem sua margem em silêncio. Nós calculamos o impacto real em cada venda.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-summo-primary/50 transition-all group">
                            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 size={24} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Precificação Cega</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Se você não conhece o custo de cada gota de óleo, você está trabalhando para pagar o fornecedor.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-summo-primary/50 transition-all group">
                            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <HandCoins size={24} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Gestão Exaustiva</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Menos relatórios confusos, mais ações diretas. A IA do SUMMO pensa por você.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section id="funcionalidades" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl font-display font-bold text-summo-text mb-6">A prensa do lucro.</h2>
                        <p className="text-summo-text-muted">Tudo o que você precisa para extrair o máximo de cada prato.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-4">
                            {[
                                { title: "PDV Inteligente e Rápido", desc: "Venda em segundos, controle em detalhes. Feito para escala." },
                                { title: "Engenharia de Cardápio", desc: "Saiba quais produtos são estrelas e quais estão drenando seu capital." },
                                { title: "Custo de Insumos em Tempo Real", desc: "Integração automática para recalcular margens conforme os preços variam." },
                                { title: "Cozinha (KDS) Sem Fios", desc: "Organize seus pedidos por ordem de prioridade e tempo de preparo." },
                                { title: "Gestão Multiloja", desc: "Controle todas as suas unidades em uma única tela de gestão." }
                            ].map((f, i) => (
                                <div key={i} className="p-6 rounded-2xl border border-summo-border hover:bg-summo-bg transition-colors flex gap-5">
                                    <div className="mt-1 text-summo-primary">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-lg text-summo-text mb-1">{f.title}</h5>
                                        <p className="text-summo-text-muted text-sm leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-summo-primary/20 blur-[100px] rounded-full"></div>
                            <div className="relative bg-summo-bg rounded-[40px] p-2 border border-summo-border shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                                <LayoutDashboard className="w-1/2 h-1/2 text-summo-primary/20 absolute opacity-50" />
                                <div className="relative z-10 w-full p-8 text-center">
                                    <h4 className="text-3xl font-display font-bold text-summo-text mb-6">Pronto para ver a diferença?</h4>
                                    <Link to="/app/launchpad" className="inline-flex items-center gap-2 bg-summo-primary text-white font-bold px-10 py-5 rounded-3xl shadow-2xl shadow-summo-primary/40 hover:scale-105 transition-transform">
                                        Explorar a Plataforma <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-summo-bg border-t border-summo-border">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-summo-primary font-display font-bold text-3xl tracking-tighter mb-6 block">SUMMO</span>
                        <p className="text-summo-text-muted max-w-md leading-relaxed">
                            Extraímos a clareza do caos tributário e operacional. Gestão inteligente para quem cansou de ficar só com o bagaço.
                        </p>
                    </div>
                    <div>
                        <h6 className="font-bold text-summo-text mb-6">Plataforma</h6>
                        <ul className="space-y-4 text-sm text-summo-text-muted">
                            <li><a href="#" className="hover:text-summo-primary">Funcionalidades</a></li>
                            <li><a href="#" className="hover:text-summo-primary">Preços</a></li>
                            <li><a href="#" className="hover:text-summo-primary">Integrações</a></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="font-bold text-summo-text mb-6">Empresa</h6>
                        <ul className="space-y-4 text-sm text-summo-text-muted">
                            <li><a href="#" className="hover:text-summo-primary">Sobre nós</a></li>
                            <li><a href="#" className="hover:text-summo-primary">Manifesto</a></li>
                            <li><a href="#" className="hover:text-summo-primary">Contato</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-summo-border flex flex-col md:row items-center justify-between gap-6">
                    <p className="text-xs text-summo-text-muted">© 2024 SUMMO Enterprise. Todos os direitos reservados.</p>
                    <div className="flex gap-6 text-xs text-summo-text-muted underline decoration-gray-300 underline-offset-4">
                        <a href="#">Privacidade</a>
                        <a href="#">Termos</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
