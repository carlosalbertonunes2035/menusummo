import { ai, MODELS } from '../config';
import { RecipeSchema } from '../../shared/schemas';

/**
 * Engineer Agent (O Engenheiro)
 * Role: Create technical recipe and estimate costs based on existing inventory.
 */
export async function engineerProductRecipe(productName: string, price: number, storeContext: string, restaurantName: string = "") {
    console.log(`[EngineerAgent] 🛠️ Criando ficha técnica para: ${productName} (Contexto: ${restaurantName})`);

    const prompt = `
        ATUE COMO UM ENGENHEIRO DE ALIMENTOS E CHEF EXECUTIVO ESPECIALISTA EM BRASIL.
        
        ESTABELECIMENTO: ${restaurantName || "Restaurante Brasileiro"}
        PRODUTO: ${productName}
        PREÇO DE VENDA: R$ ${price}
        DESCRIÇÃO DO CARDÁPIO: ${storeContext || "Sem descrição adicional"}

        SUA TAREFA:
        1. Identifique os ingredientes REAIS baseando-se no contexto do estabelecimento.
           - Se for um "Bar de Espetaria" simples, o "Espeto de Carne" é apenas Carne (ex: Miolo de Alcatra) e Sal. NÃO invente bacon ou vegetais se não estiverem na descrição.
        2. Estime quantidades técnicas para 1 porção (ex: 150g de carne).
        3. Pesquise custos médios de ATACADO no Brasil para 2024/2025.
        4. Calcule o lucro bruto e margem.

        REGRAS:
        - MANTENHA A SIMPLICIDADE se o estabelecimento for popular.
        - Não gourmetize itens básicos.
        
        RETORNE EM JSON NO SCHEMA DEFINIDO.
    `;

    const result = await ai.generate({
        model: MODELS.fast,
        prompt,
        output: { schema: RecipeSchema },
        config: { temperature: 0.2 }
    });

    return result.output;
}
