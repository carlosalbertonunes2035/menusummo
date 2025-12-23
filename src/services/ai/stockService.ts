import { Type } from "@google/genai";
import { getGenAIClient } from "./core";

export const analyzeBulkReceipt = async (base64Data: string, mimeType: string) => {
    const ai = getGenAIClient();
    if (!ai) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType: mimeType } },
                    {
                        text: `You are an expert accountant. Analyze this invoice/receipt image and extract all line items. 
                    For each item, identify:
                    1. rawName: The name of the product as written.
                    2. quantity: The amount purchased.
                    3. totalCost: The total price for that specific item line.
                    4. unit: The unit of measure (kg, l, un, cx, etc.).
                    
                    Return ONLY a JSON array: [{rawName, quantity, totalCost, unit}].
                    Do not include shipping, taxes, or discounts as items.
                    Language: Portuguese.` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rawName: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            totalCost: { type: Type.NUMBER },
                            unit: { type: Type.STRING }
                        },
                        required: ["rawName", "quantity", "totalCost"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error("AI Analysis Error:", e);
        return [];
    }
};
