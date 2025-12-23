import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, Mail, Droplet, AlertCircle, ArrowRight, ChevronDown, MapPin, Truck, ShoppingBag, Utensils, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
    const { signIn, signUp } = useAuth();
    // Pre-fill
    const [email, setEmail] = useState('jcespetariadelivery@gmail.com');
    const [password, setPassword] = useState('Jcespetariadelivery@2025');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Registration State
    const [isRegistering, setIsRegistering] = useState(false);
    const [regStep, setRegStep] = useState(1);
    const [regData, setRegData] = useState({
        ownerName: '', cpf: '', email: '', phone: '', password: '', confirmPassword: '',
        businessName: '', legalName: '', cnpj: '',
        zip: '', street: '', number: '', neighborhood: '', city: 'São Paulo', state: 'SP', complement: '',
        segment: 'Hamburgueria', serviceTypes: ['delivery'] as string[]
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/wrong-password') setError('Senha incorreta.');
            else if (err.code === 'auth/too-many-requests') setError('Muitas tentativas. Tente novamente mais tarde.');
            else setError('Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (regData.password !== regData.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await signUp({
                ownerName: regData.ownerName,
                email: regData.email,
                phone: regData.phone,
                password: regData.password,
                businessName: regData.businessName,
                legalName: regData.legalName,
                cnpj: regData.cnpj,
                address: {
                    zip: regData.zip,
                    street: regData.street,
                    number: regData.number,
                    neighborhood: regData.neighborhood,
                    city: regData.city,
                    state: regData.state,
                    complement: regData.complement
                },
                segment: regData.segment,
                serviceTypes: regData.serviceTypes
            });
            // Auto close on success (AuthContext usually redirects or user is logged in)
            setIsRegistering(false);
        } catch (err: any) {
            console.error(err);
            setError("Erro ao criar conta: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setRegStep(p => p + 1);
    const prevStep = () => setRegStep(p => p - 1);

    // Render Registration Wizard
    if (isRegistering) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-y-auto">
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-fade-in my-10 relative">
                    <button onClick={() => setIsRegistering(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Loader2 size={24} className={loading ? "animate-spin" : "opacity-0"} /><span className={loading ? "hidden" : ""}>✕</span></button>

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-gray-900">Novo Negócio</h2>
                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`h-2 w-16 rounded-full transition-colors ${regStep >= s ? 'bg-summo-primary' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                        <p className="text-sm font-bold text-summo-primary mt-2 uppercase">Passo {regStep} de 3: {regStep === 1 ? 'Responsável' : regStep === 2 ? 'Empresa' : 'Operação'}</p>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold"><AlertCircle size={16} /> {error}</div>}

                    {regStep === 1 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">Resumo do Responsável</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                                <input type="text" value={regData.ownerName} onChange={e => setRegData({ ...regData, ownerName: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="Ex: João da Silva" autoFocus />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">CPF</label>
                                    <input type="text" value={regData.cpf} onChange={e => setRegData({ ...regData, cpf: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="000.000.000-00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Celular / WhatsApp</label>
                                    <input type="text" value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="(11) 99999-9999" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email de Login</label>
                                <input type="email" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="seu@email.com" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label>
                                    <div className="relative group">
                                        <input type="password" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} className="w-full p-3.5 pl-10 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="••••••••" />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary"><Lock size={18} /></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirmar Senha</label>
                                    <div className="relative group">
                                        <input type="password" value={regData.confirmPassword} onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })} className="w-full p-3.5 pl-10 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="••••••••" />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary"><Lock size={18} /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button onClick={nextStep} disabled={!regData.ownerName || !regData.email || !regData.password || regData.password !== regData.confirmPassword} className="w-full py-4 bg-gray-900 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-black hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                                    Próximo Passo <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {regStep === 2 && (
                        <div className="space-y-5 animate-slide-in-right">
                            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">Sobre o Negócio</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Fantasia / Nome da Loja</label>
                                <input type="text" value={regData.businessName} onChange={e => setRegData({ ...regData, businessName: e.target.value })} className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl focus:border-summo-primary focus:ring-4 focus:ring-summo-primary/10 outline-none transition-all font-bold text-xl text-gray-900 placeholder-gray-300" placeholder="Ex: Burger King da Esquina" autoFocus />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">CNPJ <span className="text-gray-300 font-normal normal-case">(Opcional)</span></label>
                                    <input type="text" value={regData.cnpj} onChange={e => setRegData({ ...regData, cnpj: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="00.000.000/0000-00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Razão Social</label>
                                    <input type="text" value={regData.legalName} onChange={e => setRegData({ ...regData, legalName: e.target.value })} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-summo-primary/20 focus:border-summo-primary outline-none transition-all font-medium text-gray-800" placeholder="Razão Social Ltda" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-2">
                                <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2"><MapPin size={16} /> Endereço do Estabelecimento</h4>
                                <div className="grid grid-cols-12 gap-3 mb-3">
                                    <div className="col-span-4 md:col-span-3"><input type="text" placeholder="CEP" value={regData.zip} onChange={e => setRegData({ ...regData, zip: e.target.value })} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-summo-primary outline-none" /></div>
                                    <div className="col-span-8 md:col-span-9"><input type="text" placeholder="Rua / Avenida" value={regData.street} onChange={e => setRegData({ ...regData, street: e.target.value })} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-summo-primary outline-none" /></div>
                                </div>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-3 md:col-span-2"><input type="text" placeholder="Nº" value={regData.number} onChange={e => setRegData({ ...regData, number: e.target.value })} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-summo-primary outline-none" /></div>
                                    <div className="col-span-5 md:col-span-5"><input type="text" placeholder="Bairro" value={regData.neighborhood} onChange={e => setRegData({ ...regData, neighborhood: e.target.value })} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-summo-primary outline-none" /></div>
                                    <div className="col-span-4 md:col-span-5"><input type="text" placeholder="Cidade" value={regData.city} onChange={e => setRegData({ ...regData, city: e.target.value })} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-summo-primary outline-none" /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6 pt-2">
                                <button onClick={prevStep} className="px-6 py-3 bg-white text-gray-500 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition shadow-sm">Voltar</button>
                                <button onClick={nextStep} disabled={!regData.businessName} className="flex-1 py-3 bg-gray-900 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2">Próximo <ArrowRight size={20} /></button>
                            </div>
                        </div>
                    )}

                    {regStep === 3 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">Perfil de Operação</h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Qual o seu segmento?</label>
                                <div className="relative">
                                    <select value={regData.segment} onChange={e => setRegData({ ...regData, segment: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary focus:border-summo-primary font-bold text-gray-800 outline-none appearance-none cursor-pointer hover:bg-white hover:border-summo-primary/50 transition-colors">
                                        {['Hamburgueria', 'Pizzaria', 'Japonesa', 'Brasileira', 'Açaí/Sorvete', 'Bebidas/Adega', 'Marmitaria', 'Doceria/Café', 'Padaria', 'Mercado', 'Outros'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Canais de Venda (Selecione todos que aplicar)</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'delivery', label: 'Delivery', icon: Truck },
                                        { id: 'takeaway', label: 'Retirada', icon: ShoppingBag },
                                        { id: 'indoor', label: 'Mesa / Salão', icon: Utensils }
                                    ].map(type => {
                                        const isSelected = regData.serviceTypes.includes(type.id);
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => {
                                                    const types = isSelected
                                                        ? regData.serviceTypes.filter(t => t !== type.id)
                                                        : [...regData.serviceTypes, type.id];
                                                    setRegData({ ...regData, serviceTypes: types });
                                                }}
                                                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2 ${isSelected ? 'bg-summo-primary/5 border-summo-primary text-summo-primary shadow-lg shadow-summo-primary/10' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                                                {type.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                                <button onClick={prevStep} className="px-6 py-3 bg-white text-gray-500 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition shadow-sm">Voltar</button>
                                <button onClick={handleRegister} disabled={loading || regData.serviceTypes.length === 0} className="flex-1 py-4 bg-gradient-to-r from-summo-primary to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" /> : <>Finalizar e Entrar <CheckCircle size={20} /></>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default Login View
    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500 via-orange-900 to-black p-6 relative overflow-hidden animate-fade-in">

            {/* Background Texture/Noise (Optional for premium feel) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md animate-fade-in relative z-10 border border-white/20">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-summo-primary to-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/40 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Droplet size={40} fill="currentColor" className="drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">SUMMO</h2>
                    <p className="text-gray-500 font-medium">Gestão Inteligente & Lucrativa</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Corporativo</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary/50 focus:border-summo-primary outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Senha de Acesso</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary/50 focus:border-summo-primary outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-3 animate-slide-in-up">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-summo-primary to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Acessar Sistema <ArrowRight size={20} opacity={0.8} /></>}
                    </button>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Ou</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                        Criar Nova Conta Corporativa
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="#" className="text-xs font-bold text-gray-400 hover:text-summo-primary transition">
                        Esqueceu a senha?
                    </a>
                </div>
            </div>

            {/* Footer Copy */}
            <div className="absolute bottom-6 text-white/20 text-xs font-bold uppercase tracking-widest pointer-events-none">
                Summo Operating System v1.0
            </div>
        </div>
    );
};

export default Login;
