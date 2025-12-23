
import { Product } from '../../../types';

/**
 * Smart image mapping for products without explicitly uploaded photos.
 * Uses high-quality curated stock photos based on category and name keywords.
 */

const FALLBACK_BREAD = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_DRINK = 'https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_BEER = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_BURGER = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_STEAK = 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_BBQ = 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_FRIES = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_JUICE = 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_SWEET = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=400&h=400&auto=format&fit=crop';
const FALLBACK_CALDO = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400&h=400&auto=format&fit=crop';

const KEYWORD_MAP: Record<string, string> = {
    'espeto': FALLBACK_BBQ,
    'carne': FALLBACK_STEAK,
    'alcatra': FALLBACK_STEAK,
    'contra-filé': FALLBACK_STEAK,
    'batata': FALLBACK_FRIES,
    'frita': FALLBACK_FRIES,
    'cerveja': FALLBACK_BEER,
    'beer': FALLBACK_BEER,
    'heineken': FALLBACK_BEER,
    'skol': FALLBACK_BEER,
    'brahma': FALLBACK_BEER,
    'refri': FALLBACK_DRINK,
    'coca': FALLBACK_DRINK,
    'fanta': FALLBACK_DRINK,
    'suco': FALLBACK_JUICE,
    'laranja': FALLBACK_JUICE,
    'uva': FALLBACK_JUICE,
    'caipirinha': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&h=400&auto=format&fit=crop',
    'drink': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400&h=400&auto=format&fit=crop',
    'caldo': FALLBACK_CALDO,
    'mandioca': 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?q=80&w=400&h=400&auto=format&fit=crop', // Fried yucca style
    'queijo': 'https://images.unsplash.com/photo-1485962391905-fb3c42a1780e?q=80&w=400&h=400&auto=format&fit=crop',
    'pao de alho': FALLBACK_BREAD,
    'doce': FALLBACK_SWEET,
    'romeu': FALLBACK_SWEET
};

export const getProductImage = (product: Product): string => {
    // 1. Priority: Explicit digital-menu image override.
    const digitalChannel = product.channels.find(c => c.channel === 'digital-menu');
    if (digitalChannel?.image && digitalChannel.image.trim() !== '') return digitalChannel.image;

    // 2. ROOT IMAGE: Menu Studio source of truth
    if (product.image && product.image.trim() !== '') return product.image;

    // 3. Keyword based check on name as ultimate fallback (Safe Photos)
    const nameLower = product.name.toLowerCase();

    // Check for common keywords to provide professional context
    for (const [keyword, url] of Object.entries(KEYWORD_MAP)) {
        if (nameLower.includes(keyword)) return url;
    }

    // 4. Default generic fallback
    if (nameLower.includes('suco')) return FALLBACK_JUICE;
    if (nameLower.includes('cerveja')) return FALLBACK_BEER;

    return FALLBACK_BURGER;
};
