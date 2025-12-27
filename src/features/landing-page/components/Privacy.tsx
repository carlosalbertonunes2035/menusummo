
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Helmet>
                <title>Política de Privacidade | SUMMO</title>
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
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidade</h1>
                    <p className="text-gray-500 mb-10">Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

                    <div className="prose prose-orange max-w-none space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Controlador dos Dados</h3>
                            <p className="leading-relaxed text-gray-600">
                                O controlador dos seus dados pessoais é a <strong>SUMMO TECNOLOGIA E GESTAO INOVA SIMPLES (I.S.)</strong> (CNPJ 64.162.119/0001-43).
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Dados Coletados</h3>
                            <p className="leading-relaxed text-gray-600 mb-4">Coletamos os seguintes dados para operação do sistema:</p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                <li><strong>Dados de Identificação:</strong> Nome, CPF/CNPJ, E-mail, Telefone.</li>
                                <li><strong>Dados Financeiros:</strong> Histórico de vendas, custos e despesas (para geração de relatórios).</li>
                                <li><strong>Dados de Clientes Finais:</strong> Nome e telefone dos clientes do seu restaurante (processados em seu nome).</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Finalidade do Tratamento</h3>
                            <p className="leading-relaxed text-gray-600">
                                Utilizamos seus dados para:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
                                <li>Prestação dos serviços contratados (gestão de pedidos, DRE, etc).</li>
                                <li>Comunicação sobre atualizações, suporte técnico e novidades.</li>
                                <li>Cumprimento de obrigações legais e fiscais.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Compartilhamento de Dados</h3>
                            <p className="leading-relaxed text-gray-600">
                                Não vendemos seus dados. O compartilhamento ocorre apenas com parceiros essenciais para a operação (ex: gateways de pagamento, servidores de hospedagem), sempre exigindo conformidade com a LGPD.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">5. Segurança</h3>
                            <p className="leading-relaxed text-gray-600">
                                Adotamos medidas técnicas robustas (criptografia, controle de acesso) para proteger seus dados.
                                Recomendamos também que utilize senhas fortes e autenticação de dois fatores.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">6. Seus Direitos</h3>
                            <p className="leading-relaxed text-gray-600">
                                Você tem o direito de solicitar: acesso aos dados, correção, anonimização, bloqueio ou eliminação de dados desnecessários.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">7. Fale Conosco</h3>
                            <p className="leading-relaxed text-gray-600">
                                Para exercer seus direitos ou tirar dúvidas, entre em contato pelo e-mail: <strong>privacidade@menusummo.com.br</strong> ou pelo nosso painel de suporte.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
