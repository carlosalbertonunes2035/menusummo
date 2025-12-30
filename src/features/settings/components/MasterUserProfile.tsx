import React from 'react';
import { X, Shield, User, Building2, Lock } from 'lucide-react';
import { useUserProfile } from './profile/useUserProfile';
import { PersonalForm } from './profile/PersonalForm';
import { CompanyForm } from './profile/CompanyForm';
import { SecurityForm } from './profile/SecurityForm';

interface MasterUserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MasterUserProfile: React.FC<MasterUserProfileProps> = ({ isOpen, onClose }) => {
    const {
        formData, handleInputChange,
        securityData, handleSecurityChange,
        activeTab, setActiveTab,
        loading, loadingCNPJ,
        handleCNPJLookup, handleSavePersonal, handleSaveCompany, handleChangePassword,
        systemUser
    } = useUserProfile();

    if (!isOpen) return null;

    const tabs = [
        { id: 'personal', label: 'Dados Pessoais', icon: User },
        { id: 'company', label: 'Empresa', icon: Building2 },
        { id: 'security', label: 'Segurança', icon: Lock }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                {/* Header Section */}
                <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-summo-primary/5 to-orange-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-xl shadow-summo-primary/10">
                                <Shield className="text-summo-primary" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Meu Perfil</h2>
                                <p className="text-xs font-bold text-summo-primary uppercase tracking-widest">Acesso Root/Owner</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mt-8">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${isActive
                                        ? 'bg-summo-primary text-white shadow-lg shadow-summo-primary/30 scale-105'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar-summo">
                    {activeTab === 'personal' && (
                        <PersonalForm
                            formData={formData}
                            onChange={handleInputChange}
                            onSave={handleSavePersonal}
                            loading={loading}
                        />
                    )}
                    {activeTab === 'company' && (
                        <CompanyForm
                            formData={formData}
                            onChange={handleInputChange}
                            onLookup={handleCNPJLookup}
                            onSave={handleSaveCompany}
                            loading={loading}
                            loadingCNPJ={loadingCNPJ}
                        />
                    )}
                    {activeTab === 'security' && (
                        <SecurityForm
                            securityData={securityData}
                            onChange={handleSecurityChange}
                            onSave={handleChangePassword}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
