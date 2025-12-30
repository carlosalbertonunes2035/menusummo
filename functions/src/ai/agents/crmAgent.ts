import { ai, MODELS } from '../config';
import { z } from 'genkit';

/**
 * CRM Agent (O Especialista em Retenção)
 * Role: Analyse customer data and suggest retention strategies.
 */
export async function getRetentionLoyaltyInsights(customers: any[]) {
    console.log(`[CRMAgent] 👥 Analisando ${customers.length} clientes para retenção.`);

    // Simplified customer data for context (Limit to Top 5 to prevent token overflow)
    const recentCustomers = customers.slice(0, 5);

    const customerContext = recentCustomers.map(c => ({
        name: c.name,
        totalOrders: c.totalOrders,
        lastOrderDate: c.lastOrderDate,
        totalSpent: c.totalSpent
    }));

    const prompt = `
        ATUE COMO UM ESPECIALISTA EM CRM E FIDELIZAÇÃO.
        
        DADOS DOS CLIENTES:
        ${JSON.stringify(customerContext)}

        SUA TAREFA:
        1. Analise a lista e identifique 3 clientes que merecem atenção IMEDIATA (seja por risco de churn ou oportunidade de fidelização).
        2. Para cada um, explique o motivo (ex: "Sumiu há 40 dias", "Comprou muito bem mas parou").
        3. Crie uma mensagem curta de WhatsApp personalizada para recuperá-lo ou engajá-lo.
        
        RETORNE EM JSON (Array com max 3 itens):
        [
          { "name": "Nome Cliente", "reason": "Motivo curto", "whatsappDrip": "Mensagem zap" }
        ]
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: {
            format: 'json',
            schema: z.array(z.object({
                name: z.string(),
                reason: z.string(),
                whatsappDrip: z.string()
            }))
        },
        config: { temperature: 0.5 }
    });

    return result.output;
}
