
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Helmet>
                <title>Termos de Uso | SUMMO</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <span className="font-bold text-lg text-gray-900">Voltar para Início</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Termos de Uso</h1>
                    <p className="text-gray-500 mb-10">Última atualização: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-orange max-w-none space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Identificação</h3>
                            <p className="leading-relaxed text-gray-600">
                                Este serviço é oferecido por <strong>SUMMO TECNOLOGIA E GESTAO INOVA SIMPLES (I.S.)</strong>,
                                inscrita no CNPJ sob o nº <strong>64.162.119/0001-43</strong>, com sede em São José do Rio Preto, SP.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">2. O Serviço</h3>
                            <p className="leading-relaxed text-gray-600">
                                O SUMMO é uma plataforma SaaS (Software as a Service) de gestão e inteligência para restaurantes.
                                O serviço inclui, mas não se limita a: cardápio digital, gestão de pedidos, controle financeiro e ferramentas de marketing.
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
                                <li>A licença de uso é revogável, não exclusiva e intransferível.</li>
                                <li>O software é fornecido "como está" (as is), sujeito a atualizações contínuas.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Responsabilidades do Usuário</h3>
                            <p className="leading-relaxed text-gray-600">
                                Ao utilizar a plataforma, o usuário declara ser responsável pela veracidade das informações inseridas (preços, produtos, dados fiscais).
                                O SUMMO não se responsabiliza por erros operacionais causados por dados incorretos inseridos pelo estabelecimento.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Planos e Pagamentos</h3>
                            <p className="leading-relaxed text-gray-600">
                                O uso da plataforma pode estar sujeito a cobranças mensais ou anuais conforme o plano escolhido.
                                O atraso no pagamento poderá resultar na suspensão temporária do acesso aos serviços até a regularização.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">5. Propriedade Intelectual</h3>
                            <p className="leading-relaxed text-gray-600">
                                Todos os direitos sobre o código-fonte, marca, design e tecnologia do SUMMO são de propriedade exclusiva da SUMMO TECNOLOGIA.
                                É vedada a cópia, engenharia reversa ou distribuição não autorizada do software.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">6. Cancelamento</h3>
                            <p className="leading-relaxed text-gray-600">
                                O usuário pode cancelar sua assinatura a qualquer momento através do painel de controle.
                                Não há multa rescisória, exceto em contratos com fidelidade explícita acordada previamente.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">7. Disposições Finais</h3>
                            <p className="leading-relaxed text-gray-600">
                                Estes termos podem ser atualizados a qualquer momento. O foro eleito para dirimir quaisquer dúvidas é a Comarca de São José do Rio Preto - SP.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Terms;
