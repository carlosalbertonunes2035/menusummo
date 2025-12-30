import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Order, Product, SalesChannel, ChannelConfig } from "../types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const normalizeText = (text: string) => {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents. 'Medalhão' -> 'medalhao'
        .replace(/ñ/g, "n")               // Spanish ñ -> n
        .replace(/ll/g, "l")               // Spanish ll -> l
        .replace(/lh/g, "l")               // Portuguese lh -> l
        .replace(/ao/g, "o")               // Portuguese ão -> o
        .replace(/on/g, "o")               // Spanish ón -> o
        .replace(/h/g, "")                 // Remove 'h' for common typos (brahma -> brama)
        .replace(/[^a-z0-9]/g, "");        // Remove all special chars/spaces for raw comparison
};

export const searchMatch = (text: string, query: string) => {
    if (!query) return true;
    if (!text) return false;

    const normText = normalizeText(text);
    const normQuery = normalizeText(query);

    // If exact normalized match or contains
    if (normText.includes(normQuery)) return true;

    // Partial word segment matching (e.g., 'kaf tra' -> 'kafta tradicional')
    const queryParts = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").filter(Boolean);
    const textWords = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").filter(Boolean).map(w => w.replace(/h/g, ""));

    return queryParts.every(part => {
        const p = part.replace(/h/g, "");
        return textWords.some(word => word.startsWith(p) || word.includes(p));
    });
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const generateWhatsAppLink = (phone: string, customer: string, address: string, eta: string) => {
    const msg = `Olá ${customer}! 👋 Seu pedido está a caminho.\n\n📍 Endereço: ${address}\n⏱️ Previsão: ${eta}\n\nObrigado pela preferência!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};

export const generateGoogleMapsRouteLink = (origin: string, destinations: string[]) => {
    if (destinations.length === 0) return '';
    const encodedOrigin = encodeURIComponent(origin);
    const finalDest = destinations[destinations.length - 1];
    const encodedFinalDest = encodeURIComponent(finalDest);
    const waypoints = destinations.slice(0, -1);
    const encodedWaypoints = waypoints.map(d => encodeURIComponent(d)).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedFinalDest}`;
    if (waypoints.length > 0) {
        url += `&waypoints=${encodedWaypoints}`;
    }
    return url;
};

export const generateDriverManifest = (driverName: string, orders: Order[], mapLink: string) => {
    let msg = `🛵 *Rota de Entrega - ${driverName}*\n\n`;
    orders.forEach((order, index) => {
        msg += `*${index + 1}. ${order.customerName}*\n`;
        msg += `📍 ${order.deliveryAddress}\n`;
        msg += `📦 Pedido #${order.id.slice(-4)}\n\n`;
    });
    msg += `🗺️ *Link da Rota Otimizada:*\n${mapLink}\n\n`;
    msg += `Bom trabalho! 💪`;
    return msg;
};

export const getProductChannel = (product: Product, channel: SalesChannel = 'digital-menu'): ChannelConfig => {
    const specificConfig = product.channels.find(c => c.channel === channel);

    // MENU STUDIO IS ROOT: Prioritize root fields, use specificConfig as override
    return {
        channel: channel,
        price: specificConfig?.price || 0,
        promotionalPrice: specificConfig?.promotionalPrice || 0,
        isAvailable: specificConfig?.isAvailable ?? true,
        displayName: (specificConfig?.displayName && specificConfig.displayName.trim() !== '') ? specificConfig.displayName : product.name,
        description: (specificConfig?.description && specificConfig.description.trim() !== '') ? specificConfig.description : (product.description || ''),
        image: (specificConfig?.image && specificConfig.image.trim() !== '') ? specificConfig.image : (product.image || ''),
        videoUrl: specificConfig?.videoUrl || '',
        category: (specificConfig?.category && specificConfig.category.trim() !== '') ? specificConfig.category : (product.category || ''),
        sortOrder: specificConfig?.sortOrder
    };
};

/**
 * SMART RAG ALGORITHM
 * Filters products locally to create a "Small Context" window for the LLM.
 */
export const filterRelevantProducts = (text: string, products: Product[], limit: number = 15): Product[] => {
    if (!text || !text.trim()) return products.slice(0, limit);

    const terms = normalizeText(text).split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return products.slice(0, limit);

    const scored = products.map(p => {
        let score = 0;
        const channel = p.channels.find(c => c.channel === 'pos') || p.channels[0];
        const normName = normalizeText(p.name);
        const normDesc = normalizeText(channel?.description || '');
        const normCat = normalizeText(p.category);

        terms.forEach(term => {
            if (normName.includes(term)) score += 10;
            else if (normCat.includes(term)) score += 5;
            else if (normDesc.includes(term)) score += 1;
        });

        return { product: p, score };
    });

    const relevant = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.product);

    if (relevant.length < 5) {
        const others = products.filter(p => !relevant.includes(p)).slice(0, limit - relevant.length);
        return [...relevant, ...others];
    }

    return relevant.slice(0, limit);
};

// --- GEOMETRY & LOCAL TSP ALGORITHMS (No AI Cost) ---

/**
 * Calculates distance between two coordinates in km (Haversine Formula)
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

/**
 * Local Nearest Neighbor Algorithm to sort locations.
 * Much faster and cheaper than calling an LLM for route optimization.
 */
export const solveTSPLocal = (origin: { lat: number, lng: number }, destinations: { id: string, lat: number, lng: number }[]) => {
    const sortedIds: string[] = [];
    let currentLocation = origin;
    const remaining = [...destinations];

    while (remaining.length > 0) {
        let nearestIdx = -1;
        let minDist = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const dist = getDistanceFromLatLonInKm(
                currentLocation.lat, currentLocation.lng,
                remaining[i].lat, remaining[i].lng
            );
            if (dist < minDist) {
                minDist = dist;
                nearestIdx = i;
            }
        }

        if (nearestIdx !== -1) {
            sortedIds.push(remaining[nearestIdx].id);
            currentLocation = remaining[nearestIdx]; // Move to next stop
            remaining.splice(nearestIdx, 1);
        } else {
            break;
        }
    }

    return sortedIds;
};

/**
 * Format date to Brazilian format
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'time') {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    }

    if (format === 'long') {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
};

/**
 * Format phone number to Brazilian format
 */
export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
};

/**
 * Generate table QR Code URL
 */
export function generateTableQRCodeURL(
    tenantSlug: string,
    tableNumber: string
): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://summo.app';
    return `${baseUrl}/m/${tenantSlug}/mesa/${tableNumber}`;
}

/**
 * Generate PDV payment code
 */
export function generatePDVCode(tableNumber: string): string {
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `M${tableNumber}-${timestamp}`;
}


