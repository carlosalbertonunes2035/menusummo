import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Product, CartItem, OrderType, Coupon } from '../../../types';

interface DigitalMenuUser {
    name: string;
    phone: string;
    address?: string;
    location?: { lat: number, lng: number };
}

interface DigitalMenuContextProps {
    // UI State
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    activeTab: 'feed' | 'search' | 'orders' | 'profile';
    setActiveTab: (tab: 'feed' | 'search' | 'orders' | 'profile') => void;
    viewMode: 'LIST' | 'FEED' | 'GRID';
    setViewMode: (mode: 'LIST' | 'FEED' | 'GRID') => void;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;

    // Modals & Interstitials
    isCartOpen: boolean;
    setIsCartOpen: (val: boolean) => void;
    selectedProductForDetail: Product | null;
    setSelectedProductForDetail: (p: Product | null) => void;
    isAddressModalOpen: boolean;
    setIsAddressModalOpen: (val: boolean) => void;
    isUpsellOpen: boolean;
    setIsUpsellOpen: (val: boolean) => void;
    pendingAddition: CartItem | null;
    setPendingAddition: (item: CartItem | null) => void;
    commentProduct: Product | null;
    setCommentProduct: (p: Product | null) => void;
    activeOrderId: string | null;
    setActiveOrderId: (id: string | null) => void;

    // Data State
    user: DigitalMenuUser;
    setUser: (user: DigitalMenuUser) => void;
    updateUser: (updates: Partial<DigitalMenuUser>) => void;
    cart: CartItem[];
    setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    appliedCoupon: Coupon | null;
    setAppliedCoupon: (coupon: Coupon | null) => void;
    orderMode: OrderType;
    setOrderMode: (mode: OrderType) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;

    // Derived State
    cartTotal: number;
    cartCount: number;
}

const DigitalMenuContext = createContext<DigitalMenuContextProps | undefined>(undefined);

export const DigitalMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // UI State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'orders' | 'profile'>('feed');
    const [viewMode, setViewMode] = useState<'LIST' | 'FEED' | 'GRID'>('FEED');
    const [activeCategory, setActiveCategory] = useState('Destaques');

    // Modals
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isUpsellOpen, setIsUpsellOpen] = useState(false);
    const [pendingAddition, setPendingAddition] = useState<CartItem | null>(null);
    const [commentProduct, setCommentProduct] = useState<Product | null>(null);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

    // Data
    const [user, setUser] = useState<DigitalMenuUser>(() => {
        const stored = localStorage.getItem('summo_customer_profile');
        return stored ? JSON.parse(stored) : { name: '', phone: '', address: '' };
    });

    const [cart, setCart] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem('summo_customer_cart');
        console.log('DEBUG: Context initializing cart. Stored:', stored);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('summo_customer_cart', JSON.stringify(cart));
    }, [cart]);
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [orderMode, setOrderMode] = useState<OrderType>(OrderType.DELIVERY);
    const [paymentMethod, setPaymentMethod] = useState('');

    const updateUser = (updates: Partial<DigitalMenuUser>) => {
        setUser(prev => {
            const newUser = { ...prev, ...updates };
            localStorage.setItem('summo_customer_profile', JSON.stringify(newUser));
            return newUser;
        });
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price = item.product.channels?.find(c => c.channel === 'digital-menu')?.price || item.product.cost;
            const optionsPrice = item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;
            return sum + (price + optionsPrice) * item.quantity;
        }, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const value = useMemo(() => ({
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
    }), [
        isDarkMode, activeTab, viewMode, activeCategory, isCartOpen,
        selectedProductForDetail, isAddressModalOpen, isUpsellOpen,
        pendingAddition, commentProduct, activeOrderId, user, cart,
        searchTerm, appliedCoupon, orderMode, paymentMethod, cartTotal, cartCount
    ]);

    return (
        <DigitalMenuContext.Provider value={value}>
            {children}
        </DigitalMenuContext.Provider>
    );
};

export const useDigitalMenuContext = () => {
    const context = useContext(DigitalMenuContext);
    if (!context) {
        throw new Error('useDigitalMenuContext must be used within a DigitalMenuProvider');
    }
    return context;
};
