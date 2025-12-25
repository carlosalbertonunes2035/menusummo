import { engineerProductRecipe } from '../agents/engineerAgent';
import { generateProductMarketing } from '../agents/marketingAgent';
import * as admin from 'firebase-admin';

// Initialize for local script
if (!admin.apps.length) {
    admin.initializeApp();
}

async function runJCBarTest() {
    console.log('--- 🧪 SUMMO AI: JC BAR REAL-WORLD VERIFICATION ---');
    console.log('Role: Processing ACTUAL menu from customer image\n');

    const jcBarProducts = [
        { name: "Espeto de Carne", price: 11.99, category: "Espetos" },
        { name: "Espeto de Alcatra", price: 13.99, category: "Espetos" },
        { name: "Kafta Tradicional", price: 11.99, category: "Espetos" },
        { name: "Medalhão de Frango", price: 11.99, category: "Espetos" },
        { name: "Pão de Alho", price: 8.00, category: "Espetos" },
        { name: "Medalhão de Costela com Queijo", price: 13.50, category: "Espetos" },
        { name: "Contra-Filé (Porção Assada)", price: 99.00, category: "Porções Assadas" },
        { name: "Contrafilé com Catupiry e Alho", price: 105.99, category: "Porções Assadas" },
        { name: "Mista: Carne/Frango/Linguiça/Pão de Alho", price: 90.00, category: "Porções Assadas" },
        { name: "Batata Frita com Catupiry e Bacon", price: 35.99, category: "Porções Fritas" },
        { name: "Isca de Frango", price: 42.99, category: "Porções Fritas" },
        { name: "Bolinho de Carne recheado com Queijo", price: 37.99, category: "Porções Fritas" },
        { name: "Caldo de Mandioca com Calabresa e Bacon", price: 25.99, category: "Comida de Boteco" },
        { name: "Jantinha (Arroz, Vinagrete e Mandioca)", price: 15.00, category: "Guarnição" },
        { name: "Pururuca", price: 13.99, category: "Porções Fritas" },
        { name: "Salada, Tomate, Cebola e Azeitona", price: 25.00, category: "Porções Frios" },
        { name: "Queijo Coalho com Mel", price: 11.00, category: "Espetos" },
        { name: "Tulipa de Frango", price: 12.00, category: "Espetos" },
        { name: "Mandioca", price: 10.00, category: "Guarnição" },
        { name: "Arroz", price: 7.00, category: "Guarnição" }
    ];

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const startTime = Date.now();

    for (const prod of jcBarProducts) {
        console.log(`\n──────────────────────────────────────────────────`);
        console.log(`🍢 PRODUCT: ${prod.name.toUpperCase()} (R$ ${prod.price})`);
        console.log(`──────────────────────────────────────────────────`);

        let retryCount = 0;
        let success = false;

        while (retryCount < 3 && !success) {
            try {
                // 1. ENGINEER AGENT
                console.log(`[Engenheiro] Gerando ficha técnica...`);
                const recipe: any = await engineerProductRecipe(
                    prod.name,
                    prod.price,
                    "",
                    "JC Bar - Espetaria"
                );
                console.log(`✅ Ingredientes: ${recipe.ingredients.map((i: any) => i.name).join(', ')}`);

                await sleep(1500); // Breathe for API

                // 2. MARKETING AGENT
                console.log(`[Marketeiro] Criando marketing premium...`);
                const ingNames = recipe.ingredients.map((i: any) => i.name).join(', ');
                const market: any = await generateProductMarketing(
                    prod.name,
                    ingNames,
                    "JC Bar - Espetaria"
                );
                console.log(`🔗 Slug: /${market.slug}`);
                console.log(`📝 Descrição: "${market.ifoodDescription.substring(0, 150)}..."`);

                success = true;
            } catch (error: any) {
                if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    retryCount++;
                    const wait = retryCount * 4000;
                    console.warn(`⚠️ API Limit. Cooling down for ${wait / 1000}s...`);
                    await sleep(wait);
                } else {
                    console.error(`❌ ERRO:`, error.message);
                    break;
                }
            }
        }
        await sleep(2500); // Gap between products
    }

    console.log(`\n==================================================`);
    console.log(`✨ JC BAR VERIFIED IN ${(Date.now() - startTime) / 1000}s`);
    console.log(`==================================================`);
}

runJCBarTest().catch(console.error);
