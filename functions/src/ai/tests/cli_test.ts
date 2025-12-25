import { ai, MODELS } from '../config';
import { engineerProductRecipe } from '../agents/engineerAgent';
import { generateProductMarketing } from '../agents/marketingAgent';
import * as admin from 'firebase-admin';

// Initialize for local script
if (!admin.apps.length) {
    admin.initializeApp();
}

async function runRealTest() {
    console.log('--- 🧪 SUMMO AI: REAL-TIME AGENT VERIFICATION ---');
    console.log('Target: 20 Products | Motor: Gemini 1.5 Flash (Vertex AI)\n');

    const products = [
        { name: "Sashimi de Salmão", price: 56.00 },
        { name: "Nigiri de Atum", price: 42.00 },
        { name: "Combinado Premium (20 pçs)", price: 125.00 },
        { name: "Hot Roll Cream Cheese", price: 38.00 },
        { name: "Temaki de Salmão Completo", price: 32.00 },
        { name: "Gyoza Suíno (6 un)", price: 34.00 },
        { name: "Sunomono de Pepino", price: 18.00 },
        { name: "Yakisoba de Frango Especial", price: 52.00 },
        { name: "Teppanyaki de Frutos do Mar", price: 110.00 },
        { name: "Uramaki Philadelphia", price: 48.00 },
        { name: "Joe de Salmão com Maracujá", price: 44.00 },
        { name: "Poke de Salmão e Manga", price: 49.00 },
        { name: "Harumaki de Legumes", price: 15.00 },
        { name: "Carpaccio de Salmão Trufado", price: 65.00 },
        { name: "Sashimi de Polvo", price: 72.00 },
        { name: "Robata de Aspargos com Bacon", price: 28.00 },
        { name: "Ebi Tempurá (Camarão)", price: 85.00 },
        { name: "Tofu Marinado", price: 22.00 },
        { name: "Miso Shiro Tradicional", price: 12.00 },
        { name: "Banana Flambada com Sorvete", price: 28.00 }
    ];

    const startTime = Date.now();
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const prod of products) {
        console.log(`\n──────────────────────────────────────────────────`);
        console.log(`🚀 PROCESSANDO: ${prod.name.toUpperCase()}`);
        console.log(`──────────────────────────────────────────────────`);

        let retryCount = 0;
        let success = false;

        while (retryCount < 3 && !success) {
            try {
                // 1. ENGINEER AGENT
                console.log(`[Engenheiro] Calculando ficha técnica...${retryCount > 0 ? ` (Tentativa ${retryCount + 1})` : ''}`);
                const recipe: any = await engineerProductRecipe(prod.name, prod.price, "");

                // PAUSA TÁTICA 1: 1s entre agentes do mesmo produto
                await sleep(1000);

                // 2. MARKETING AGENT
                console.log(`[Marketeiro] Gerando copywriting e SEO...`);
                const ingList = recipe.ingredients.map((i: any) => i.name).join(', ');
                const market: any = await generateProductMarketing(prod.name, ingList);

                console.log(`✅ Sucesso: /${market.slug}`);
                success = true;
            } catch (error: any) {
                if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    retryCount++;
                    const waitTime = retryCount * 3000;
                    console.warn(`⚠️ Rate Limit atingido. Aguardando ${waitTime / 1000}s para re-tentar...`);
                    await sleep(waitTime);
                } else {
                    console.error(`❌ ERRO NO ITEM ${prod.name}:`, error.message);
                    break;
                }
            }
        }

        // PAUSA TÁTICA 2: O Grande Respiro (3s entre produtos)
        console.log(`⏳ Aguardando cota da API (Cooling down)...`);
        await sleep(3000);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n==================================================`);
    console.log(`✨ TESTE CONCLUÍDO EM ${duration.toFixed(1)} segundos.`);
    console.log(`==================================================`);
}

runRealTest().catch(console.error);
