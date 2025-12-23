import { GoogleGenAI } from "@google/genai";
import { logger } from "@/lib/logger";

// --- API KEY SAFEGUARD & DYNAMIC LOADING ---
export const getGenAIClient = () => {
    try {
        const tenantId = localStorage.getItem('summo_active_tenant') || '';
        const storedSettings = localStorage.getItem(`summo_db_settings_${tenantId}`);
        let key = import.meta.env.VITE_GEMINI_API_KEY;

        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (settings.ai?.apiKey) {
                key = settings.ai.apiKey;
            }
        }

        if (!key || key === 'undefined') {
            logger.warn("AI Key Missing");
            return null;
        }
        return new GoogleGenAI({ apiKey: key });
    } catch (e) {
        logger.error("Error initializing GenAI client", e);
        return null;
    }
};

// --- CACHE LAYER ---
const CACHE_PREFIX = 'summo_ai_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Hours

export const getFromCache = (key: string) => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() > parsed.expiry) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return parsed.value;
    } catch { return null; }
};

export const setInCache = (key: string, value: any) => {
    try {
        const item = { value, expiry: Date.now() + CACHE_TTL };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
        logger.warn('Cache storage failed', e as Error);
    }
};
