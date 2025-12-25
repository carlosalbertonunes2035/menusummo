import { onCall } from 'firebase-functions/v2/https';
import { engineerProductRecipe } from '../agents/engineerAgent';
import { generateProductMarketing } from '../agents/marketingAgent';

export const testAgentFlow = onCall({
    memory: '1GiB',
    timeoutSeconds: 540,
    region: 'southamerica-east1',
}, async (request) => {
    console.log('[TestFlow] 🚀 Iniciando simulação de 20 produtos...');

    const mockVisionItems = [
        { "name": "Picanha Black Angus", "price": 89.90, "categoryName": "Carnes Nobres", "originalDescription": "Acompanha arroz biro-biro e farofa." },
        { "name": "Risoto de Funghi", "price": 62.00, "categoryName": "Risotos", "originalDescription": "Arroz arbóreo, mix de cogumelos e parmesão." },
        { "name": "Polvo Grelhado", "price": 115.00, "categoryName": "Frutos do Mar", "originalDescription": "Com batatas ao murro e páprica defumada." },
        { "name": "Burrata Artesanal", "price": 54.00, "categoryName": "Entradas", "originalDescription": "Tomates cereja confitados e pesto de manjericão." },
        { "name": "Tartare de Salmão", "price": 48.00, "categoryName": "Entradas", "originalDescription": "Salmão fresco picado na ponta da faca." },
        { "name": "Burger de Costela", "price": 42.00, "categoryName": "Hambúrgueres", "originalDescription": "Queijo cheddar, cebola caramelizada e maionese defumada." },
        { "name": "Croquete de Cupim", "price": 38.00, "categoryName": "Petiscos", "originalDescription": "Porção com 6 unidades, acompanha geleia de pimenta." },
        { "name": "Ceviche Clássico", "price": 45.00, "categoryName": "Entradas", "originalDescription": "Tilápia marinada no limão com cebola roxa." },
        { "name": "Fettuccine Alfredo", "price": 58.00, "categoryName": "Massas", "originalDescription": "Creme de leite fresco e parmesão uruguaio." },
        { "name": "Filé Mignon ao Poivre", "price": 92.00, "categoryName": "Carnes Nobres", "originalDescription": "Molho de pimenta verde e batatas gratinadas." },
        { "name": "Salada Caesar com Camarão", "price": 65.00, "categoryName": "Saladas", "originalDescription": "Alface americana, croutons e camarões grelhados." },
        { "name": "Dadinhos de Tapioca", "price": 32.00, "categoryName": "Petiscos", "originalDescription": "Com melado de cana." },
        { "name": "Bolinho de Bacalhau", "price": 44.00, "categoryName": "Petiscos", "originalDescription": "6 unidades de bacalhau do porto." },
        { "name": "Yakisoba de Legumes", "price": 46.00, "categoryName": "Orientais", "originalDescription": "Macarrão selado com legumes da estação." },
        { "name": "Gnocchi da Nonna", "price": 55.00, "categoryName": "Massas", "originalDescription": "Molho pomodoro rústico e manjericão." },
        { "name": "Tacos de Pork Belly", "price": 39.00, "categoryName": "Petiscos", "originalDescription": "Panceta crocante, sour cream e coentro." },
        { "name": "Tempurá de Vegetais", "price": 34.00, "categoryName": "Entradas", "originalDescription": "Mix de vegetais empanados em massa leve." },
        { "name": "Carpaccio de Carne", "price": 47.00, "categoryName": "Entradas", "originalDescription": "Alcaparras, parmesão e azeite trufado." },
        { "name": "Mousse de Chocolate Belga", "price": 28.00, "categoryName": "Sobremesas", "originalDescription": "Com raspas de laranja." },
        { "name": "Petit Gâteau de Doce de Leite", "price": 32.00, "categoryName": "Sobremesas", "originalDescription": "Com sorvete de baunilha artesanal." }
    ];

    const results = [];

    // Limitar para teste rápido ou processar todos
    const itemsToProcess = mockVisionItems.slice(0, 20);

    for (const item of itemsToProcess) {
        console.log(`[TestFlow] Processing: ${item.name}`);

        try {
            // 1. Call Engineer Agent
            const recipe = await engineerProductRecipe(
                item.name,
                item.price,
                "" // Sem contexto de estoque para o teste
            );

            // 2. Call Marketing Agent
            const ingredientsNames = recipe.ingredients.map((i: any) => i.name).join(', ');
            const marketing = await generateProductMarketing(item.name, ingredientsNames);

            results.push({
                product: item.name,
                category: item.categoryName,
                price: item.price,
                recipe,
                marketing
            });

            console.log(`[TestFlow] ✅ Success: ${item.name}`);
        } catch (error: any) {
            console.error(`[TestFlow] ❌ Error processing ${item.name}:`, error.message);
            results.push({
                product: item.name,
                error: error.message
            });
        }
    }

    return {
        success: true,
        processedCount: results.length,
        data: results
    };
});
