/**
 * SUMMO AI Configuration
 * Centralized Vertex AI / Genkit configuration (FUTURE-PROOF)
 */
import { genkit } from 'genkit';
import { vertexAI, gemini15Flash, gemini15Pro } from '@genkit-ai/vertexai';

// Initialize Genkit with Vertex AI (Production)
export const ai = genkit({
    plugins: [
        vertexAI({
            location: 'us-central1',
            projectId: 'menusummo-prod',
        })
    ],
    // Padrão estável para a maioria das operações
    model: gemini15Flash,
});

/**
 * SUMMO Model Strategy (A, B, C)
 * Centralized model identifiers for easy swapping and future-proofing.
 */
export const MODELS = {
    // A. O Cérebro dos Agentes (Rápido e Preciso)
    fast: 'vertexai/gemini-2.0-flash-001',

    // B. O Conselheiro Financeiro Profundo (Cadeia de Pensamento)
    thinking: 'vertexai/gemini-2.0-flash-thinking-exp',

    // C. O Plano B / Fallback de Alta Precisão
    pro: gemini15Pro,

    // Padrão Estável
    stable: gemini15Flash,
};

// Model configuration for different use cases
export const AI_CONFIG = {
    defaultTemperature: 0.3,
    maxOutputTokens: 2048,

    // Token economy thresholds
    maxPromptLength: 1000,
    maxItemsPerBatch: 20,

    // Cache settings
    cacheTTL: 24 * 60 * 60 * 1000,
};

// System prompts (reusable)
export const SYSTEM_PROMPTS = {
    recipeEngineer: `Você é o Engenheiro de Custos da SUMMO, sistema de gestão de lucro para restaurantes brasileiros.
Sempre retorne JSON válido. Use preços de atacado do Brasil.`,

    profitAdvisor: `Você é o Conselheiro de Lucro SUMMO. 
Use sua capacidade de raciocínio profundo para analisar dados e dar conselhos estratégicos.`,

    menuAnalyst: `Você é o Analista de Cardápio SUMMO. 
Identifique produtos lucrativos e gaps de preço.`,
};
