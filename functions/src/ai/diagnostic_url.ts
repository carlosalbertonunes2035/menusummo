import { extractRawMenuFromMedia } from './agents/visionAgent';

// The exact URL provided by the user
const TEST_URL = "https://firebasestorage.googleapis.com/v0/b/menusummo-prod.firebasestorage.app/o/imports%2Fnegocio-teste%2F1766692903081_CARDAPIO%201.jpg?alt=media&token=a0d5f89f-fb0d-46da-ac40-6354317a0beb";

async function run() {
    console.log("==========================================");
    console.log("🤖 SUMMO DIAGNOSTIC: URL TEST");
    console.log("Target: " + TEST_URL);
    console.log("==========================================");

    try {
        console.log("🚀 Sending request to AI...");
        // MIME type inferred as image/jpeg from extension/context
        const items = await extractRawMenuFromMedia(TEST_URL, "image/jpeg");

        console.log("✅ AI Response Received.");
        console.log(`FOUND: ${items?.length || 0} items.`);

        if (items && items.length > 0) {
            console.log("--- First 5 Items ---");
            console.log(JSON.stringify(items.slice(0, 5), null, 2));
            console.log("...");
            console.log("--- Categories Found ---");
            const categories = [...new Set(items.map(i => i.categoryName))];
            console.log(categories);
        } else {
            console.log("⚠️ No items text found. The AI might be refusing the image or it's unreadable.");
        }

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

run();
