import { Type } from "@google/genai";
import { getGenAIClient, getFromCache, setInCache } from "./core";

export const generateSeoContent = async (storeName: string, productNames: string[]): Promise<{ description: string; keywords: string; }> => {
    const ai = getGenAIClient();
    if (!ai) return { description: 'Loja incrível com os melhores produtos.', keywords: 'delivery, comida, online' };

    const cacheKey = `seo_${storeName.replace(/\s/g, '')}_${productNames.length}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Generate SEO (description <160 chars, keywords list) for store "${storeName}". Products: ${productNames.slice(0, 5).join(', ')}. Portuguese.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        keywords: { type: Type.STRING }
                    },
                    required: ["description", "keywords"]
                }
            }
        });
        const parsed = JSON.parse(response.text || "{}");
        setInCache(cacheKey, parsed);
        return parsed;
    } catch (e) {
        return { description: '', keywords: '' };
    }
};

export const generateSocialMediaContent = async (context: string) => {
    const ai = getGenAIClient();
    if (!ai) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ideas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ["STORY", "FEED", "REELS"] },
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            },
            contents: `Social media ideas for food biz based on: "${context}".`,
        });
        const json = JSON.parse(response.text || "{}");
        return json.ideas || [];
    } catch (e) { return []; }
};

export const generateWeeklyPlan = async (products: string[], brandName: string, days: number = 7) => {
    const ai = getGenAIClient();
    if (!ai) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING },
                            focus: { type: Type.STRING },
                            hook: { type: Type.STRING },
                            caption: { type: Type.STRING },
                            imageSuggestion: { type: Type.STRING },
                            format: { type: Type.STRING, enum: ["STORY", "FEED", "REELS"] }
                        },
                        required: ["day", "focus", "hook", "caption", "imageSuggestion", "format"]
                    }
                }
            },
            contents: `Create ${days}-day content plan for "${brandName}". Products: ${products.join(', ')}.`,
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const generateMarketingCopy = async (productName: string, ingredientsList: string) => {
    const ai = getGenAIClient();
    if (!ai) return "Delicioso e fresco.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Write iFood description for "${productName}" (${ingredientsList}). Portuguese. Max 140 chars.`
        });
        return response.text || "";
    } catch (e) { return ""; }
};
