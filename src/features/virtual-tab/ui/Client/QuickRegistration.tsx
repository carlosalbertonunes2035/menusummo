import { useState } from 'react';
import { QuickRegistrationData } from '../../model/types';

interface QuickRegistrationProps {
    onSubmit: (data: QuickRegistrationData) => Promise<void>;
    tableNumber: string;
}

export function QuickRegistration({ onSubmit, tableNumber }: QuickRegistrationProps) {
    const [formData, setFormData] = useState<QuickRegistrationData>({
        customerName: '',
        customerPhone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.customerName.trim()) {
            setError('Por favor, informe seu nome');
            return;
        }

        if (!formData.customerPhone.trim()) {
            setError('Por favor, informe seu telefone');
            return;
        }

        // Validate phone (11 digits)
        const phoneDigits = formData.customerPhone.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            setError('Telefone deve ter 11 dígitos (DDD + número)');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                customerName: formData.customerName.trim(),
                customerPhone: phoneDigits,
            });
        } catch (err) {
            setError('Erro ao criar sessão. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, customerPhone: formatted });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🍊</div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Bem-vindo ao SUMMO
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        {tableNumber}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                            Seu Nome
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="João Silva"
                            disabled={loading}
                            autoComplete="name"
                        />
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                            Telefone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={formData.customerPhone}
                            onChange={handlePhoneChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="(11) 98765-4321"
                            disabled={loading}
                            autoComplete="tel"
                            maxLength={15}
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            DDD + número (11 dígitos)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Carregando...
                            </>
                        ) : (
                            <>
                                Começar a Pedir ✨
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Seus dados são usados apenas para identificar seu pedido
                    </p>
                </div>
            </div>
        </div>
    );
}
