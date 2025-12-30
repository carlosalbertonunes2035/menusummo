// Shared Product Types
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    videoUrl?: string;
    category?: string;
    slug?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
    tags?: string[];
    likes?: number;
    tenantId?: string;
    channels?: ChannelConfig[];
}

export interface ChannelConfig {
    channel: 'pos' | 'digital-menu' | 'ifood';
    isAvailable: boolean;
    price?: number;
    promotionalPrice?: number;
    displayName?: string;
    description?: string;
    image?: string;
    videoUrl?: string;
    category?: string;
}

export interface Settings {
    brandName?: string;
    logoUrl?: string;
    slug?: string;
    digitalMenu?: {
        layout?: 'FEED' | 'GRID' | 'LIST';
        showComments?: boolean;
        showShare?: boolean;
        categories?: Record<string, { displayName?: string; image?: string }>;
        branding?: {
            promoBanners?: Array<{ image: string; link?: string }>;
            bannerRotationSeconds?: number;
        };
    };
    loyalty?: {
        enabled?: boolean;
        pointsPerCurrency?: number;
        branding?: {
            name?: string;
        };
    };
}
