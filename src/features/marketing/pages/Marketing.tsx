import React from 'react';
import { Ticket, Wand2, Save } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '../../auth/context/AuthContext';

import BannerManager from '../../digital-showcase/components/BannerManager';
import CategoryManager from '../../digital-showcase/components/CategoryManager';

import { CouponTable } from '../components/coupons/CouponTable';
import { SocialAgentCard } from '../components/social/SocialAgentCard';
import { LoyaltyManager } from '../components/loyalty/LoyaltyManager';
import { SeoManager } from '../components/seo/SeoManager';
import { BrandingManager } from '../components/branding/BrandingManager';
import { MarketingHeader } from '../components/MarketingHeader';
import { useMarketing } from '../hooks/useMarketing';

const Marketing: React.FC = () => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { products } = useProductsQuery(tenantId);
    const { systemUser } = useAuth();

    const {
        activeTab, setActiveTab,
        showcaseSubTab, setShowcaseSubTab,
        appearanceSubTab, setAppearanceSubTab,
        localSettings, setLocalSettings,
        hasChanges,
        handleSettingsChange,
        saveSettings
    } = useMarketing();

    const onViewStore = () => {
        const link = localSettings.storefront?.slug || tenantId;
        window.open(`/loja/${link}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50 animate-fade-in text-gray-800">
            <MarketingHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onViewStore={onViewStore}
            />

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
                                        <BrandingManager
                                            localSettings={localSettings}
                                            tenantId={tenantId}
                                            handleSettingsChange={handleSettingsChange}
                                        />
                                    )}

                                    {appearanceSubTab === 'BANNERS' && (
                                        <BannerManager
                                            banners={localSettings.digitalMenu?.branding?.promoBanners || []}
                                            onUpdateBanners={(newBanners) => {
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    digitalMenu: {
                                                        ...(prev.digitalMenu || {}),
                                                        branding: {
                                                            ...(prev.digitalMenu?.branding || {}),
                                                            promoBanners: newBanners
                                                        }
                                                    }
                                                }));
                                            }}
                                            rotationSeconds={localSettings.digitalMenu?.branding?.bannerRotationSeconds || 5}
                                            onUpdateRotation={(seconds) => {
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    digitalMenu: {
                                                        ...(prev.digitalMenu || {}),
                                                        branding: {
                                                            ...(prev.digitalMenu?.branding || {}),
                                                            bannerRotationSeconds: seconds
                                                        }
                                                    }
                                                }));
                                            }}
                                            tenantId={localSettings.storefront?.slug || 'default'}
                                        />
                                    )}
                                </>
                            )}

                            {showcaseSubTab === 'ORGANIZATION' && (
                                <CategoryManager
                                    localSettings={localSettings}
                                    updateLocalSettings={(newS) => setLocalSettings(prev => ({ ...prev, ...newS }))}
                                />
                            )}
                        </div>
                    )}

                    {/* --- TAB: CAMPAIGNS --- */}
                    {activeTab === 'CAMPAIGNS' && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Ticket size={20} /> Campanhas de Venda</h3>
                                <CouponTable />
                            </div>
                        </div>
                    )}

                    {/* --- TAB: LOYALTY --- */}
                    {activeTab === 'LOYALTY' && (
                        <LoyaltyManager
                            localSettings={localSettings}
                            handleSettingsChange={handleSettingsChange}
                        />
                    )}

                    {/* --- TAB: CONTENT --- */}
                    {activeTab === 'CONTENT' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><h3 className="font-bold text-gray-700 flex items-center gap-2"><Wand2 size={20} /> Social Media IA</h3></div>
                            <SocialAgentCard />
                        </div>
                    )}

                    {/* --- TAB: SEO --- */}
                    {activeTab === 'SEO' && (
                        <SeoManager
                            localSettings={localSettings}
                            products={products}
                            handleSettingsChange={handleSettingsChange}
                            setLocalSettings={setLocalSettings}
                            setHasChanges={() => { }}
                        />
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
