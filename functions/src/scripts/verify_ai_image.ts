
import { enhanceProductImage } from '../ai/agents/marketingAgent';

// Helper to run the test
async function runTest() {
    // URL REAL fornecida pelo usuário
    const targetUrl = 'https://firebasestorage.googleapis.com/v0/b/menusummo-prod.firebasestorage.app/o/tenants%2Fnegocio-teste%2Fproducts%2F4oiwYPJ3KX8DT359viAW%2Fmain-image_1766752916787.png?alt=media&token=0462957e-f959-4ec9-a97f-12ae4c01d203';
    const productName = 'Filé de Tilápia + Fritas';

    console.log("🚀 Starting Internal AI Test (Backend Agent)...");
    console.log("Target Image:", targetUrl);
    console.log("Context:", productName);

    try {
        console.log("1. Calling Agent...");
        const result = await enhanceProductImage(productName, targetUrl);

        if (typeof result === 'string') {
            console.warn("⚠️ Returned fallback string URL:", result);
            return;
        }

        console.log("\n✅ Test Success!");
        console.log("==========================================");
        console.log("Analysis (Ingredients):", result.analysis.ingredients);
        console.log("Analysis (Vibe):", result.analysis.vibe);
        console.log("Generated Image URL:", result.image);

        // Save to file for Agent access
        const fs = require('fs');
        fs.writeFileSync('src/scripts/gen_url.txt', result.image);

        console.log("==========================================");

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

runTest();
