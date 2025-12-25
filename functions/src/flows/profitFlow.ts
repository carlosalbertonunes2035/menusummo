/**
 * SUMMO Profit Advisor Flow
 * Uses Gemini 2.0 Flash Thinking for deep financial analysis
 */
import { onCall } from 'firebase-functions/v2/https';
import { ai, MODELS, SYSTEM_PROMPTS } from '../ai/config';
import { z } from 'genkit';

const ProfitAnalysisSchema = z.object({
    analysis: z.string().describe('Análise detalhada da situação financeira'),
    recommendations: z.array(z.string()).describe('Lista de recomendações práticas'),
    potentialImpact: z.string().describe('Impacto estimado no lucro (ex: +15%)'),
});

export const getProfitInsights = onCall({
    memory: '1GiB',
    timeoutSeconds: 300,
    region: 'southamerica-east1',
}, async (request) => {
    if (!request.auth) {
        throw new Error('Não autorizado');
    }

    const { data } = request.data;

    const response = await ai.generate({
        model: MODELS.thinking, // Gemini 2.0 Flash Thinking
        system: SYSTEM_PROMPTS.profitAdvisor,
        prompt: `Analise os seguintes dados do restaurante e identifique oportunidades de lucro:
        ${JSON.stringify(data)}`,
        output: { schema: ProfitAnalysisSchema },
        config: { temperature: 0.2 }
    });

    return response.output;
});
