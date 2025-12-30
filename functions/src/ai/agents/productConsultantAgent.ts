import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * Product Consultant Agent
 * Role: Analyze products and provide actionable insights for restaurant owners
 */

// Schemas for structured outputs
const PricingInsightSchema = z.object({
    type: z.literal('pricing'),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    message: z.string(),
    confidence: z.number().min(0).max(1),
    suggestedAction: z.object({
        label: z.string(),
        value: z.number()
    }).optional()
});

const DescriptionInsightSchema = z.object({
    type: z.literal('description'),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    message: z.string(),
    confidence: z.number().min(0).max(1),
    suggestedAction: z.object({
        label: z.string(),
        value: z.string()
    }).optional()
});

const PhotoInsightSchema = z.object({
    type: z.literal('photo'),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    message: z.string(),
    confidence: z.number().min(0).max(1)
});

/**
 * Analyze product pricing
 */
export async function analyzePricing(
    productName: string,
    price: number,
    cost: number,
    category: string,
    restaurantType: string = 'Espetaria'
) {
    console.log(`[ProductConsultant] 💰 Analisando preço de: ${productName}`);

    const margin = cost > 0 ? ((price - cost) / price * 100) : 0;

    const prompt = `
        VOCÊ É UM CONSULTOR ESPECIALIZADO EM FOOD SERVICE NO BRASIL.
        
        ESTABELECIMENTO: ${restaurantType}
        PRODUTO: ${productName}
        CATEGORIA: ${category}
        PREÇO DE VENDA: R$ ${price.toFixed(2)}
        CUSTO: R$ ${cost.toFixed(2)}
        MARGEM ATUAL: ${margin.toFixed(1)}%
        
        SUA TAREFA:
        1. Compare este preço com a média de mercado para ${restaurantType} no Brasil
        2. Analise se a margem está saudável (ideal: 60-70% para food service)
        3. Se o preço estiver muito baixo ou muito alto, sugira um ajuste
        
        REGRAS:
        - Seja DIRETO e ACIONÁVEL
        - Use dados de mercado reais do Brasil (2024/2025)
        - Prioridade: 'low' se está ok, 'medium' se pode melhorar, 'high' se está crítico
        - Confidence: 0-1 (baseado na certeza da análise)
        
        RETORNE JSON NO SCHEMA DEFINIDO.
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: { schema: PricingInsightSchema },
        config: { temperature: 0.3 }
    });

    return result.output;
}

/**
 * Suggest product description
 */
export async function suggestDescription(
    productName: string,
    category: string,
    currentDescription: string | undefined,
    restaurantType: string = 'Espetaria'
) {
    console.log(`[ProductConsultant] ✨ Sugerindo descrição para: ${productName}`);

    const prompt = `
        VOCÊ É UM COPYWRITER ESPECIALIZADO EM CARDÁPIOS DIGITAIS.
        
        ESTABELECIMENTO: ${restaurantType}
        PRODUTO: ${productName}
        CATEGORIA: ${category}
        DESCRIÇÃO ATUAL: ${currentDescription || 'Sem descrição'}
        
        SUA TAREFA:
        1. Se não há descrição, crie uma descrição atrativa e apetitosa
        2. Se há descrição, sugira melhorias para aumentar conversão
        3. Use linguagem que vende (gatilhos sensoriais, benefícios)
        
        REGRAS:
        - Máximo 100 caracteres
        - Foque em BENEFÍCIOS e SENSAÇÕES, não apenas ingredientes
        - Use adjetivos que despertem desejo (suculento, crocante, especial, artesanal)
        - Prioridade: 'low' se já tem boa descrição, 'medium' se pode melhorar, 'high' se não tem
        
        EXEMPLOS:
        ❌ "Espeto de carne com sal"
        ✅ "Espeto de picanha suculenta com tempero especial da casa"
        
        RETORNE JSON NO SCHEMA DEFINIDO.
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: { schema: DescriptionInsightSchema },
        config: { temperature: 0.7 } // Mais criativo para copywriting
    });

    return result.output;
}

/**
 * Check product completeness (photo, description, etc)
 */
export async function checkCompleteness(
    productName: string,
    hasPhoto: boolean,
    hasDescription: boolean
) {
    console.log(`[ProductConsultant] 📸 Verificando completude de: ${productName}`);

    const insights: any[] = [];

    // Photo check
    if (!hasPhoto) {
        const prompt = `
            VOCÊ É UM CONSULTOR DE MARKETING DIGITAL PARA RESTAURANTES.
            
            PRODUTO: ${productName}
            STATUS: Sem foto
            
            SUA TAREFA:
            Crie um alerta persuasivo sobre a importância de adicionar foto ao produto.
            
            REGRAS:
            - Seja DIRETO e mostre o IMPACTO (ex: "Produtos com foto vendem 3x mais")
            - Prioridade: 'high' (foto é crítica para conversão)
            - Confidence: 0.95 (dados comprovados)
            
            RETORNE JSON NO SCHEMA DEFINIDO.
        `;

        const result = await ai.generate({
            model: MODELS.fast,
            prompt,
            output: { schema: PhotoInsightSchema },
            config: { temperature: 0.2 }
        });

        insights.push(result.output);
    }

    return insights;
}
