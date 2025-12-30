import React from 'react';
import { Building2, Hash, Search, Save, Loader2, AlertCircle } from 'lucide-react';
import { UserProfileData } from './types';
import { formatCNPJ } from '@/services/cnpjService';

interface CompanyFormProps {
    formData: UserProfileData;
    onChange: (field: keyof UserProfileData, value: string) => void;
    onLookup: () => void;
    onSave: () => void;
    loading: boolean;
    loadingCNPJ: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
    formData, onChange, onLookup, onSave, loading, loadingCNPJ
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-800">
                        <strong>Dica:</strong> Use a busca automática de CNPJ para preencher os dados da empresa.
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Hash size={16} className="inline mr-2" /> CNPJ
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={formData.cnpj}
                        onChange={(e) => onChange('cnpj', formatCNPJ(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none"
                    />
                    <button
                        onClick={onLookup}
                        disabled={loadingCNPJ}
                        className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {loadingCNPJ ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                        Buscar
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Building2 size={16} className="inline mr-2" /> Nome Fantasia
                </label>
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => onChange('businessName', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none"
                />
            </div>

            <button
                onClick={onSave}
                disabled={loading}
                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Dados da Empresa
            </button>
        </div>
    );
};
