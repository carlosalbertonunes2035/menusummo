import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * Logistics Agent (O Entregador Inteligente)
 * Role: Optimize routes and calculate fees.
 */

export async function calculateShippingFee(origin: string, destination: string, settings: any) {
    console.log(`[LogisticsAgent] 🚚 Calculando frete: ${origin} -> ${destination}`);

    // Since we don't have Google Maps Distance Matrix configured in this specific agent file yet,
    // we will use the AI to "Estimate" based on context (or purely mock for now if we want to be safe).
    // Ideally, this should call Google Maps. For now, we'll let the AI estimate distance based on known data or return a standard fee logic.
    // BUT user asked to replace "services/api".
    // Let's make the AI define the fee based on an "AI Estimation" or simply use the logic provided in settings.

    // Simplification: We ask AI to estimate distance textually if it knows the locations (it's smart enough for big cities)
    // or just return a fallback.

    const prompt = `
        ATUE COMO UM GESTOR DE LOGÍSTICA.
        
        ORIGEM: ${origin}
        DESTINO: ${destination}
        REGRAS DE PREÇO:
        - Base: R$ ${settings.delivery?.baseFee || 5.00}
        - Por KM: R$ ${settings.delivery?.kmFee || 1.50}

        SUA TAREFA:
        1. Estime a distância aproximada de carro entre os endereços (Seja realista).
        2. Calcule a taxa de entrega baseada na distância estimada e nas regras.
        3. Estime o tempo de entrega (preparo + trajeto).
        
        RETORNE EM JSON:
        { "fee": 10.50, "distance": 3.5, "duration": "30-40 min" }
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.object({
                fee: z.number(),
                distance: z.number(),
                duration: z.string()
            })
        },
        config: { temperature: 0.1 }
    });

    return result.output;
}

export async function optimizeDeliveryRoute(origin: string, destinations: string[]) {
    console.log(`[LogisticsAgent] 🗺️ Otimizando rota para ${destinations.length} pontos.`);

    const prompt = `
        ATUE COMO UM OTIMIZADOR DE ROTAS.
        
        ORIGEM (PONTO DE PARTIDA E RETORNO): ${origin}
        DESTINOS (ENTREGAS):
        ${JSON.stringify(destinations)}

        SUA TAREFA:
        1. Ordene os destinos para criar a rota mais eficiente (menor tempo/distância total).
        2. Crie um resumo curto explicando a lógica (ex: "Rota zona norte primeiro").
        
        RETORNE EM JSON:
        { 
            "optimizedSequence": [1, 3, 2], // Índices baseados na lista original (1-based ou 0-based? Vamos usar index original do array 0-based)
            // Wait, schema below defines array of numbers. Let's assume indices 0-based.
            "summary": "Explicação curta"
        }
    `;

    const result = await ai.generate({
        model: MODELS.thinking, // Use thinking model for routing logic
        prompt,
        output: {
            format: 'json',
            schema: z.object({
                optimizedSequence: z.array(z.number()),
                summary: z.string()
            })
        },
        config: { temperature: 0.2 }
    });

    return result.output;
}

export async function getDeliveryRouteInfo(origin: string, destination: string) {
    // Generates a textual description of the route or traffic quirks
    const prompt = `
        ATUE COMO UM GUIA DE TRÂNSITO LOCAL.
        ROTA: ${origin} para ${destination}.
        
        Descreva sucintamente o trajeto e possíveis pontos de atenção (trânsito, obras, etc) de forma genérica mas útil.
    `;
    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: { format: 'text' },
        config: { temperature: 0.7 }
    });

    return { text: result.text };
}
