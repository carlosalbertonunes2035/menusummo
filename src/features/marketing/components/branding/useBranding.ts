import { useState } from 'react';
import { storageService } from '@/lib/firebase/storageService';
import { generateUniqueSlug } from '@/services/slugService';
import { StoreSettings } from '@/types';

export function useBranding(
    localSettings: StoreSettings,
    tenantId: string,
    handleSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void
) {
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const path = `tenants/${tenantId}/branding/logo_${Date.now()}`;
            const url = await storageService.uploadFile(file, path);

            // Artificial event to reuse handleSettingsChange logic
            handleSettingsChange({ target: { name: 'logoUrl', value: url } } as any);
            showToast("Logo enviada com sucesso! Não esqueça de Salvar.", "success");
        } catch (error) {
            console.error(error);
            showToast("Erro ao enviar logo.", "error");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const generateSmartSlug = async () => {
        const base = localSettings.brandName || "loja";
        let suffix = "";

        if (localSettings.address) {
            const parts = localSettings.address.split(',');
            if (parts.length >= 3) {
                const part3 = parts[2].trim();
                if (part3 && !/\d/.test(part3)) suffix += `-${part3}`;
            }
            if (parts.length >= 4) {
                const part4 = parts[3].trim().split('-')[0].trim();
                if (part4) suffix += `-${part4}`;
            }
        }

        const suggestedBase = `${base}${suffix}`;

        try {
            showToast("Verificando disponibilidade...", "info");
            const slug = await generateUniqueSlug(suggestedBase, tenantId);
            handleSettingsChange({ target: { name: 'storefront.slug', value: slug } } as any);
            showToast(`Slug gerado e validado: ${slug}`, "success");
        } catch (error) {
            console.error(error);
            showToast("Erro ao gerar slug único.", "error");
        }
    };

    return {
        isUploadingLogo,
        handleLogoUpload,
        generateSmartSlug
    };
}
