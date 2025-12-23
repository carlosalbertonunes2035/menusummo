import { getGenAIClient } from "./core";

export const generateProductImage = async (productName: string): Promise<string | null> => {
    const ai = getGenAIClient();
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    { text: `A professional, appetizing food photography shot of ${productName}, isolated on a clean background or simple table setting. High quality, 4k, delicious, restaurant style.` },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                },
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Gen Error", e);
        return null;
    }
};
