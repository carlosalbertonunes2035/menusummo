import React from 'react';
import { Lock, AlertCircle, Shield, Loader2 } from 'lucide-react';

interface SecurityFormProps {
    securityData: { newPassword: ''; confirmPassword: '' } | any;
    onChange: (field: 'newPassword' | 'confirmPassword', value: string) => void;
    onSave: () => void;
    loading: boolean;
}

export const SecurityForm: React.FC<SecurityFormProps> = ({ securityData, onChange, onSave, loading }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Lock className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-amber-800">
                        <strong>Atenção:</strong> Por segurança, você poderá ser desconectado após alterar a senha.
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
                <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => onChange('newPassword', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Nova Senha</label>
                <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => onChange('confirmPassword', e.target.value)}
                    placeholder="Digite novamente"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none"
                />
            </div>

            <button
                onClick={onSave}
                disabled={loading || !securityData.newPassword || !securityData.confirmPassword}
                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                Alterar Senha
            </button>

            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-orange-600" size={20} />
                    <span className="font-bold text-orange-900">Cargo e Permissões</span>
                </div>
                <div className="text-xs text-orange-800 space-y-1">
                    <p><strong>Cargo:</strong> Dono (OWNER) - Acesso Total</p>
                    <p><strong>Permissões:</strong> Todas (*)</p>
                    <p className="opacity-75 italic">Este privilégio é vitalício e não pode ser revogado.</p>
                </div>
            </div>
        </div>
    );
};
