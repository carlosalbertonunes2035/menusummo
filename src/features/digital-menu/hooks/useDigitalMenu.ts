import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { OrderType, Coupon, CartItem, Product, Order } from '../../../types';
import { usePublicData } from '../../../contexts/PublicDataContext';
import { useApp } from '../../../contexts/AppContext';
import { useFirestoreCollection } from '../../../lib/firebase/hooks';
import { useDigitalMenuContext } from '../context/DigitalMenuContext';

// Sub-hooks
import { useMenuNavigation } from './subhooks/useMenuNavigation';
import { useMenuData } from './subhooks/useMenuData';
import { useCartActions } from './subhooks/useCartActions';
import { useCheckoutFlow } from './subhooks/useCheckoutFlow';
import { useToast } from '../../../contexts/ToastContext';

export const useDigitalMenu = () => {
    const { showToast } = useToast();
    const {
        isDarkMode, setIsDarkMode,
        activeTab, setActiveTab,
        viewMode, setViewMode,
        activeCategory, setActiveCategory,
        isCartOpen, setIsCartOpen,
        selectedProductForDetail, setSelectedProductForDetail,
        isAddressModalOpen, setIsAddressModalOpen,
        isUpsellOpen, setIsUpsellOpen,
        pendingAddition, setPendingAddition,
        commentProduct, setCommentProduct,
        activeOrderId, setActiveOrderId,
        user, setUser, updateUser,
        cart, setCart,
        searchTerm, setSearchTerm,
        appliedCoupon, setAppliedCoupon,
        orderMode, setOrderMode,
        paymentMethod, setPaymentMethod,
        cartTotal, cartCount
    } = useDigitalMenuContext();

    const { products, settings, tenantId } = usePublicData();
    const params = useParams<{ slugLoja: string; slugProduto: string }>();
    const storeSlug = params.slugLoja || '';
    const slugProduto = params.slugProduto;

    // Local state for UI
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [scheduledTime, setScheduledTime] = useState<string>('');
    const [tableNumber, setTableNumber] = useState('');
    const [changeFor, setChangeFor] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Initial load logic
    useEffect(() => {
        if (slugProduto && products.length > 0) {
            const product = products.find(p => p.slug === slugProduto || p.id === slugProduto);
            if (product) setSelectedProductForDetail(product);
        }
    }, [slugProduto, products, setSelectedProductForDetail]);

    useEffect(() => {
        const hasOrdered = localStorage.getItem('summo_has_ordered_before') === 'true';
        setIsNewCustomer(!hasOrdered);
    }, []);

    // 1. Data Processing
    const { promotionalProducts, categories, filteredProducts, checkAvailability } = useMenuData({
        products, settings, searchTerm
    });

    // 2. Navigation & SEO
    const { categoryRefs, scrollContainerRef, scrollToCategory, updateUrlForProduct } = useMenuNavigation({
        selectedProductForDetail, setSelectedProductForDetail, settings,
        activeCategory, setActiveCategory, categories, storeSlug
    });

    // 3. Cart Actions
    const { handleAddToCartFromModal, handleUpsellClose, updateCartItem, handleAddUpsellItem } = useCartActions({
        cart, setCart, products, setSelectedProductForDetail,
        setPendingAddition, setIsUpsellOpen, showToast, pendingAddition
    });

    // 4. Coupons & Orders (Data Fetching)
    const dbTenantId = tenantId || settings.tenantId || storeSlug;
    const { data: rawCoupons } = useFirestoreCollection<Coupon>('coupons', dbTenantId || '', useMemo(() => [{ field: 'isActive', op: '==', value: true }], []));
    const coupons = useMemo(() => rawCoupons.map(c => ({
        ...c,
        title: c.type === 'FIXED' ? `R$ ${c.value?.toFixed(0)} OFF` : `${c.value}% OFF`,
        discountType: c.type,
        discountValue: c.value,
        active: c.isActive
    } as any)), [rawCoupons]);

    const orderFilters = useMemo(() => (!user || !user.phone) ? [] : [{ field: 'customerPhone', op: '==', value: user.phone }], [user?.phone]);
    const { data: allOrders } = useFirestoreCollection<Order>('orders', storeSlug || '', orderFilters);

    // 5. Checkout Flow
    const isClosed = useMemo(() => {
        const schedule = settings.schedule || [];
        if (schedule.length === 0) return false;
        const now = new Date();
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const todayConfig = schedule.find(d => d.day === days[now.getDay()]);
        if (!todayConfig || !todayConfig.isOpen) return true;
        const [oh, om] = (todayConfig.openTime || "00:00").split(':').map(Number);
        const [ch, cm] = (todayConfig.closeTime || "23:59").split(':').map(Number);
        const minNow = now.getHours() * 60 + now.getMinutes(), minOpen = oh * 60 + om, minClose = ch * 60 + cm;
        return minClose < minOpen ? !(minNow >= minOpen || minNow <= minClose) : !(minNow >= minOpen && minNow <= minClose);
    }, [settings.schedule]);

    const { calculatedDeliveryFee, isSending, sendOrder } = useCheckoutFlow({
        settings, user, userLocation, orderMode, cart, cartTotal,
        appliedCoupon, isClosed,
        paymentMethod, changeFor, tableNumber, setActiveOrderId,
        setCart, setAppliedCoupon, setIsCartOpen, setActiveTab
    });

    const eta = useMemo(() => {
        const mode = orderMode === OrderType.DELIVERY ? 'delivery' : 'takeout';
        const m = settings.orderModes?.[mode];
        return `${m?.minTime || 30}-${m?.maxTime || 60} min`;
    }, [settings.orderModes, orderMode]);

    return {
        products, settings, isDarkMode, setIsDarkMode, activeTab, setActiveTab,
        viewMode, setViewMode, activeCategory, setActiveCategory,
        categoryRefs, scrollContainerRef, cart, setCart, cartTotal, cartCount,
        isNewCustomer, coupons, visibleCoupons: coupons, appliedCoupon, setAppliedCoupon,
        isClosed, isCartOpen, setIsCartOpen, selectedProductForDetail, setSelectedProductForDetail,
        isAddressModalOpen, setIsAddressModalOpen, isUpsellOpen, setIsUpsellOpen,
        pendingAddition, commentProduct, setCommentProduct, activeOrderId, setActiveOrderId,
        user, setUser, updateUser, searchTerm, setSearchTerm, filteredProducts,
        userLocation, eta, calculatedDeliveryFee, orderMode, setOrderMode,
        scheduledTime, setScheduledTime, tableNumber, setTableNumber,
        paymentMethod, setPaymentMethod, changeFor, setChangeFor, isSending,
        roboticSuggestion: pendingAddition?.suggestedProduct || null,
        handleProductCta: (p: Product) => { setSelectedProductForDetail(p); updateUrlForProduct(p); },
        handleAddToCartFromModal, handleUpsellClose, updateCartItem, handleAddUpsellItem,
        sendOrder: (disc: number, pts: number) => sendOrder(disc, pts, scheduledTime),
        scrollToCategory: (cat: string) => scrollToCategory(cat, () => setSearchTerm(''), () => setActiveTab('feed')),
        updateUrlForProduct, promotionalProducts, categories, allOrders
    };
};
