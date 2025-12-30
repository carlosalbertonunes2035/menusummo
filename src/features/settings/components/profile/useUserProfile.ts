import { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/context/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { fetchCNPJData, formatCNPJ, validateCNPJ } from '@/services/cnpjService';
import { userService } from '@/services/userService';
import { updateProfile, updatePassword } from '@firebase/auth';
import { UserProfileData, ProfileTab } from './types';

export function useUserProfile() {
    const { user, systemUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingCNPJ, setLoadingCNPJ] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

    const [formData, setFormData] = useState<UserProfileData>({
        name: systemUser?.name || '',
        email: systemUser?.email || '',
        phone: systemUser?.phone || '',
        profileImage: systemUser?.profileImage || '',
        businessName: systemUser?.businessName || '',
        cnpj: systemUser?.cnpj || ''
    });

    const [securityData, setSecurityData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (systemUser) {
            setFormData({
                name: systemUser.name || '',
                email: systemUser.email || '',
                phone: systemUser.phone || '',
                profileImage: systemUser.profileImage || '',
                businessName: systemUser.businessName || '',
                cnpj: systemUser.cnpj || ''
            });
        }
    }, [systemUser]);

    const handleInputChange = (field: keyof UserProfileData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSecurityChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
        setSecurityData(prev => ({ ...prev, [field]: value }));
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
                showToast('Dados da empresa carregados!', 'success');
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
            await updateProfile(user, {
                displayName: formData.name,
                photoURL: formData.profileImage || undefined
            });
            await userService.updateProfile(user.uid, {
                name: formData.name,
                phone: formData.phone,
                profileImage: formData.profileImage
            });
            showToast('Dados pessoais atualizados!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Erro ao atualizar dados', 'error');
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
            showToast('Dados da empresa atualizados!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Erro ao atualizar empresa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;
        if (securityData.newPassword !== securityData.confirmPassword) {
            showToast('As senhas não coincidem', 'error');
            return;
        }
        if (securityData.newPassword.length < 6) {
            showToast('Mínimo 6 caracteres', 'error');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(user, securityData.newPassword);
            showToast('Senha alterada com sucesso!', 'success');
            setSecurityData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                showToast('Faça login novamente para alterar a senha', 'error');
            } else {
                showToast(error.message || 'Erro ao alterar senha', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, handleInputChange,
        securityData, handleSecurityChange,
        activeTab, setActiveTab,
        loading, loadingCNPJ,
        handleCNPJLookup, handleSavePersonal, handleSaveCompany, handleChangePassword,
        systemUser
    };
}
