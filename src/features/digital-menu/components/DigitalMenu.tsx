import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Clock } from 'lucide-react';
import { usePublicData } from '../../../contexts/PublicDataContext';
import { useApp } from '../../../contexts/AppContext';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';

// --- Modularized Sub-components & Hook ---
import ProductDetailModal from './ProductDetailModal';
import CommentsModal from './CommentsModal';
import AddressModal from './AddressModal';
import OrdersTab from './OrdersTab';
import ProfileTab from './ProfileTab';
import InstagramDock from './InstagramDock';
import CartModal from './CartModal';
import OrderTracker from './OrderTracker';
import { useDigitalMenu } from '../hooks/useDigitalMenu';
import { getProductChannel } from '../../../lib/utils';
import { MenuHeader } from './MenuHeader';
import { CategoryNav } from './CategoryNav';
import { ProductSection } from './ProductSection';
import { SearchSection } from './SearchSection';
import UpsellModal from './UpsellModal';
import { BannerSlider } from './BannerSlider';
import FloatingCartBar from './FloatingCartBar';

// --- MAIN MENU COMPONENT ---
const DigitalMenu: React.FC = () => {
    const {
        products, settings,
        isDarkMode, setIsDarkMode,
        activeTab, setActiveTab,
        viewMode, setViewMode,
        activeCategory,
        categoryRefs, navRef, scrollContainerRef,
        cart, cartTotal, cartCount,
        visibleCoupons, appliedCoupon, setAppliedCoupon,
        isClosed,
        isCartOpen, setIsCartOpen,
        selectedProductForDetail, setSelectedProductForDetail,
        isAddressModalOpen, setIsAddressModalOpen,
        isUpsellOpen,
        pendingAddition,
        commentProduct, setCommentProduct,
        activeOrderId, setActiveOrderId,
        user, updateUser,
        searchTerm, setSearchTerm, filteredProducts,
        eta, calculatedDeliveryFee,
        orderMode, setOrderMode,
        scheduledTime, setScheduledTime,
        tableNumber, setTableNumber,
        paymentMethod, setPaymentMethod,
        changeFor, setChangeFor,
        isSending,
        handleProductCta, handleAddToCartFromModal, handleUpsellClose,
        updateCartItem, handleAddUpsellItem, sendOrder, scrollToCategory,
        updateUrlForProduct, promotionalProducts, categories, allOrders
    } = useDigitalMenu();

    const { showToast } = useApp();

    // SEO & Tracking
    const seoTitle = settings.seo?.title || settings.brandName || 'Cardápio Digital';
    const seoDescription = settings.seo?.description || `Peça online em ${settings.brandName}`;
    const seoKeywords = Array.isArray(settings.seo?.keywords) ? settings.seo.keywords.join(', ') : settings.seo?.keywords || 'delivery, comida, cardápio';

    const ga4Id = settings.analytics?.googleAnalyticsId;
    const metaPixelId = settings.analytics?.metaPixelId;

    const getCategoryImage = (cat: string) => {
        // 1. Check if there's a custom category image configured in settings (New & Legacy support)
        const categoryConfig = settings.digitalMenu?.categories?.[cat];
        if (categoryConfig?.image) return categoryConfig.image;

        const legacyImages = settings.digitalMenu?.categoryImages || {};
        const customImageKey = Object.keys(legacyImages).find(
            key => key.trim().toLowerCase() === cat.trim().toLowerCase()
        );
        const customImage = customImageKey ? legacyImages[customImageKey] : undefined;
        if (customImage && customImage.trim() !== '') return customImage;

        // 2. Fallback for Promotions
        if (cat === '🔥 Promoções' && promotionalProducts.length > 0) {
            const prod = promotionalProducts[0];
            const channel = getProductChannel(prod, 'digital-menu');
            return channel.image || (prod as any).image;
        }

        // 3. Fallback to first product image in category
        const prod = products.find(p => {
            const channel = getProductChannel(p, 'digital-menu');
            const prodCat = (channel.category || p.category).trim();
            return prodCat === cat;
        });
        if (prod) {
            const channel = getProductChannel(prod, 'digital-menu');
            if (channel.image) return channel.image;
        }

        // 4. No category image set in Marketing
        return undefined;
    };

    const handleCouponSelect = (coupon: any) => {
        setAppliedCoupon(coupon);
        showToast(`Cupom ${coupon.code} selecionado!`, 'success');
        setIsCartOpen(true);
    };

    return (
        <div className={`h-screen w-screen ${isDarkMode ? 'dark' : ''}`}>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={seoKeywords} />

                {/* Social Share Image */}
                <meta property="og:image" content={settings.logoUrl || 'https://summo.app/assets/default-store.png'} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />

                {/* Google Analytics 4 */}
                {ga4Id && (
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
                )}
                {ga4Id && (
                    <script>
                        {`
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());
                          gtag('config', '${ga4Id}');
                        `}
                    </script>
                )}

                {/* Meta Pixel */}
                {metaPixelId && (
                    <script>
                        {`
                          !function(f,b,e,v,n,t,s)
                          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                          n.queue=[];t=b.createElement(e);t.async=!0;
                          t.src=v;s=b.getElementsByTagName(e)[0];
                          s.parentNode.insertBefore(t,s)}(window, document,'script',
                          'https://connect.facebook.net/en_US/fbevents.js');
                          fbq('init', '${metaPixelId}');
                          fbq('track', 'PageView');
                        `}
                    </script>
                )}
                {metaPixelId && (
                    <noscript>
                        {`<img height="1" width="1" style="display:none"
                        src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1"
                        />`}
                    </noscript>
                )}
            </Helmet>

            <main className="bg-summo-bg h-full w-full font-sans relative overflow-hidden flex flex-col transition-colors duration-300">
                {activeOrderId && (
                    <OrderTracker
                        orderId={activeOrderId}
                        onClose={() => setActiveOrderId(null)}
                        onNewOrder={() => { setActiveOrderId(null); setActiveTab('feed'); }}
                    />
                )}

                <MenuHeader
                    settings={settings}
                    isOpen={!isClosed}
                    eta={eta}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                />

                {activeTab === 'feed' && settings.digitalMenu?.branding?.promoBanners && (
                    <BannerSlider
                        banners={settings.digitalMenu.branding.promoBanners}
                        rotationSeconds={settings.digitalMenu.branding.bannerRotationSeconds}
                        onBannerClick={(prodId) => {
                            const prod = products.find(p => p.id === prodId);
                            if (prod) handleProductCta(prod);
                        }}
                    />
                )}

                {activeTab === 'feed' && (
                    <CategoryNav
                        settings={settings}
                        categories={categories}
                        activeCategory={activeCategory}
                        scrollToCategory={scrollToCategory}
                        getCategoryImage={getCategoryImage}
                    />
                )}

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar pb-24 scroll-smooth">

                    {activeTab === 'feed' && (
                        <ProductSection
                            settings={settings}
                            visibleCoupons={visibleCoupons}
                            handleCouponSelect={handleCouponSelect}
                            categories={categories}
                            promotionalProducts={promotionalProducts}
                            products={filteredProducts}
                            viewMode={viewMode}
                            handleProductCta={handleProductCta}
                            setCommentProduct={setCommentProduct}
                            categoryRefs={categoryRefs}
                        />
                    )}

                    {activeTab === 'search' && (
                        <SearchSection
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filteredProducts={filteredProducts}
                            handleProductCta={handleProductCta}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <OrdersTab user={user} orders={allOrders} />
                    )}
                    {activeTab === 'profile' && <ProfileTab user={user} setUser={updateUser} />}
                </div>

                <InstagramDock
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    cartCount={cartCount}
                    openCart={() => setIsCartOpen(true)}
                />

                {isCartOpen && (
                    <CartModal
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cart={cart}
                        updateCartItem={updateCartItem}
                        settings={{ ...settings, delivery: { ...settings.delivery, baseFee: calculatedDeliveryFee } }}
                        user={user}
                        onOpenAddressModal={() => setIsAddressModalOpen(true)}
                        onSendOrder={sendOrder}
                        isSending={isSending}
                        orderMode={orderMode}
                        setOrderMode={setOrderMode}
                        scheduledTime={scheduledTime}
                        setScheduledTime={setScheduledTime}
                        tableNumber={tableNumber}
                        setTableNumber={setTableNumber}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        changeFor={changeFor}
                        setChangeFor={setChangeFor}
                        cartTotal={cartTotal}
                        products={products}
                        onAddUpsellItem={handleAddUpsellItem}
                        onClearCart={() => { }} // Hook handles cart state internally or via setCart
                        onUpdateUser={updateUser}
                        appliedCoupon={appliedCoupon}
                        setAppliedCoupon={setAppliedCoupon}
                        coupons={visibleCoupons}
                        showToast={showToast}
                    />
                )}

                {isAddressModalOpen && (<AddressModal user={user} settings={settings} onSave={(address, coords) => updateUser({ address, location: coords || undefined })} onClose={() => setIsAddressModalOpen(false)} />)}
                {commentProduct && (<CommentsModal product={commentProduct} onClose={() => setCommentProduct(null)} user={user} onUpdateUser={(u) => updateUser(u)} />)}
                {selectedProductForDetail && (
                    <ProductDetailModal
                        product={selectedProductForDetail}
                        isOpen={!!selectedProductForDetail}
                        onClose={() => { setSelectedProductForDetail(null); updateUrlForProduct(null); }}
                        onAddToCart={(product, quantity, notes, selectedOptions) =>
                            handleAddToCartFromModal({ product, quantity, notes, selectedOptions })
                        }
                    />
                )}
                {isUpsellOpen && pendingAddition && (
                    <UpsellModal
                        isOpen={isUpsellOpen}
                        onClose={handleUpsellClose}
                        addedProduct={pendingAddition.product}
                        allProducts={products}
                    />
                )}
            </main>
        </div>
    );
};

export default DigitalMenu;
