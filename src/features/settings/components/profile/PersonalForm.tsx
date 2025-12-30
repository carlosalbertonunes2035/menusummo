import React from 'react';
import { User, Mail, Phone, Camera, Save, Loader2 } from 'lucide-react';
import { UserProfileData } from './types';

interface PersonalFormProps {
    formData: UserProfileData;
    onChange: (field: keyof UserProfileData, value: string) => void;
    onSave: () => void;
    loading: boolean;
}

export const PersonalForm: React.FC<PersonalFormProps> = ({ formData, onChange, onSave, loading }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <img
                        src={formData.profileImage || `https://ui-avatars.com/api/?name=${formData.name}&background=FF6B00&color=fff&size=128`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-summo-primary/20 object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-summo-primary text-white rounded-full shadow-lg hover:bg-orange-600 transition">
                        <Camera size={16} />
                    </button>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL da Foto</label>
                    <input
                        type="url"
                        value={formData.profileImage}
                        onChange={(e) => onChange('profileImage', e.target.value)}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" /> Nome Completo
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" /> Email
                </label>
                <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">* Email não pode ser alterado por segurança.</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" /> Telefone
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-summo-primary outline-none transition-all"
                />
            </div>

            <button
                onClick={onSave}
                disabled={loading}
                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Dados Pessoais
            </button>
        </div>
    );
};
