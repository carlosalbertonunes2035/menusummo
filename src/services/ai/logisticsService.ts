import { Type } from "@google/genai";
import { solveTSPLocal } from "../../lib/utils";
import { getGenAIClient } from "./core";

export const getDeliveryRouteInfo = async (origin: string, destination: string) => {
    const ai = getGenAIClient();
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Calculate route from "${origin}" to "${destination}". Return JSON with numeric "distanceKm" and string "duration".`,
            config: {
                tools: [{ googleMaps: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        distanceKm: { type: Type.NUMBER },
                        duration: { type: Type.STRING }
                    }
                }
            },
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Route calculation error:", e);
        return null; // Return null on failure
    }
};

export const calculateShippingFee = async (origin: string, destination: string, settings: any): Promise<{ distance: number, fee: number, duration: string }> => {
    try {
        const routeData = await getDeliveryRouteInfo(origin, destination);

        // Fallback or data missing
        if (!routeData || typeof routeData.distanceKm !== 'number') {
            return { distance: 0, fee: settings.delivery.baseFee, duration: '' };
        }

        const distance = routeData.distanceKm;
        const duration = routeData.duration || '';

        let fee = settings.delivery.baseFee;
        const pricePerExtraKm = settings.delivery.pricePerKm || 1.50;

        if (distance > settings.delivery.deliveryRadius) {
            const extraKm = distance - settings.delivery.deliveryRadius;
            fee += extraKm * pricePerExtraKm;
        }

        return {
            distance,
            fee: parseFloat(fee.toFixed(2)),
            duration
        };
    } catch (e) {
        console.error("Error calculating fee:", e);
        return { distance: 0, fee: settings.delivery.baseFee, duration: '' };
    }
};

export const searchAddress = async (query: string) => {
    const ai = getGenAIClient();
    if (!ai) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Search location: "${query}". Return 5 matches JSON.`,
            config: {
                tools: [{ googleMaps: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            formattedAddress: { type: Type.STRING },
                            mainText: { type: Type.STRING },
                            secondaryText: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                        }
                    }
                }
            },
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const optimizeDeliveryRoute = async (
    origin: string,
    destinations: string[],
    knownCoordinates?: { id: string, lat: number, lng: number }[],
    originCoords?: { lat: number, lng: number }
) => {
    if (originCoords && knownCoordinates && knownCoordinates.length === destinations.length) {
        const optimizedIds = solveTSPLocal(originCoords, knownCoordinates);
        const optimizedSequence = optimizedIds.map(id => knownCoordinates.findIndex(c => c.id === id) + 1);
        return {
            optimizedSequence,
            totalEstimatedTime: "Calculado localmente",
            summary: "Rota otimizada por proximidade (Algoritmo Local)"
        };
    }

    const ai = getGenAIClient();
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Optimize route starting at "${origin}" to visit: ${destinations.join('; ')}. Return JSON {optimizedSequence: [indices], summary}.`,
            config: {
                responseMimeType: "application/json",
                tools: [{ googleMaps: {} }],
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        optimizedSequence: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        summary: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { return null; }
};
