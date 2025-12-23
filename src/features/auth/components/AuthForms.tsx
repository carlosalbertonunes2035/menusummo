
import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Loader2, Lock, Mail, Droplet, AlertCircle, ArrowRight, Store, UserPlus, LogIn, Phone, Building2, MapPin } from 'lucide-react';
import { fetchCNPJData, formatCNPJ, validateCNPJ, CNPJData } from '@/services/cnpjService';

const AuthForms: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Registration Steps: 1 = Basic Info, 2 = Company Details
    const [step, setStep] = useState(1);
    const [cnpjLoading, setCnpjLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');

    // Step 2 Data
    const [cnpj, setCnpj] = useState('');
    const [legalName, setLegalName] = useState('');
    const [address, setAddress] = useState({
        zip: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: ''
    });

    // Step 3 Data (Business Profile)
    const [segment, setSegment] = useState('Hamburgueria');
    const [monthlyRevenue, setMonthlyRevenue] = useState('Até R$ 10k');
    const [deliveryChannels, setDeliveryChannels] = useState({
        ownDelivery: false,
        ifood: false,
        rappi: false,
        aiqfome: false,
        others: false
    });
    const [digitalMenu, setDigitalMenu] = useState({
        hasOwn: false,
        platform: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                setError('Senha incorreta.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Usuário não encontrado.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Muitas tentativas. Tente novamente mais tarde.');
            } else {
                setError('Erro ao processar login. Verifique os dados.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (!ownerName || !businessName || !email || !phone) {
                setError('Preencha todos os campos obrigatórios.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
            setStep(3);
        }
    };

    const handleCNPJBlur = async () => {
        if (!cnpj || cnpj.length < 14) return;

        // Basic offline validation first
        if (!validateCNPJ(cnpj)) {
            // setError('CNPJ inválido (verifique os dígitos)');
            // Don't block, just warn? Or block? Let's verify online first.
        }

        setCnpjLoading(true);
        try {
            const data = await fetchCNPJData(cnpj);
            if (data) {
                setLegalName(data.nome); // Razão Social
                // If business name was empty or generic, maybe update it? 
                // businessName is "Nome Fantasia" (data.fantasia), usually prefer user input for this in Step 1, but we can display the fetched one.

                setAddress({
                    zip: data.cep,
                    street: data.logradouro,
                    number: data.numero,
                    neighborhood: data.bairro,
                    city: data.municipio,
                    state: data.uf,
                    complement: data.complemento
                });
                setError('');
            }
        } catch (err) {
            console.warn("CNPJ lookup failed", err);
            // Don't block flow, user can type manually
        } finally {
            setCnpjLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signUp({
                email,
                password,
                businessName,
                ownerName,
                phone,
                legalName: legalName || businessName,
                cnpj,
                address,
                segment,
                monthlyRevenue,
                deliveryChannels,
                digitalMenu,
                serviceTypes: ['delivery', 'takeaway'] // Default, can be enhanced
            });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                setError('Erro ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleChannel = (channel: keyof typeof deliveryChannels) => {
        setDeliveryChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-y-auto font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-summo-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-summo-primary/5 blur-[120px] rounded-full"></div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in relative z-10 border border-gray-100 my-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-summo-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-summo-primary/40 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Droplet size={32} fill="currentColor" className="drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-summo-text tracking-tighter mb-1">SUMMO</h2>
                    <p className="text-summo-text-muted font-medium text-xs italic">"Extraia o máximo do seu negócio"</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                    <button
                        onClick={() => { setIsLogin(true); setStep(1); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-summo-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LogIn size={18} /> Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setStep(1); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-summo-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UserPlus size={18} /> Novo Negócio
                    </button>
                </div>

                {/* LOGIN FORM */}
                {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="animate-slide-in-up">
                            <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-summo-primary/10 focus:border-summo-primary outline-none transition-all font-medium text-summo-text placeholder-gray-400"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                            <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-summo-primary/10 focus:border-summo-primary outline-none transition-all font-medium text-summo-text placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium flex items-center gap-3 animate-slide-in-up">
                                <AlertCircle size={20} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-summo-primary text-white py-4 rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-summo-primary/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={20} /></>}
                        </button>
                    </form>
                ) : (
                    /* REGISTRATION FORM */
                    <form onSubmit={step === 3 ? handleRegister : handleNextStep} className="space-y-4">

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-4 animate-slide-in-up">
                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Seu Nome Completo</label>
                                    <div className="relative">
                                        <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none" placeholder="Ex: João Silva" required autoFocus />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Nome do Negócio (Fantasia)</label>
                                    <div className="relative">
                                        <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none" placeholder="Ex: Hamburgueria do João" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">WhatsApp / Contato</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none" placeholder="(00) 00000-0000" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Email de Acesso</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none" placeholder="email@exemplo.com" required />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-summo-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex justify-center items-center gap-2 mt-2">
                                    Continuar <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: COMPANY DETAILS & PASS */}
                        {step === 2 && (
                            <div className="space-y-4 animate-slide-in-up">
                                <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start gap-2 border border-blue-100">
                                    <Building2 size={16} className="mt-0.5" />
                                    <div>
                                        <strong>Confiança é tudo.</strong> Insira o CNPJ para preenchermos os dados da sua empresa automaticamente.
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">CNPJ (Opcional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formatCNPJ(cnpj)}
                                            onChange={e => setCnpj(e.target.value)}
                                            onBlur={handleCNPJBlur}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none font-mono text-sm"
                                            placeholder="00.000.000/0000-00"
                                        />
                                        {cnpjLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-summo-primary animate-spin" />}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Endereço da Loja</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={address.street ? `${address.street}, ${address.number} - ${address.neighborhood}` : ''}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                                            placeholder="Preenchido via CNPJ ou deixe em branco"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">* Você poderá editar isso nas configurações depois.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Crie sua Senha</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none"
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-summo-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-summo-primary/20 flex justify-center items-center gap-2 text-sm"
                                    >
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: BUSINESS PROFILE */}
                        {step === 3 && (
                            <div className="space-y-4 animate-slide-in-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Ramo de Atividade</label>
                                        <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none text-sm appearance-none">
                                            <option value="Hamburgueria">Hamburgueria</option>
                                            <option value="Pizzaria">Pizzaria</option>
                                            <option value="Acaiteira">Açaiteria</option>
                                            <option value="Japonesa">Japonesa</option>
                                            <option value="Brasileira">Brasileira</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-1 ml-1 tracking-wider">Faturamento</label>
                                        <select value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none text-sm appearance-none">
                                            <option value="Até R$ 10k">Até R$ 10k</option>
                                            <option value="R$ 10k - R$ 30k">R$ 10k - R$ 30k</option>
                                            <option value="R$ 30k - R$ 100k">R$ 30k - R$ 100k</option>
                                            <option value="Acima de R$ 100k">Acima de R$ 100k</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Onde você vende hoje?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => toggleChannel('ownDelivery')} className={`p-3 rounded-xl border text-sm font-medium transition-all ${deliveryChannels.ownDelivery ? 'border-summo-primary bg-summo-primary/5 text-summo-primary' : 'border-gray-200 hover:bg-gray-50'}`}>Entrega Própria</button>
                                        <button type="button" onClick={() => toggleChannel('ifood')} className={`p-3 rounded-xl border text-sm font-medium transition-all ${deliveryChannels.ifood ? 'border-[#EA1D2C] bg-[#EA1D2C]/5 text-[#EA1D2C]' : 'border-gray-200 hover:bg-gray-50'}`}>iFood</button>
                                        <button type="button" onClick={() => toggleChannel('rappi')} className={`p-3 rounded-xl border text-sm font-medium transition-all ${deliveryChannels.rappi ? 'border-[#FF4C47] bg-[#FF4C47]/5 text-[#FF4C47]' : 'border-gray-200 hover:bg-gray-50'}`}>Rappi</button>
                                        <button type="button" onClick={() => toggleChannel('aiqfome')} className={`p-3 rounded-xl border text-sm font-medium transition-all ${deliveryChannels.aiqfome ? 'border-[#791E92] bg-[#791E92]/5 text-[#791E92]' : 'border-gray-200 hover:bg-gray-50'}`}>Aiqfome</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider flex items-center justify-between">
                                        <span>Possui Cardápio Digital?</span>
                                        <button type="button" onClick={() => setDigitalMenu(prev => ({ ...prev, hasOwn: !prev.hasOwn }))} className={`w-10 h-5 rounded-full relative transition-colors ${digitalMenu.hasOwn ? 'bg-summo-primary' : 'bg-gray-300'}`}>
                                            <span className={`content-[''] absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${digitalMenu.hasOwn ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </label>

                                    {digitalMenu.hasOwn && (
                                        <div className="animate-fade-in mt-2">
                                            <input
                                                type="text"
                                                value={digitalMenu.platform || ''}
                                                onChange={e => setDigitalMenu(prev => ({ ...prev, platform: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-summo-primary outline-none text-sm"
                                                placeholder="Qual plataforma? (Ex: Goomer, AnotaAI...)"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-summo-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-summo-primary/20 flex justify-center items-center gap-2 text-sm"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Finalizar e Lucrar'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium flex items-center gap-2 animate-slide-in-up">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/10 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none select-none whitespace-nowrap">
                SUMMO OS • MAXIMIZING PROFIT
            </div>
        </div>
    );
};

export default AuthForms;
