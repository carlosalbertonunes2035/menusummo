import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { SystemUser } from '@/types';
import { fetchCNPJData, formatCNPJ, validateCNPJ } from '@/services/cnpjService';
import { userService } from '@/services/userService';
import { updateProfile, updateEmail, updatePassword } from '@firebase/auth';
import {
    User, Building2, Mail, Phone, MapPin, Hash, Save, Loader2,
    Search, Shield, Lock, Camera, X, AlertCircle
} from 'lucide-react';

interface MasterUserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MasterUserProfile: React.FC<MasterUserProfileProps> = ({ isOpen, onClose }) => {
    const { user, systemUser } = useAuth();
    const { showToast } = useApp();

    const [loading, setLoading] = useState(false);
    const [loadingCNPJ, setLoadingCNPJ] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'security'>('personal');

    // Form state
    const [formData, setFormData] = useState({
        // Personal
        name: systemUser?.name || '',
        email: systemUser?.email || '',
        phone: systemUser?.phone || '',
        profileImage: systemUser?.profileImage || '',

        // Company
        businessName: systemUser?.businessName || '',
        cnpj: systemUser?.cnpj || '',

        // Security
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (systemUser) {
            setFormData(prev => ({
                ...prev,
                name: systemUser.name || '',
                email: systemUser.email || '',
                phone: systemUser.phone || '',
                profileImage: systemUser.profileImage || '',
                businessName: systemUser.businessName || '',
                cnpj: systemUser.cnpj || ''
            }));
        }
    }, [systemUser]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCNPJLookup = async () => {
        if (!formData.cnpj) {
            showToast('Digite um CNPJ para buscar', 'error');
            return;
        }

        if (!validateCNPJ(formData.cnpj)) {
            showToast('CNPJ inválido', 'error');
            return;
        }

        setLoadingCNPJ(true);
        try {
            const data = await fetchCNPJData(formData.cnpj);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    businessName: data.fantasia || data.nome,
                    cnpj: formatCNPJ(data.cnpj)
                }));
                showToast('Dados da empresa carregados com sucesso!', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Erro ao buscar CNPJ', 'error');
        } finally {
            setLoadingCNPJ(false);
        }
    };

    const handleSavePersonal = async () => {
        if (!user || !systemUser) return;

        setLoading(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: formData.name,
                photoURL: formData.profileImage || undefined
            });

            // Update Firestore user document via service
            await userService.updateProfile(user.uid, {
                name: formData.name,
                phone: formData.phone,
                profileImage: formData.profileImage
            });

            showToast('Dados pessoais atualizados com sucesso!', 'success');
        } catch (error: any) {
            console.error('Error updating personal data:', error);
            showToast(error.message || 'Erro ao atualizar dados pessoais', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompany = async () => {
        if (!user || !systemUser) return;

        setLoading(true);
        try {
            await userService.updateCompanyData(user.uid, {
                businessName: formData.businessName,
                cnpj: formData.cnpj
            });

            showToast('Dados da empresa atualizados com sucesso!', 'success');
        } catch (error: any) {
            console.error('Error updating company data:', error);
            showToast(error.message || 'Erro ao atualizar dados da empresa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (formData.newPassword !== formData.confirmPassword) {
            showToast('As senhas não coincidem', 'error');
            return;
        }

        if (formData.newPassword.length < 6) {
            showToast('A senha deve ter no mínimo 6 caracteres', 'error');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(user, formData.newPassword);
            showToast('Senha alterada com sucesso!', 'success');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/requires-recent-login') {
                showToast('Por segurança, faça login novamente antes de alterar a senha', 'error');
            } else {
                showToast(error.message || 'Erro ao alterar senha', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-200800 bg-gradient-to-r from-summo-primary/10 to-orange-100/20900/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white800 rounded-xl shadow-lg">
                                <Shield className="text-summo-primary" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                                <p className="text-sm text-gray-600400">Usuário Master - Acesso Total</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/50:bg-gray-800/50 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {[
                            { id: 'personal', label: 'Dados Pessoais', icon: User },
                            { id: 'company', label: 'Empresa', icon: Building2 },
                            { id: 'security', label: 'Segurança', icon: Lock }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                        ? 'bg-white800 text-summo-primary shadow-lg'
                                        : 'text-gray-600400 hover:bg-white/50:bg-gray-800/50'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Personal Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            {/* Profile Image */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <img
                                        src={formData.profileImage || `https://ui-avatars.com/api/?name=${formData.name}&background=FF6B00&color=fff&size=128`}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full border-4 border-summo-primary/20"
                                    />
                                    <button className="absolute bottom-0 right-0 p-2 bg-summo-primary text-white rounded-full shadow-lg hover:bg-orange-600 transition">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700300 mb-2">
                                        URL da Foto
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.profileImage}
                                        onChange={(e) => handleInputChange('profileImage', e.target.value)}
                                        placeholder="https://exemplo.com/foto.jpg"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    <User size={16} className="inline mr-2" />
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    <Mail size={16} className="inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-gray-100900 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado por segurança</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    <Phone size={16} className="inline mr-2" />
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                />
                            </div>

                            <button
                                onClick={handleSavePersonal}
                                disabled={loading}
                                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Salvar Dados Pessoais
                            </button>
                        </div>
                    )}

                    {/* Company Tab */}
                    {activeTab === 'company' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50900/20 border border-blue-200800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-blue-600400 flex-shrink-0" size={20} />
                                    <div className="text-sm text-blue-800300">
                                        <strong>Dica:</strong> Use a busca automática de CNPJ para preencher os dados da empresa rapidamente.
                                    </div>
                                </div>
                            </div>

                            {/* CNPJ with Lookup */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    <Hash size={16} className="inline mr-2" />
                                    CNPJ
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                                        placeholder="00.000.000/0000-00"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                    />
                                    <button
                                        onClick={handleCNPJLookup}
                                        disabled={loadingCNPJ}
                                        className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {loadingCNPJ ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                        Buscar
                                    </button>
                                </div>
                            </div>

                            {/* Business Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    <Building2 size={16} className="inline mr-2" />
                                    Nome Fantasia
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    placeholder="Nome da sua empresa"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                />
                            </div>

                            <button
                                onClick={handleSaveCompany}
                                disabled={loading}
                                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Salvar Dados da Empresa
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50900/20 border border-amber-200800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="text-amber-600400 flex-shrink-0" size={20} />
                                    <div className="text-sm text-amber-800300">
                                        <strong>Atenção:</strong> Por segurança, você pode precisar fazer login novamente após alterar a senha.
                                    </div>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700300 mb-2">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder="Digite a senha novamente"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                                />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                                Alterar Senha
                            </button>

                            {/* Role Info (Read-only) */}
                            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="text-orange-600" size={20} />
                                    <span className="font-bold text-orange-900">Cargo e Permissões</span>
                                </div>
                                <div className="text-sm text-orange-800">
                                    <strong>Cargo:</strong> Dono (OWNER) - Acesso Total<br />
                                    <strong>Permissões:</strong> Todas (*)<br />
                                    <em className="text-xs opacity-75">Este cargo não pode ser alterado por segurança.</em>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
