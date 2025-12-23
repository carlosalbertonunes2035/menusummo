import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Plus, Trash2, Upload, ImageIcon, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { storageService } from '../../../lib/firebase/storageService';
import { PromoBanner } from '../../../types';

interface BannerManagerProps {
    banners: PromoBanner[];
    onUpdateBanners: (newBanners: PromoBanner[]) => void;
    rotationSeconds: number;
    onUpdateRotation: (seconds: number) => void;
    tenantId: string;
}

const BannerManager: React.FC<BannerManagerProps> = ({ banners, onUpdateBanners, rotationSeconds, onUpdateRotation, tenantId }) => {
    const { showToast } = useApp();
    const [uploadingBanners, setUploadingBanners] = useState<Record<string, boolean>>({});

    // Standard Styles
    const inputClass = "w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-summo-primary outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400";
    const labelClass = "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block";

    const handleUpdateBannersLocal = (newBanners: PromoBanner[]) => {
        onUpdateBanners(newBanners);
    };

    const handleAddBanner = () => {
        const newBanner: PromoBanner = {
            // eslint-disable-next-line react-hooks/purity
            id: Date.now().toString(),
            enabled: true,
            title: '',
            text: '',
            imageUrl: '',
            linkedProductId: ''
        };
        const newBanners = [...banners, newBanner];
        handleUpdateBannersLocal(newBanners);
    };

    const handleRemoveBanner = (id: string) => {
        const newBanners = banners.filter((b: PromoBanner) => b.id !== id);
        handleUpdateBannersLocal(newBanners);
    };

    const handleUpdateBanner = (id: string, field: keyof PromoBanner, value: any) => {
        const newBanners = banners.map((b: PromoBanner) => b.id === id ? { ...b, [field]: value } : b);
        handleUpdateBannersLocal(newBanners);
    };

    const handleRotationChange = (seconds: number) => {
        onUpdateRotation(seconds);
    };

    const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingBanners(prev => ({ ...prev, [id]: true }));
            showToast('Enviando banner...', 'info');

            const path = `tenants/${tenantId}/banners/banner_${id}_${Date.now()}`;
            const url = await storageService.uploadFile(file, path);

            handleUpdateBanner(id, 'imageUrl', url);
            showToast('Banner enviado com sucesso!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Erro ao enviar imagem.', 'error');
        } finally {
            setUploadingBanners(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Global Banner Settings */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Tempo de Rotação</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Quanto tempo cada banner fica visível.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                        type="range"
                        min="3"
                        max="10"
                        value={rotationSeconds}
                        onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                        className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-summo-primary"
                    />
                    <span className="font-mono font-bold text-summo-primary w-12 text-center">{rotationSeconds}s</span>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Dicas para Banners Incríveis</h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc pl-4">
                        <li><strong>Formato Ideal:</strong> Retangular (Paisagem).</li>
                        <li><strong>Tamanho Recomendado:</strong> 1200 x 600 pixels (Proporção 2:1).</li>
                        <li><strong>Conteúdo:</strong> Evite muito texto na imagem. Use os campos de título e descrição abaixo.</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner: PromoBanner, index: number) => (
                    <div key={banner.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm relative group flex flex-col md:flex-row gap-6">
                        {/* Preview Area */}
                        <div className="w-full md:w-[280px] flex-shrink-0">
                            <label className={labelClass}>Visualização</label>
                            <div className="w-full aspect-[2/1] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                                {banner.imageUrl ? (
                                    <>
                                        <img src={banner.imageUrl} className="w-full h-full object-cover" />
                                        {uploadingBanners[banner.id] && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                                                <Loader2 size={32} className="text-white animate-spin" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                            <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm">{banner.title || 'Seu Título'}</h3>
                                            <p className="text-white/90 text-[10px] drop-shadow-sm mt-0.5 leading-tight">{banner.text || 'Descrição...'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 relative">
                                        {uploadingBanners[banner.id] ? (
                                            <Loader2 size={32} className="text-summo-primary animate-spin" />
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="opacity-50 mb-1" />
                                                <p className="text-[10px] font-bold">Sem Imagem</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <label className="cursor-pointer bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 p-1.5 rounded-lg shadow-sm hover:text-summo-primary transition" title="Trocar Imagem">
                                        <Upload size={14} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(banner.id, e)} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Edit Controls */}
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400 font-mono">Banner #{index + 1}</span>
                                <button onClick={() => handleRemoveBanner(banner.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Título Principal</label>
                                    <input
                                        value={banner.title}
                                        onChange={(e) => handleUpdateBanner(banner.id, 'title', e.target.value)}
                                        className={inputClass}
                                        placeholder="Ex: Oferta Relâmpago"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Subtítulo / Descrição</label>
                                    <input
                                        value={banner.text}
                                        onChange={(e) => handleUpdateBanner(banner.id, 'text', e.target.value)}
                                        className={inputClass}
                                        placeholder="Ex: Tudo com 20% OFF"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition w-fit">
                                    <input
                                        type="checkbox"
                                        checked={banner.enabled}
                                        onChange={(e) => handleUpdateBanner(banner.id, 'enabled', e.target.checked)}
                                        className="w-5 h-5 text-summo-primary rounded focus:ring-summo-primary"
                                    />
                                    <span className={`text-sm font-bold ${banner.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                        {banner.enabled ? 'Banner Ativo e Visível' : 'Banner Oculto (Rascunho)'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddBanner}
                    className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-slate-500 dark:text-slate-400 font-bold hover:border-summo-primary hover:text-summo-primary hover:bg-summo-bg/50 transition flex flex-col items-center justify-center gap-2"
                >
                    <Plus size={24} />
                    <span>Adicionar Novo Banner</span>
                </button>
            </div>
        </div>
    );
};

export default BannerManager;
