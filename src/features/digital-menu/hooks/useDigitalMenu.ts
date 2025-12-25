import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { OrderType, Product, Order, OrderStatus, Coupon, PaymentMethod, PaymentTransaction, CartItem } from '../../../types';
import { usePublicData } from '../../../contexts/PublicDataContext';
import { useApp } from '../../../contexts/AppContext';
import { useFirestoreCollection } from '../../../lib/firebase/hooks';
import { getProductChannel } from '../../../lib/utils';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { useDigitalMenuContext } from '../context/DigitalMenuContext';
import { RobotService } from '../../../services/robotService';

export const useDigitalMenu = () => {
    // Get most state from context
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
    const { products, optionGroups, settings, tenantId } = usePublicData();
    const params = useParams<{ slugLoja: string; slugProduto: string }>();
    const storeSlug = params.slugLoja;
    const slugProduto = params.slugProduto;
    const { onPlaceOrder, showToast } = useApp();
    const navigate = useNavigate();

    // Local state for UI elements not in context
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const navRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isManualScrolling = useRef(false);

    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [scheduledTime, setScheduledTime] = useState<string>('');
    const [tableNumber, setTableNumber] = useState('');
    const [changeFor, setChangeFor] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (slugProduto && products.length > 0) {
            const product = products.find(p => p.slug === slugProduto || p.id === slugProduto);
            if (product) {
                setSelectedProductForDetail(product);
            }
        }
    }, [slugProduto, products, setSelectedProductForDetail]);

    useEffect(() => {
        const hasOrdered = localStorage.getItem('summo_has_ordered_before') === 'true';
        setIsNewCustomer(!hasOrdered);
    }, []);

    // SEO Syncing
    useEffect(() => {
        if (selectedProductForDetail) {
            const prod = selectedProductForDetail;
            const channel = getProductChannel(prod, 'digital-menu');

            // Priority: Root SEO -> Digital Override (Name) -> Root Name
            const title = prod.seoTitle || channel.displayName || prod.name;
            const desc = prod.seoDescription || channel.description || prod.description || '';

            document.title = `${title} | ${settings.brandName || 'Summo'}`;

            // Meta description update
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', desc);
            }
        } else {
            // Restore default store SEO
            document.title = `${settings.brandName || 'Summo'} - Cardápio Digital`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', settings.seo?.description || '');
            }
        }
    }, [selectedProductForDetail, settings]);

    // Coupons
    const dbTenantId = tenantId || settings.tenantId || storeSlug;
    const { data: rawCoupons } = useFirestoreCollection<Coupon>('coupons', dbTenantId || '', useMemo(() => [{ field: 'isActive', op: '==', value: true }], []));

    const coupons = useMemo(() => {
        return rawCoupons.map(c => ({
            ...c,
            title: c.type === 'FIXED' ? `R$ ${c.value?.toFixed(0)} OFF` : `${c.value}% OFF`,
            description: c.minOrderValue ? `Pedido min. R$ ${c.minOrderValue}` : 'Sem valor mínimo',
            discountType: c.type,
            discountValue: c.value,
            active: c.isActive,
            isNewCustomerOnly: (c as any).isNewCustomerOnly ?? false
        }));
    }, [rawCoupons]);

    const visibleCoupons = useMemo(() => coupons, [coupons]);



    // Open/Closed Logic
    const isClosed = useMemo(() => {
        const schedule = settings.schedule || [];
        if (schedule.length === 0) return false;

        const now = new Date();
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const todayName = days[now.getDay()];
        const todayConfig = schedule.find(d => d.day === todayName);

        if (!todayConfig || !todayConfig.isOpen) return true;

        const [oh, om] = (todayConfig.openTime || "00:00").split(':').map(Number);
        const [ch, cm] = (todayConfig.closeTime || "23:59").split(':').map(Number);
        const nowH = now.getHours();
        const nowM = now.getMinutes();

        const minutesNow = nowH * 60 + nowM;
        const minutesOpen = oh * 60 + om;
        const minutesClose = ch * 60 + cm;

        if (minutesClose < minutesOpen) {
            return !(minutesNow >= minutesOpen || minutesNow <= minutesClose);
        }

        return !(minutesNow >= minutesOpen && minutesNow <= minutesClose);
    }, [settings.schedule]);

    // Orders
    const orderFilters = useMemo(() => {
        if (!user || !user.phone) return [];
        return [{ field: 'customerPhone', op: '==', value: user.phone }];
    }, [user?.phone]);

    const { data: allOrders } = useFirestoreCollection<Order>('orders', storeSlug || '', orderFilters);

    // Helper for Availability (including Combos)
    const checkAvailability = (p: Product) => {
        const channel = getProductChannel(p, 'digital-menu');
        if (!channel.isAvailable) return false;

        if (p.type === 'COMBO' && p.comboItems) {
            for (const item of p.comboItems) {
                const comp = products.find(cp => cp.id === item.productId);
                if (!comp) return false;
                const compChan = getProductChannel(comp, 'digital-menu');
                if (!compChan.isAvailable) return false;
            }
        }
        return true;
    };

    // Derived Data
    const promotionalProducts = useMemo(() => {
        return products.filter(p => {
            const channel = getProductChannel(p, 'digital-menu');
            return checkAvailability(p) && channel.promotionalPrice && channel.promotionalPrice < channel.price;
        }).sort((a, b) => {
            const chanA = getProductChannel(a, 'digital-menu');
            const chanB = getProductChannel(b, 'digital-menu');
            return (chanA.sortOrder || 99) - (chanB.sortOrder || 99);
        });
    }, [products]);

    const categories = useMemo(() => {
        const foundCategories = new Set<string>();
        products.forEach(p => {
            const channel = getProductChannel(p, 'digital-menu');
            if (checkAvailability(p)) {
                foundCategories.add((channel.category || p.category).trim());
            }
        });

        const settingsOrder = settings.interface?.categoryOrder || [];
        const orderedCats: string[] = [];

        if (promotionalProducts.length > 0) orderedCats.push('🔥 Promoções');

        // 1. Add categories from settings in order if they exist in products
        settingsOrder.forEach((cat: string) => {
            if (foundCategories.has(cat)) {
                orderedCats.push(cat);
                foundCategories.delete(cat);
            }
        });

        // 2. Add remaining categories alphabetically
        Array.from(foundCategories).sort().forEach(cat => orderedCats.push(cat));

        return orderedCats;
    }, [products, promotionalProducts, settings.interface?.categoryOrder]);

    // Scroll Spy for Category Navigation
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Adjust offset to account for header height
            const offset = 180;

            let currentCat = activeCategory;
            let minDiff = Infinity;

            categories.forEach(cat => {
                const el = categoryRefs.current[cat];
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const diff = Math.abs(rect.top - offset);
                    if (diff < minDiff) {
                        minDiff = diff;
                        currentCat = cat;
                    }
                }
            });

            if (currentCat !== activeCategory) {
                setActiveCategory(currentCat);
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [categories, activeCategory, setActiveCategory, scrollContainerRef, categoryRefs]);

    const sortedProducts = useMemo(() => {
        return products
            .filter(p => checkAvailability(p)) // Hide unavailable combos/products
            .sort((a, b) => {
                const chanA = getProductChannel(a, 'digital-menu');
                const chanB = getProductChannel(b, 'digital-menu');
                return (chanA.sortOrder || 99) - (chanB.sortOrder || 99);
            });
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return sortedProducts;
        const fuse = new Fuse(sortedProducts, { keys: ['name', 'category', 'description'], threshold: 0.3 });
        return fuse.search(searchTerm).map(r => r.item);
    }, [sortedProducts, searchTerm]);

    const eta = useMemo(() => {
        const mode = orderMode === OrderType.DELIVERY ? 'delivery' : 'takeout';
        const min = settings.orderModes?.[mode]?.minTime || 30;
        const max = settings.orderModes?.[mode]?.maxTime || 60;
        return `${min}-${max} min`;
    }, [settings.orderModes, orderMode]);

    const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(settings.delivery?.baseFee || 0);

    useEffect(() => {
        if (orderMode === OrderType.DELIVERY && user.address && userLocation) {
            const originStr = `${userLocation.lat},${userLocation.lng}`;
            // NEW: Pass destination as coords if available so the Backend Script (Haversine) works
            // If userLocation is the destination (User's device), we use it.
            // Wait, originStr IS set to userLocation above?
            // Re-reading logic: 
            // - If Delivery: Store -> User.
            // - Code says `originStr = userLocation`. This implies userLocation is the Origin? 
            // - If userLocation comes from navigator.geolocation, that's the User.
            // - So Origin = User? No, that's for "Distance to Store" (Maybe "Retirada"?).
            // - For Delivery, Origin should be Store. Destination should be User.
            // - Current code: origin=originStr, dest=user.address.
            // - If `userLocation` is User GPS, then `originStr` is User GPS. This assumes we are calculating distance FROM User TO Store?
            // - Let's swap/fix this logic for the Script. 
            // - Store Location should be in `settings`. if settings.company.location exists.
            // - Let's pass: origin="lat,lng" (Store), destination="lat,lng" (User).

            // Fix: Store Location is Origin. User Location is Destination.
            const storeLoc = settings.company?.location;
            const originCoord = storeLoc ? `${storeLoc.lat},${storeLoc.lng}` : '';
            // Fallback (if no store loc known, we cannot calc exact math): Just send empty or user loc and handle in backend?
            // Actually, let's keep existing flow but ensure we pass coords for *both* ends if possible.

            // To minimize breakage: The backend expects (Origin, Dest).
            // Let's assume standard flow: Origin = Store, Dest = User.
            // Previous code passed `originStr` as first arg. `originStr` was `userLocation`.
            // So previous code calculated User -> ... something?
            // `calculateShippingFee(originStr, user.address)`
            // This is confusing. Usually shipping is Store -> User.
            // If originStr (User GPS) was passed as Origin, then the destination (User Address Text) was passed as Destination.
            // That means distance(User, UserAddress). That returns ~0. 
            // Unless `geminiService` knew `originStr` was meant to be Store? No.

            // Let's FIX IT properly:
            // 1. Origin = Store Location (from settings)
            // 2. Destination = User Location (from GPS `userLocation` variable)

            const storeCoords = settings.company?.location ? `${settings.company.location.lat},${settings.company.location.lng}` : '';
            const userCoords = `${userLocation.lat},${userLocation.lng}`;

            // If we have both, we send both coords.
            const validOrigin = storeCoords || originStr; // Fallback to whatever was there if store missing
            const validDest = userCoords; // User GPS is precise

            calculateShippingFeeFn({ origin: validOrigin, destination: validDest, settings }).then(({ data }: any) => {
                if (data && typeof data.fee === 'number') setCalculatedDeliveryFee(data.fee);
            });
        }
    }, [orderMode, user.address, userLocation, settings]);

    const updateUrlForProduct = (p: Product | null) => {
        const baseUrl = `/loja/${storeSlug}`;
        if (p) {
            const productUrl = `${baseUrl}/produto/${p.slug || p.id}`;
            window.history.replaceState({ modal: true }, '', productUrl);
        } else {
            window.history.replaceState({ modal: false }, '', baseUrl);
        }
    };

    const handleProductCta = (product: Product) => {
        setSelectedProductForDetail(product);
        updateUrlForProduct(product);
    };

    const handleAddToCartFromModal = (item: CartItem) => {
        const hasUpsell = false; // Disabled per user request for smoother flow

        // ALWAYS close the product details modal first
        setSelectedProductForDetail(null);

        if (hasUpsell) {
            // 1. Identify Category
            const channel = getProductChannel(item.product, 'digital-menu');
            const category = (channel.category || item.product.category || '').toLowerCase();

            // 2. Define Rules
            let targetCategory = '';
            let targetTerm = '';

            // Rule 1: Snack -> Drink
            if (category.includes('lanche') || category.includes('combo') || category.includes('burger')) {
                // Check if user already has a drink
                const hasDrink = cart.some(c => {
                    const cCat = (getProductChannel(c.product, 'digital-menu').category || c.product.category || '').toLowerCase();
                    return cCat.includes('bebida') || cCat.includes('refrigerante');
                });

                if (!hasDrink) {
                    targetCategory = 'bebida';
                    targetTerm = 'coca'; // Try to suggest Coke first
                }
            }
            // Rule 2: Drink -> Fries/Portion
            else if (category.includes('bebida') || category.includes('cerveja')) {
                targetCategory = 'porç';
                targetTerm = 'fritas';
            }

            let suggestedProduct: Product | undefined;

            if (targetCategory) {
                // Try to find specific term first
                suggestedProduct = products.find(p => {
                    const pChan = getProductChannel(p, 'digital-menu');
                    const pCat = (pChan.category || p.category || '').toLowerCase();
                    return pCat.includes(targetCategory) &&
                        (p.name || '').toLowerCase().includes(targetTerm.toLowerCase()) &&
                        pChan.isAvailable;
                });

                // Fallback: any item from category
                if (!suggestedProduct) {
                    suggestedProduct = products.find(p => {
                        const pChan = getProductChannel(p, 'digital-menu');
                        const pCat = (pChan.category || p.category || '').toLowerCase();
                        return pCat.includes(targetCategory) && pChan.isAvailable;
                    });
                }
            }

            // Fallback to existing Robot logic if no rule matched or no product found
            if (!suggestedProduct) {
                const suggestedTerm = RobotService.getRuleBasedUpsell(item.product.category);
                if (suggestedTerm) {
                    suggestedProduct = products.find(p =>
                        (p.name || '').toLowerCase().includes(suggestedTerm.toLowerCase()) &&
                        getProductChannel(p, 'digital-menu').isAvailable
                    );
                }
            }

            if (suggestedProduct) {
                setPendingAddition({ ...item, suggestedProduct }); // Passamos a sugestão para o modal de upsell
                setIsUpsellOpen(true);
            } else {
                setCart(prev => [...prev, item]);
                showToast(`${item.product.name} adicionado!`, 'success');
            }
        } else {
            setCart(prev => [...prev, item]);
            showToast(`${item.product.name} adicionado!`, 'success');
        }
    };

    const handleUpsellClose = (upsellProduct: Product | null) => {
        if (!pendingAddition) return;
        const newItems: CartItem[] = [{ ...pendingAddition }];
        if (upsellProduct) {
            newItems.push({ product: upsellProduct, quantity: 1, notes: 'Sugestão ✨', selectedOptions: [] });
        }
        setCart((prev: CartItem[]) => [...prev, ...newItems]);
        setPendingAddition(null);
        setIsUpsellOpen(false);
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`${pendingAddition.product.name} adicionado!`, 'success');
    };

    const updateCartItem = (index: number, delta: number) => {
        setCart((prev: CartItem[]) => {
            const newItem = { ...prev[index], quantity: prev[index].quantity + delta };
            if (newItem.quantity <= 0) return prev.filter((_: any, i: number) => i !== index);
            const newCart = [...prev]; newCart[index] = newItem; return newCart;
        });
    };

    const handleAddUpsellItem = (product: Product) => {
        setCart((prev: CartItem[]) => [...prev, { product, quantity: 1, notes: '', selectedOptions: [] }]);
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`+1 ${product.name} adicionado`, 'success');
    };

    const sendOrder = async () => {
        if (isClosed) { showToast("Estamos fechados no momento. Tente novamente mais tarde!", 'error'); return; }
        if (!user.name || !user.phone) { showToast("Por favor, preencha seu nome no Perfil.", 'error'); setActiveTab('profile'); setIsCartOpen(false); return; }
        if (!paymentMethod) { showToast("Escolha uma forma de pagamento.", 'error'); return; }
        if (orderMode === OrderType.DELIVERY && !user.address) { showToast("Endereço de entrega é obrigatório.", 'error'); return; }

        setIsSending(true);
        try {
            let scheduledDate: Date | undefined = undefined;
            if (scheduledTime) {
                const now = new Date();
                const [hours, minutes] = scheduledTime.split(':').map(Number);
                scheduledDate = new Date(now);
                scheduledDate.setHours(hours, minutes, 0, 0);
                if (scheduledDate < now) scheduledDate.setDate(scheduledDate.getDate() + 1);
            }

            let discountValue = 0;
            if (appliedCoupon) {
                const minOrder = appliedCoupon.minOrderValue || 0;
                if (cartTotal >= minOrder) {
                    discountValue = appliedCoupon.type === 'FIXED' ? appliedCoupon.value : cartTotal * (appliedCoupon.value / 100);
                }
            }

            const deliveryFee = (orderMode === OrderType.DELIVERY && cartTotal < (settings.delivery?.freeShippingThreshold || 0)) ? calculatedDeliveryFee : 0;
            const finalTotal = Math.max(0, cartTotal - discountValue) + deliveryFee;

            const orderPayments: PaymentTransaction[] = [];
            if (paymentMethod) {
                let methodEnum: PaymentMethod;
                switch (paymentMethod) {
                    case 'Pix': methodEnum = PaymentMethod.PIX; break;
                    case 'Cartão': methodEnum = PaymentMethod.CREDIT_CARD; break;
                    case 'Dinheiro': methodEnum = PaymentMethod.CASH; break;
                    default: methodEnum = PaymentMethod.CASH;
                }
                orderPayments.push({ id: Date.now().toString(), description: 'Online Order', method: methodEnum, amount: finalTotal, timestamp: new Date() });
            }

            const changeAmount = (paymentMethod === 'Dinheiro' && changeFor && parseFloat(changeFor) > finalTotal)
                ? parseFloat(changeFor) - finalTotal
                : undefined;

            const orderPayload = {
                customerName: user.name, customerPhone: user.phone,
                items: cart.map(i => {
                    const channel = getProductChannel(i.product, 'digital-menu');
                    const basePrice = channel.promotionalPrice || channel.price || 0;
                    const optionsPrice = i.selectedOptions ? i.selectedOptions.reduce((acc, opt) => acc + opt.price, 0) : 0;
                    return { productId: i.product.id, productName: i.product.name, quantity: i.quantity, basePrice: channel.price || 0, price: basePrice + optionsPrice, notes: i.notes, isTakeout: orderMode !== OrderType.DINE_IN, channel: 'digital-menu' as const, selectedOptions: i.selectedOptions };
                }),
                total: finalTotal,
                cost: 0,
                status: OrderStatus.PENDING,
                type: orderMode,
                origin: 'DIGITAL' as const,
                payments: orderPayments,
                deliveryAddress: orderMode === OrderType.DELIVERY ? user.address : undefined,
                location: orderMode === OrderType.DELIVERY ? (user.location || userLocation || undefined) : undefined,
                ...(scheduledDate ? { scheduledTo: scheduledDate } : {}),
                ...(scheduledDate ? { scheduledTo: scheduledDate } : {}),
                ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
                ...(discountValue > 0 ? { discountTotal: discountValue } : {}),
                ...(changeAmount !== undefined ? { change: changeAmount } : {}),
                ...(orderMode === OrderType.DINE_IN && tableNumber ? { tableNumber } : {})
            };

            const orderId = await onPlaceOrder(orderPayload);
            if (orderId) {
                localStorage.setItem('summo_has_ordered_before', 'true');
                setIsNewCustomer(false);
            }
            setActiveOrderId(orderId);
            setCart([]);
            setAppliedCoupon(null);
            setIsCartOpen(false);
        } catch (error) {
            console.error("Order error", error);
            showToast("Erro ao enviar pedido.", "error");
        } finally {
            setIsSending(false);
        }
    };

    const scrollToCategory = (cat: string) => {
        isManualScrolling.current = true;
        setSearchTerm(''); // Clear search when picking a category
        setActiveTab('feed'); // Force return to feed if in search tab
        setActiveCategory(cat);
        const el = categoryRefs.current[cat];
        if (el && scrollContainerRef.current) {
            const yOffset = -160;
            const container = scrollContainerRef.current;
            const containerTop = container.getBoundingClientRect().top;
            const elTop = el.getBoundingClientRect().top;
            const scrollPos = elTop - containerTop + container.scrollTop + yOffset;
            container.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
        setTimeout(() => { isManualScrolling.current = false; }, 800);
    };

    return {
        products, settings,
        isDarkMode, setIsDarkMode,
        activeTab, setActiveTab,
        viewMode, setViewMode,
        activeCategory, setActiveCategory,
        categoryRefs, navRef, scrollContainerRef,
        cart, setCart, cartTotal, cartCount,
        isNewCustomer, coupons, visibleCoupons, appliedCoupon, setAppliedCoupon,
        isClosed,
        isCartOpen, setIsCartOpen,
        selectedProductForDetail, setSelectedProductForDetail,
        isAddressModalOpen, setIsAddressModalOpen,
        isUpsellOpen, setIsUpsellOpen,
        pendingAddition,
        commentProduct, setCommentProduct,
        activeOrderId, setActiveOrderId,
        user, setUser, updateUser,
        searchTerm, setSearchTerm, filteredProducts,
        userLocation, eta, calculatedDeliveryFee,
        orderMode, setOrderMode,
        scheduledTime, setScheduledTime,
        tableNumber, setTableNumber,
        paymentMethod, setPaymentMethod,
        changeFor, setChangeFor,
        isSending,
        roboticSuggestion: (pendingAddition?.suggestedProduct || null) as (Product | null),
        handleProductCta, handleAddToCartFromModal, handleUpsellClose,
        updateCartItem, handleAddUpsellItem, sendOrder, scrollToCategory,
        updateUrlForProduct, promotionalProducts, categories, allOrders
    };
};
