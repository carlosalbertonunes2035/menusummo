import { Product, ChannelConfig } from './types';

export function getProductChannel(product: Product, channel: 'pos' | 'digital-menu' | 'ifood'): ChannelConfig {
    const channelConfig = product.channels?.find(c => c.channel === channel);

    if (channelConfig) {
        return channelConfig;
    }

    // Fallback to default channel config
    return {
        channel,
        isAvailable: true,
        price: product.price,
        displayName: product.name,
        description: product.description,
        image: product.image,
    };
}

export function getProductImage(product: Product): string {
    const digitalMenuChannel = product.channels?.find(c => c.channel === 'digital-menu');
    return digitalMenuChannel?.image || product.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(product.name);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
