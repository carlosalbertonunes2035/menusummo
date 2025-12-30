import React from 'react';
import { Upload, Link, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { BrandingManagerProps } from './types';
import { useBranding } from './useBranding';

export const BrandingManager: React.FC<Omit<BrandingManagerProps, 'showToast'>> = ({
    localSettings,
    tenantId,
    handleSettingsChange
}) => {
    const { showToast } = useToast();
    const {
        isUploadingLogo,
        handleLogoUpload,
        generateSmartSlug
    } = useBranding(localSettings, tenantId, handleSettingsChange, showToast);

    const labelClass = "text-xs font-bold text-slate-500 uppercase mb-1 block";
    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-slate-800 placeholder-slate-400 transition-colors";
    const cardClass = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cardClass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="brandName" className={labelClass}>Nome Fantasia</label>
                        <input
                            id="brandName"
                            type="text"
                            name="brandName"
                            value={localSettings.brandName || ''}
                            onChange={handleSettingsChange}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="storeSlug" className={labelClass}>Link da Loja (Slug)</label>
                        <div className="flex gap-2">
                            <input
                                id="storeSlug"
                                type="text"
                                name="storefront.slug"
                                value={localSettings.storefront?.slug || ''}
                                onChange={handleSettingsChange}
                                className={inputClass}
                                placeholder="minha-loja-bairro-cidade"
                            />
                            <button
                                onClick={generateSmartSlug}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-xl border border-gray-200"
                                title="Gerar Link Automático (Nome + Endereço)"
                            >
                                <Link size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                            Usado na URL: dimenu.app/loja/<b>{localSettings.storefront?.slug || 'seu-slug'}</b>
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <label className={labelClass}>Logo da Marca</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="h-16 w-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                            {isUploadingLogo ? (
                                <Loader2 className="animate-spin text-summo-primary" />
                            ) : localSettings.logoUrl ? (
                                <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-xs text-gray-300 font-bold">SEM LOGO</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2">
                                <label className="bg-summo-primary text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-rose-700 transition flex items-center gap-2 w-fit shadow-md shadow-rose-200">
                                    <Upload size={14} /> Fazer Upload
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                                <input
                                    type="text"
                                    name="logoUrl"
                                    value={localSettings.logoUrl || ''}
                                    onChange={handleSettingsChange}
                                    className="flex-1 bg-transparent border-b border-gray-200 text-xs text-gray-500 focus:border-summo-primary outline-none px-2"
                                    placeholder="Ou cole uma URL externa..."
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Recomendado: 500x500px (Quadrado)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <h4 className="font-bold text-gray-800 mb-4">Cores e Tema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className={labelClass}>Cor Principal</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="digitalMenu.branding.primaryColor"
                                value={localSettings.digitalMenu?.branding?.primaryColor || '#ff6b00'}
                                onChange={handleSettingsChange}
                                className="h-10 w-16 p-1 rounded-lg border border-gray-200 cursor-pointer shadow-sm"
                            />
                            <input
                                type="text"
                                name="digitalMenu.branding.primaryColor"
                                value={localSettings.digitalMenu?.branding?.primaryColor || '#ff6b00'}
                                onChange={handleSettingsChange}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Cor de Fundo</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="digitalMenu.branding.backgroundColor"
                                value={localSettings.digitalMenu?.branding?.backgroundColor || '#f8fafc'}
                                onChange={handleSettingsChange}
                                className="h-10 w-16 p-1 rounded-lg border border-gray-200 cursor-pointer shadow-sm"
                            />
                            <input
                                type="text"
                                name="digitalMenu.branding.backgroundColor"
                                value={localSettings.digitalMenu?.branding?.backgroundColor || '#f8fafc'}
                                onChange={handleSettingsChange}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Layout Padrão</label>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'LIST' } } as any)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'LIST' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}
                        >
                            Lista (iFood)
                        </button>
                        <button
                            onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'FEED' } } as any)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'FEED' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}
                        >
                            Feed (Instagram)
                        </button>
                        <button
                            onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'GRID' } } as any)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'GRID' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}
                        >
                            E-commerce (Grid)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
