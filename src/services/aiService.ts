import { StoreSettings } from '@/types';

// Mock response for now if API key is missing or to avoid complex API setup in this turn without validation
// But I will try to actually implement the fetch to Gemini API REST endpoint if key is present
// because using the SDK might break if I don't use the exact right import for the installed version.
// Safest bet for "Agentic Coding" is direct REST call or finding existing usage.
// Since no existing usage found, I will use direct fetch to https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface AIResponse {
    text: string;
}

export class AIService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error("Chave de API do Google (Gemini) não configurada.");
        }

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }] // Simple prompting
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Erro na API do Gemini');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error;
        }
    }

    async generateProductCopy(productName: string, productType: string, businessProfile: StoreSettings['businessProfile']): Promise<{ name: string, description: string }> {
        // Construct a rich prompt
        const context = businessProfile ? `
            Business Context:
            - Segment: ${businessProfile.segment || 'Gastronomia'}
            - Audience: ${businessProfile.targetAudience || 'Geral'}
            - Tone: ${businessProfile.toneOfVoice || 'Atraente'}
            - Highlights: ${businessProfile.highlights?.join(', ') || 'Qualidade'}
            - Story: ${businessProfile.description || ''}
        ` : '';

        const system = `
            You are an expert copywriter for a ${businessProfile?.segment || 'restaurant'} menu.
            Your goal is to create a premium, appetizing name and description for a product.
            
            ${context}

            The user will provide a basic internal name (e.g. "X-Burger").
            You must return a JSON object with:
            {
                "name": "The enhanced public name (e.g. 'Ultimate Smash Burger')",
                "description": "A mouth-watering description (max 180 chars) highlighting ingredients and flavor."
            }
            Output only valid JSON. Language: Portuguese (Brazil).
        `;

        const userPrompt = `Product: ${productName} (${productType})`;

        const result = await this.callGemini(system, userPrompt);

        try {
            // Clean markdown code blocks if any
            const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e) {
            // Fallback if JSON fails
            return {
                name: productName,
                description: result.slice(0, 150)
            };
        }
    }

    async analyzeBusinessStory(story: string): Promise<StoreSettings['businessProfile']> {
        const system = `
            Analyze the following business story and extract structured profile data.
            Output JSON only:
            {
                "segment": "Main business category",
                "targetAudience": "Primary audience",
                "toneOfVoice": "Suggested brand voice",
                "highlights": ["Tag1", "Tag2", "Tag3"]
            }
            Language: Portuguese (Brazil).
        `;

        const result = await this.callGemini(system, story);
        try {
            const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e) {
            return {
                description: story
            };
        }
    }
}
