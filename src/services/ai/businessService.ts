import { getGenAIClient, getFromCache, setInCache } from "./core";

export const getProfitabilityInsights = async (data: {
    products: any[],
    orders: any[],
    expenses: any[]
}): Promise<string[]> => {
    const ai = getGenAIClient();
    if (!ai) return [];

    const productSummary = data.products.map(p => `${p.name}: Margem ${p.marginPercent?.toFixed(0)}%`).join(', ');
    const revenue = data.orders.reduce((acc, o) => acc + o.total, 0);
    const expenseTotal = data.expenses.reduce((acc, e) => acc + e.amount, 0);

    const cacheKey = `profitability_insights_${data.products.length}_${data.orders.length}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{
                role: 'user',
                parts: [{
                    text: `
            DADOS DO NEGÓCIO:
            - Receita Recente: R$ ${revenue}
            - Despesas Totais: R$ ${expenseTotal}
            - Performance Produtos: ${productSummary}

            Você é o "Conselheiro SUMMO", um especialista financeiro focado em lucro líquido.
            
            REGRAS DE OURO:
            1. MARGEM DE SEGURANÇA: Só alerte sobre flutuações de custo se o impacto no CMV do produto for > 15% ou se a margem cair abaixo de 30%. Evite ruído desnecessário.
            2. IMPACTO NO CMV: Sempre cite o impacto estimado no CMV total (ex: "Isso aumentou seu custo médio de venda em 2%").
            3. FOCO: Retorne 3 dicas CURTAS e IMPACTANTES.
            
            Retorne um array JSON de strings. Caso não haja alertas críticos, sugira mimos aos clientes VIPs ou estratégias de upsell.
            `
                }]
            }]
        });
        // @ts-ignore - SDK Pattern for @google/genai
        const responseText = typeof result.text === 'function' ? result.text() : (result.text || "");
        const parsed = JSON.parse(responseText || "[]");
        setInCache(cacheKey, parsed);
        return parsed;
    } catch (e) {
        console.error("AI Financial Insight Error", e);
        return ["Revise seus custos de ingredientes este mês.", "Foque em vender mais produtos com margem acima de 50%."];
    }
};

export const getRetentionLoyaltyInsights = async (customers: any[]): Promise<any[]> => {
    const ai = getGenAIClient();
    if (!ai) return [];

    try {
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{
                role: 'user',
                parts: [{
                    text: `
            LISTA DE CLIENTES:
            ${customers.map(c => `- ${c.name} (Último pedido: ${c.lastOrderDate}, Total: ${c.totalOrders})`).join('\n')}

            Identifique os 3 clientes com maior risco de "churn" (sumidos há mais tempo que eram recorrentes).
            Retorne JSON array: [{ name, reason, whatsappDrip }]. 
            whatsappDrip é uma mensagem curta e amigável para enviar pelo WhatsApp.
            `
                }]
            }]
        });
        // @ts-ignore - SDK Pattern for @google/genai
        const responseText = typeof result.text === 'function' ? result.text() : (result.text || "");
        return JSON.parse(responseText || "[]");
    } catch (e) { return []; }
};
