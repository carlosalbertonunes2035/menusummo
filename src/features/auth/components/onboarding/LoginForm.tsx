import React from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    handleLogin: (e: React.FormEvent) => void;
    loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    email, setEmail, password, setPassword, handleLogin, loading
}) => {
    return (
        <form onSubmit={handleLogin} className="space-y-5 animate-slide-in-up">
            <div>
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
            <div>
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

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-summo-primary text-white py-4 rounded-[1.25rem] font-bold text-lg shadow-2xl shadow-summo-primary/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={20} /></>}
            </button>
        </form>
    );
};
