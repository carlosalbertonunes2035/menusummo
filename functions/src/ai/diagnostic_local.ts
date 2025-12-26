import { extractRawMenuFromMedia } from './agents/visionAgent';
import * as fs from 'fs';
import * as path from 'path';

// Local path to the user's uploaded image
const IMAGE_PATH = 'C:/Users/PoP TMS/.gemini/antigravity/brain/74d61579-9abe-427d-8228-f8c86a60594a/uploaded_image_1766695066989.png';

async function run() {
    console.log("==========================================");
    console.log("🤖 SUMMO DIAGNOSTIC: LOCAL IMAGE");
    console.log("File: " + IMAGE_PATH);
    console.log("==========================================");

    try {
        if (!fs.existsSync(IMAGE_PATH)) {
            console.error("❌ File not found!");
            return;
        }

        const buffer = fs.readFileSync(IMAGE_PATH);
        const base64Coords = buffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64Coords}`;

        console.log(`[Diagnostic] Payload size: ${(dataUri.length / 1024 / 1024).toFixed(2)} MB`);

        // Force a simplified extraction to debug
        const items = await extractRawMenuFromMedia(dataUri, "image/png");

        console.log("✅ AI Response Received.");
        console.log(`FOUND: ${items?.length || 0} items.`);

        if (items && items.length > 0) {
            console.log("--- First 5 Items ---");
            console.log(JSON.stringify(items.slice(0, 5), null, 2));
            console.log("...");
            console.log("--- Categories Found ---");
            const categories = [...new Set(items.map(i => i.categoryName))];
            console.log(categories);
        }

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

run();
