
import React, { useState, useEffect } from 'react';
import { Megaphone, Ticket, Calendar, Wand2, Loader2, Copy, GalleryVertical, Brush, Layout, Smartphone, Save, Eye, BarChart, Activity, Sparkles, Upload, Link } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useOrders } from '@/hooks/useOrders';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../auth/context/AuthContext';
import { functions } from '../../../lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { storageService } from '../../../lib/firebase/storageService';
import { generateUniqueSlug } from '../../../services/slugService';
import { StoreSettings } from '../../../types';
import BannerManager from '../../digital-showcase/components/BannerManager';
import CategoryManager from '../../digital-showcase/components/CategoryManager';
import { RobotService } from '../../../services/robotService';

// --- SUB-COMPONENT: COUPON MANAGER ---
const CouponManager: React.FC = () => {
    const { showToast, handleAction } = useApp();
    const { coupons } = useData();
    const { data: orders } = useOrders({ limit: 500 });
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 0,
        usageLimit: 0
    });

    const getAnalytics = (code: string) => {
        const relevantOrders = orders.filter(o => o.couponCode === code && o.status !== 'CANCELLED');
        const count = relevantOrders.length;
        const revenue = relevantOrders.reduce((sum, o) => sum + o.total, 0);
        const discount = relevantOrders.reduce((sum, o) => sum + (o.discountTotal || 0), 0);
        return { count, revenue, discount };
    };

    const handleCreate = async () => {
        if (!formData.code) return showToast('Código obrigatório', 'error');

        const newCoupon: any = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue),
            usageLimit: Number(formData.usageLimit),
            isActive: true,
            createdAt: new Date(),
            usageCount: 0
        };

        try {
            await handleAction('coupons', 'add', undefined, newCoupon);
            showToast(`Cupom ${newCoupon.code} criado!`, 'success');
            setIsCreating(false);
            setFormData({ code: '', type: 'PERCENTAGE', value: 10, minOrderValue: 0, usageLimit: 0 });
        } catch (error) {
            showToast('Erro ao criar cupom', 'error');
        }
    };

    const toggleStatus = async (coupon: any) => {
        await handleAction('coupons', 'update', coupon.id, { isActive: !coupon.isActive });
        showToast(`Cupom ${coupon.isActive ? 'pausado' : 'ativado'}`, 'info');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Excluir este cupom?")) return;
        await handleAction('coupons', 'delete', id);
        showToast('Cupom excluído', 'info');
    };

    return (
        <div className="space-y-6">
            {/* Header & Create Button */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Ticket size={24} className="text-rose-500" /> Gestão de Cupons
                    </h3>
                    <p className="text-sm text-gray-500">Crie, monitore e gerencie suas campanhas de desconto.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${isCreating ? 'bg-gray-100 text-gray-600' : 'bg-rose-600 text-white shadow-lg shadow-rose-200'}`}
                >
                    {isCreating ? 'Cancelar' : 'Novo Cupom'}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-100 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <h4 className="font-bold text-gray-800 mb-4">Configurar Novo Cupom</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Código do Cupom</label>
                            <input
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full p-3 border rounded-xl uppercase font-bold bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="Ex: BEMVINDO10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Desconto</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-gray-50 outline-none"
                            >
                                <option value="PERCENTAGE">Porcentagem (%)</option>
                                <option value="FIXED">Valor Fixo (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor do Desconto</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl font-bold text-green-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Pedido Mínimo (R$)</label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Limite de Usos (0 = Infinito)</label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase w-full mb-1">Sugestões Rápidas:</span>
                        {RobotService.getCouponTemplates().map(tpl => (
                            <button
                                key={tpl.code}
                                onClick={() => setFormData({
                                    code: tpl.code,
                                    type: tpl.type,
                                    value: tpl.value,
                                    minOrderValue: (tpl as any).minOrderValue || 0,
                                    usageLimit: 0
                                })}
                                className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
                            >
                                + {tpl.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleCreate} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition shadow-md">
                        Criar Campanha
                    </button>
                </div>
            )}

            {/* Coupons List */}
            <div className="grid grid-cols-1 gap-4">
                {coupons.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Ticket size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>Nenhum cupom ativo no momento.</p>
                    </div>
                ) : (
                    coupons.map(coupon => {
                        const stats = getAnalytics(coupon.code);
                        return (
                            <div key={coupon.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${coupon.isActive ? 'border-gray-200 opacity-100' : 'border-gray-100 opacity-60 bg-gray-50'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Info Left */}
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl text-gray-800 tracking-wide">{coupon.code}</h4>
                                            <p className="text-sm font-medium text-gray-500">
                                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                                                {(coupon.minOrderValue || 0) > 0 && ` • Mín. R$ ${coupon.minOrderValue}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Middle - The "Investment" View */}
                                    <div className="flex-1 w-full md:w-auto grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Usos</p>
                                            <p className="font-bold text-gray-700">{stats.count}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Faturamento</p>
                                            <p className="font-bold text-green-600">R$ {stats.revenue.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Desc. Dado</p>
                                            <p className="font-bold text-rose-500">R$ {stats.discount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Actions Right */}
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => toggleStatus(coupon)}
                                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold border transition ${coupon.isActive ? 'border-gray-300 text-gray-600 hover:bg-gray-100' : 'bg-green-600 text-white border-green-600 hover:bg-green-700'}`}
                                        >
                                            {coupon.isActive ? 'Pausar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="px-3 py-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                        >
                                            <span className="sr-only">Excluir</span>
                                            <Layout size={16} className="rotate-45" /> {/* Using Layout as generic X icon or just use X from lucide if imported, but Layout was imported */}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: SOCIAL AI ---
const SocialAI: React.FC = () => {
    const { products } = useData();
    const { settings } = useApp();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [ideas, setIdeas] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            const generateSocialMedia = httpsCallable(functions, 'generateSocialMedia');
            const { data } = await generateSocialMedia({ prompt });
            setIdeas(data as any[]);
        } catch (e) {
            console.error(e);
            // Fallback mock if function fails locally without emulators
            setIdeas([{ title: "Ideia Local", content: "Erro na IA ou emuladores desconectados.", type: "ERRO" }]);
        } finally { setIsGenerating(false); }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Social Media IA</h3>
                    <p className="opacity-90 text-sm mb-4">Diga o que quer postar e a IA cria legendas e ideias para Stories e Feed.</p>
                    <div className="flex gap-2">
                        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ex: Dia de chuva, promoção de açaí..." className="flex-1 p-3 rounded-xl text-gray-800 outline-none" />
                        <button onClick={handleGenerate} disabled={isGenerating} className="bg-white text-orange-700 px-6 font-bold rounded-xl flex items-center gap-2 hover:bg-orange-50 transition">{isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />} Gerar</button>
                    </div>
                </div>
                <Wand2 className="absolute -bottom-10 -right-10 text-white opacity-10" size={150} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded uppercase">{idea.type}</span>
                            <button className="text-gray-400 hover:text-orange-600"><Copy size={16} /></button>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2">{idea.title}</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{idea.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Marketing: React.FC = () => {
    // Contexts
    const { settings, setSettings, showToast, handleAction } = useApp();
    const { products } = useData();
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || 'global';

    // State
    const [activeTab, setActiveTab] = useState<'SHOWCASE' | 'CAMPAIGNS' | 'LOYALTY' | 'CONTENT' | 'SEO'>('SHOWCASE');

    // Showcase Sub-tabs (Local to Marketing component now)
    const [showcaseSubTab, setShowcaseSubTab] = useState<'APPEARANCE' | 'ORGANIZATION'>('APPEARANCE');
    const [appearanceSubTab, setAppearanceSubTab] = useState<'IDENTITY' | 'BANNERS'>('IDENTITY');

    const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
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

    // Styling constants
    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-slate-800 placeholder-slate-400 transition-colors";
    const labelClass = "text-xs font-bold text-slate-500 uppercase mb-1 block";
    const cardClass = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4";

    useEffect(() => { setLocalSettings(settings); setHasChanges(false); }, [settings]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        let parsedValue: any = value;
        if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;
        if (type === 'number') parsedValue = parseFloat(value) || 0;

        setLocalSettings(prev => {
            const newS = JSON.parse(JSON.stringify(prev));
            let temp = newS;
            for (let i = 0; i < keys.length - 1; i++) {
                if (temp[keys[i]] === undefined) temp[keys[i]] = {};
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = parsedValue;
            return newS;
        });
        setHasChanges(true);
    };

    const saveSettings = () => {
        setSettings(localSettings);
        setHasChanges(false);
        showToast("Configurações salvas com sucesso!", "success");
    };

    const handleGenerateSeo = async () => {
        setIsGeneratingSeo(true);
        try {
            const productNames = products.slice(0, 10).map(p => p.name);
            const generateStoreSeoFn = httpsCallable(functions, 'generateStoreSeo');

            const { data } = await generateStoreSeoFn({
                brandName: localSettings.brandName,
                products: productNames
            });
            const result = data as any;

            setLocalSettings(prev => ({
                ...prev,
                seo: {
                    title: result.title || prev.seo?.title || '',
                    description: result.description || '',
                    keywords: result.keywords ? result.keywords.split(',').map((k: string) => k.trim()) : []
                }
            }));
            setHasChanges(true);
            showToast("SEO gerado com IA (Vertex)!", "success");
        } catch (e) {
            console.error(e);
            showToast("Erro ao gerar SEO via Backend.", "error");
        } finally { setIsGeneratingSeo(false); }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 shadow-sm sticky top-0 z-20 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl text-white shadow-lg shadow-pink-200"><Megaphone size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Marketing & Vitrine</h2>
                            <p className="text-sm text-gray-500">Hub do Cliente: Aparência da Loja, Campanhas e Conteúdo.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const link = localSettings.storefront?.slug || tenantId;
                            window.open(`/loja/${link}`, '_blank');
                        }}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition active:scale-95 whitespace-nowrap"
                    >
                        <Eye size={18} /> Ver Loja Online
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'SHOWCASE', label: 'Vitrine (Loja Online)', icon: GalleryVertical },
                        { id: 'CAMPAIGNS', label: 'Campanhas & Cupons', icon: Ticket },
                        { id: 'LOYALTY', label: 'Fidelidade & Cashback', icon: Sparkles },
                        { id: 'CONTENT', label: 'Conteúdo (IA)', icon: Wand2 },
                        { id: 'SEO', label: 'Config. Técnicas (SEO)', icon: Smartphone },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-rose-50'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* --- TAB: SHOWCASE (VITRINE) --- */}
                    {activeTab === 'SHOWCASE' && (
                        <div className="space-y-6">
                            <div className="flex gap-2 mb-4 bg-gray-200 p-1 rounded-xl w-fit">
                                <button onClick={() => setShowcaseSubTab('APPEARANCE')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${showcaseSubTab === 'APPEARANCE' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>Aparência & Marca</button>
                                <button onClick={() => setShowcaseSubTab('ORGANIZATION')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${showcaseSubTab === 'ORGANIZATION' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>Categorias & Ordem</button>
                            </div>

                            {showcaseSubTab === 'APPEARANCE' && (
                                <>
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => setAppearanceSubTab('IDENTITY')} className={`text-sm font-bold px-3 py-1 rounded-full border ${appearanceSubTab === 'IDENTITY' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-white border-gray-200 text-gray-500'}`}>Identidade</button>
                                        <button onClick={() => setAppearanceSubTab('BANNERS')} className={`text-sm font-bold px-3 py-1 rounded-full border ${appearanceSubTab === 'BANNERS' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-white border-gray-200 text-gray-500'}`}>Banners</button>
                                    </div>

                                    {appearanceSubTab === 'IDENTITY' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className={cardClass}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label htmlFor="brandName" className={labelClass}>Nome Fantasia</label>
                                                        <input id="brandName" type="text" name="brandName" value={localSettings.brandName} onChange={handleSettingsChange} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="storeSlug" className={labelClass}>Link da Loja (Slug)</label>
                                                        <div className="flex gap-2">
                                                            <input id="storeSlug" type="text" name="storefront.slug" value={localSettings.storefront?.slug || ''} onChange={handleSettingsChange} className={inputClass} placeholder="minha-loja-bairro-cidade" />
                                                            <button
                                                                onClick={generateSmartSlug}
                                                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-xl border border-gray-200"
                                                                title="Gerar Link Automático (Nome + Endereço)"
                                                            >
                                                                <Link size={18} />
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Usado na URL: dimenu.app/loja/<b>{localSettings.storefront?.slug || 'seu-slug'}</b></p>
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
                                                                    value={localSettings.logoUrl}
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
                                                            <input type="color" name="digitalMenu.branding.primaryColor" value={localSettings.digitalMenu?.branding?.primaryColor || '#ff6b00'} onChange={handleSettingsChange} className="h-10 w-16 p-1 rounded-lg border border-gray-200 cursor-pointer shadow-sm" />
                                                            <input type="text" name="digitalMenu.branding.primaryColor" value={localSettings.digitalMenu?.branding?.primaryColor || '#ff6b00'} onChange={handleSettingsChange} className={inputClass} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Cor de Fundo</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="color" name="digitalMenu.branding.backgroundColor" value={localSettings.digitalMenu?.branding?.backgroundColor || '#f8fafc'} onChange={handleSettingsChange} className="h-10 w-16 p-1 rounded-lg border border-gray-200 cursor-pointer shadow-sm" />
                                                            <input type="text" name="digitalMenu.branding.backgroundColor" value={localSettings.digitalMenu?.branding?.backgroundColor || '#f8fafc'} onChange={handleSettingsChange} className={inputClass} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Layout Padrão</label>
                                                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                                                        <button onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'LIST' } } as any)} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'LIST' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}>Lista (iFood)</button>
                                                        <button onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'FEED' } } as any)} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'FEED' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}>Feed (Instagram)</button>
                                                        <button onClick={() => handleSettingsChange({ target: { name: 'digitalMenu.layout', value: 'GRID' } } as any)} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${localSettings.digitalMenu?.layout === 'GRID' ? 'bg-white shadow text-summo-primary' : 'text-gray-500'}`}>E-commerce (Grid)</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {appearanceSubTab === 'BANNERS' && (
                                        <BannerManager
                                            banners={localSettings.digitalMenu?.branding?.promoBanners || []}
                                            onUpdateBanners={(newBanners) => {
                                                const currentDigitalMenu = localSettings.digitalMenu || {};
                                                const currentBranding = currentDigitalMenu.branding || {};
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    digitalMenu: {
                                                        ...currentDigitalMenu,
                                                        branding: {
                                                            ...currentBranding,
                                                            promoBanners: newBanners
                                                        }
                                                    }
                                                }));
                                                setHasChanges(true);
                                            }}
                                            rotationSeconds={localSettings.digitalMenu?.branding?.bannerRotationSeconds || 5}
                                            onUpdateRotation={(seconds) => {
                                                const currentDigitalMenu = localSettings.digitalMenu || {};
                                                const currentBranding = currentDigitalMenu.branding || {};
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    digitalMenu: {
                                                        ...currentDigitalMenu,
                                                        branding: {
                                                            ...currentBranding,
                                                            bannerRotationSeconds: seconds
                                                        }
                                                    }
                                                }));
                                                setHasChanges(true);
                                            }}
                                            tenantId={localSettings.storefront?.slug || 'default'}
                                        />
                                    )}
                                </>
                            )}

                            {showcaseSubTab === 'ORGANIZATION' && (
                                <CategoryManager localSettings={localSettings} updateLocalSettings={(newS) => { setLocalSettings(prev => ({ ...prev, ...newS })); setHasChanges(true); }} />
                            )}
                        </div>
                    )}

                    {/* --- TAB: CAMPAIGNS --- */}
                    {activeTab === 'CAMPAIGNS' && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Ticket size={20} /> Criar Cupom</h3>
                                <CouponManager />
                            </div>
                        </div>
                    )}

                    {/* --- TAB: LOYALTY --- */}
                    {activeTab === 'LOYALTY' && (
                        <div className="space-y-6">
                            <div className={cardClass}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Sparkles size={20} className="text-amber-500" /> Programa de Fidelidade</h4>
                                        <p className="text-sm text-gray-500 mt-1">Transforme clientes eventuais em fãs recorrentes com cashback automático.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="loyalty.enabled" checked={localSettings.loyalty?.enabled || false} onChange={handleSettingsChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                        <span className="text-xs font-bold text-gray-500">{localSettings.loyalty?.enabled ? 'ATIVO' : 'INATIVO'}</span>
                                    </div>
                                </div>

                                {localSettings.loyalty?.enabled && (
                                    <div className="mt-6 space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left: Branding */}
                                            <div className="space-y-4">
                                                <h5 className="font-bold text-gray-700 text-sm border-b pb-2">Identidade do Programa</h5>
                                                <div>
                                                    <label className={labelClass}>Nome da Moeda</label>
                                                    <input type="text" name="loyalty.branding.name" value={localSettings.loyalty?.branding?.name || 'Cashback'} onChange={handleSettingsChange} className={inputClass} placeholder="Ex: Moedas, Pontos, Cashback" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Cor do Cartão</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input type="color" name="loyalty.branding.color" value={localSettings.loyalty?.branding?.color || '#FFD700'} onChange={handleSettingsChange} className="h-10 w-16 p-1 rounded-lg border cursor-pointer" />
                                                        <span className="text-xs text-gray-400">Cor usada no cartão digital do cliente.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Math */}
                                            <div className="space-y-4">
                                                <h5 className="font-bold text-gray-700 text-sm border-b pb-2">Regras de Ganho & Uso</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelClass}>Pontos por R$ 1,00</label>
                                                        <input type="number" name="loyalty.pointsPerCurrency" value={localSettings.loyalty?.pointsPerCurrency || 1} onChange={handleSettingsChange} className={inputClass} />
                                                        <p className="text-[10px] text-gray-400 mt-1">Ganha X pontos a cada Real gasto.</p>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Valor de 100 Pontos (R$)</label>
                                                        <input type="number" name="loyalty.cashbackValuePer100Points" value={localSettings.loyalty?.cashbackValuePer100Points || 5} onChange={handleSettingsChange} className={inputClass} />
                                                        <p className="text-[10px] text-gray-400 mt-1">Quanto vale o resgate.</p>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Mínimo para Resgate</label>
                                                        <input type="number" name="loyalty.minRedemptionPoints" value={localSettings.loyalty?.minRedemptionPoints || 100} onChange={handleSettingsChange} className={inputClass} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Simulator Preview */}
                                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-white/50 uppercase mb-2">Simulação para o Cliente</p>
                                                <p className="text-lg">
                                                    "Se eu gastar <span className="text-green-400 font-bold">R$ 100,00</span>, ganho <span className="text-amber-400 font-bold">{100 * (localSettings.loyalty?.pointsPerCurrency || 1)} {localSettings.loyalty?.branding?.name || 'Pontos'}</span>."
                                                </p>
                                                <p className="text-sm mt-1 text-white/70">
                                                    Isso equivale a <span className="font-bold text-white">R$ {(((100 * (localSettings.loyalty?.pointsPerCurrency || 1)) / 100) * (localSettings.loyalty?.cashbackValuePer100Points || 5)).toFixed(2)}</span> de desconto futuro.
                                                </p>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[200px] text-center">
                                                <p className="text-xs font-bold text-white/60 uppercase">Cashback Efetivo</p>
                                                <p className="text-3xl font-black text-amber-400">
                                                    {((((localSettings.loyalty?.pointsPerCurrency || 1) / 100) * (localSettings.loyalty?.cashbackValuePer100Points || 5)) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB: CONTENT --- */}
                    {activeTab === 'CONTENT' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2"><Wand2 size={20} /> Social Media IA</h3></div>
                            <SocialAI />
                        </div>
                    )}

                    {/* --- TAB: SEO --- */}
                    {activeTab === 'SEO' && (
                        <div className="space-y-6">
                            <div className={cardClass}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><BarChart size={16} /> SEO (Busca Google)</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const catNames = Array.from(new Set(products.map(p => p.category)));
                                                const base = RobotService.generateBaseSEO(localSettings.brandName, catNames);
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    seo: {
                                                        title: prev.seo?.title || localSettings.brandName,
                                                        description: base.description,
                                                        keywords: base.keywords
                                                    }
                                                }));
                                                setHasChanges(true);
                                                showToast("SEO gerado instantaneamente (Robô)", "success");
                                            }}
                                            className="flex items-center gap-1 text-[10px] text-gray-600 font-bold hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                                        >
                                            <Activity size={12} /> Sugestão Rápida
                                        </button>
                                        <button onClick={handleGenerateSeo} disabled={isGeneratingSeo} className="flex items-center gap-1 text-[10px] text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition">{isGeneratingSeo ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Refinar com IA</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className={labelClass}>Título da Página (Title Tag)</label><input type="text" name="seo.title" value={localSettings.seo?.title} onChange={handleSettingsChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" /></div>
                                    <div><label className={labelClass}>Descrição (Meta Description)</label><textarea name="seo.description" value={localSettings.seo?.description} onChange={handleSettingsChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" rows={3} /></div>
                                    <div><label className={labelClass}>Palavras-chave (Keywords)</label><input type="text" name="seo.keywords" value={localSettings.seo?.keywords} onChange={handleSettingsChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Ex: açaí, delivery, lanches" /></div>
                                </div>
                            </div>
                            <div className={cardClass}>
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity size={16} /> Analytics & Pixels</h4>
                                <div className="space-y-4">
                                    <div><label className={labelClass}>ID do Google Analytics 4</label><input type="text" name="analytics.googleAnalyticsId" value={localSettings.analytics?.googleAnalyticsId} onChange={handleSettingsChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="G-XXXXXXXXXX" /></div>
                                    <div><label className={labelClass}>ID do Pixel da Meta (Facebook)</label><input type="text" name="analytics.metaPixelId" value={localSettings.analytics?.metaPixelId} onChange={handleSettingsChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Apenas o número de ID" /></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Save Button */}
            {hasChanges && (
                <div className="p-4 border-t border-gray-200 bg-white/90 backdrop-blur-md flex-shrink-0 sticky bottom-0 z-30 animate-slide-up">
                    <button onClick={saveSettings} className="w-full max-w-4xl mx-auto py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700">
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            )}
        </div>
    );
};

export default Marketing;
