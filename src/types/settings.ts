export interface SEO {
    title: string;
    description: string;
    keywords: string[];
}

export interface OnboardingState {
    step1_config: boolean;
    step2_product: boolean;
    step3_ingredient: boolean;
    step4_sale: boolean;
    isCompleted: boolean;
}

export interface Analytics {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    metaPixelId?: string;
}

export interface ScheduleDay {
    day: string;
    openTime: string; // aligned with SettingsForms.tsx
    closeTime: string; // aligned with SettingsForms.tsx
    isOpen: boolean;
}

export interface OrderModeItemConfig {
    enabled: boolean;
    minTime: number;
    maxTime: number;
}

export interface SchedulingConfig {
    enabled: boolean;
    maxDays: number;
    intervalMin: number;
    minLeadTime: number;
}

export interface OrderModeConfig {
    delivery: OrderModeItemConfig;
    takeout: OrderModeItemConfig;
    dineIn: OrderModeItemConfig;
    staff: OrderModeItemConfig;
    scheduling: SchedulingConfig;
}

export interface DigitalMenuSettings {
    layout?: 'FEED' | 'LIST' | 'GRID';
    showComments?: boolean;
    showShare?: boolean;
    branding?: {
        bannerRotationSeconds?: number;
        viewMode?: 'INSTAGRAM' | 'TRADITIONAL' | 'LIST';
        promoBanners?: PromoBanner[];
        primaryColor?: string;
        backgroundColor?: string;
    };
    categoryImages?: Record<string, string>; // Legacy
    // New Rich Configuration
    categories?: Record<string, {
        displayName?: string; // Public name vs Internal name
        image?: string;
        active?: boolean;
    }>;
}

export interface StoreSettings {
    brandName: string;
    unitName: string;
    logoUrl: string;
    company: {
        legalName: string;
        cnpj: string;
        phone: string;
        address: {
            zip: string;
            street: string;
            number: string;
            neighborhood: string;
            city: string;
            state: string;
            complement?: string;
        };
        location?: {
            lat: number;
            lng: number;
        };
    };
    address: string; // Plain text version for display
    storefront: {
        storeName: string;
        slug: string; // Unique URL slug (e.g., "my-store")
    };
    financial: {
        taxRate: number;
        fixedCostRate: number;
        packagingAvgCost: number;
    };
    schedule: ScheduleDay[];
    digitalMenu?: DigitalMenuSettings;
    delivery: {
        fees: { distance: number; fee: number }[];
        deliveryRadius: number; // aligned with geminiService.ts
        pricePerKm: number;    // decoupled from hardcoded service value
        minOrderValue: number;
        freeShippingThreshold: number;
        baseFee: number;
        active: boolean;
    };
    operation: {
        dineIn: boolean;
        takeout: boolean;
        delivery: boolean;
    };
    payment: {
        acceptCash: boolean;
        acceptPix: boolean;
        pixKey: string;
        pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
        acceptCard: boolean;
        brands: {
            visa: boolean;
            mastercard: boolean;
            elo: boolean;
            hipercard: boolean;
            amex: boolean;
        };
        acceptVouchers: boolean;
        vouchers: {
            alelo: boolean;
            sodexo: boolean;
            ticket: boolean;
            vr: boolean;
        };
        methods?: string[]; // Kept for legacy if needed
    };
    kitchen: {
        preparationTime: number;
        safetyBuffer: number;
    };
    orderModes: OrderModeConfig;
    integrations?: {
        google?: {
            apiKey: string;
            mapsEnabled: boolean;
            placesEnabled: boolean;
        };
        ifood?: {
            enabled: boolean;
            plan: 'BASICO' | 'ENTREGA';
            commissionRate: number;
            financialFee: number;
            autoAccept: boolean;
            autoPrint: boolean;
        };
    };
    seo?: SEO;
    analytics?: Analytics;
    printer: {
        agentStatus?: 'ONLINE' | 'OFFLINE';
        lastConnected?: Date;
        devices: PrinterDevice[];
    };
    ai: {
        isActive: boolean;
        apiKey: string;
        agentName: string;
        personality: 'Friendly' | 'Professional' | 'Funny';
        usageLimit?: number;
    };
    whatsapp: {
        number: string;
        isActive: boolean;
        messageTemplate: string;
    };
    // Novo: Contexto de Negócio para IA e Inteligência
    businessProfile?: {
        segment?: string; // e.g. 'Pizzaria', 'Hamburgueria'
        description?: string; // Breve descrição do negócio
        toneOfVoice?: string; // e.g. 'Descolado', 'Formal'
        targetAudience?: string; // e.g. 'Jovens', 'Família'
        highlights?: string[]; // e.g. ['Artesanal', 'Forno a Lenha']
    };
    interface?: {
        navigationMode?: 'SIDEBAR' | 'DOCK';
        theme?: 'LIGHT' | 'DARK';
        showReadyColumn?: boolean;
        categoryOrder?: string[];
    };
    dockItems?: string[];
    onboarding?: OnboardingState;
    lastSeedingAt?: string;
    [key: string]: any;
}

export interface PrinterDevice {
    id: string;
    name: string;
    systemName: string;
    paperWidth: '58mm' | '80mm';
    fontSize: 'NORMAL' | 'LARGE';
    printCopies: number;
    autoPrint: boolean;
    categoryIds: string[];
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: Date;
    dueDate?: Date;
    category: string;
    supplier?: string;
    isPaid: boolean;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
}



export interface Comment {
    id: string;
    productId: string; // Added property
    userId?: string;
    userName: string;
    text: string;
    rating?: number;
    createdAt: Date;
    likes?: number;
}

export interface ChecklistItem {
    id: string;
    label: string;
    category: 'OPENING' | 'STOCK_CHECK' | 'MAINTENANCE' | 'CLOSING';
    isCritical?: boolean;
    completed?: boolean;
    completedAt?: Date;
    completedBy?: string;
}

export interface FinancialCategory {
    id: string;
    name: string;
    type: 'EXPENSE' | 'INCOME';
}

export interface PromoBanner {
    id: string;
    title: string;
    text: string;
    imageUrl: string;
    linkedProductId?: string;
    enabled: boolean;
}

// Coupon moved to dedicated file

export interface Task {
    id: string;
    label: string;
    category: 'OPENING' | 'STOCK_CHECK' | 'MAINTENANCE' | 'CLOSING';
    isCritical?: boolean;
    completed?: boolean;
    completedAt?: Date;
    completedBy?: string;
}

export interface DailyLog {
    id: string;
    date: Date;
    notes: string;
    tasks: Task[];
    mood: 'GOOD' | 'NEUTRAL' | 'BAD';
}
