
import { analyzeForVisualEnhancement } from '../agents/visionAgent';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars (going up 3 levels: tests -> ai -> src -> functions)
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const TEST_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/menusummo-prod.firebasestorage.app/o/imports%2Fnegocio-teste%2Fiscas-de-tilapia-crocante-com-fritas-jc-bar-jardim-nazareth.jpg.png?alt=media&token=23e332ad-eec9-49ba-a565-5437e30bd302';

console.log('🚀 Starting Vision Agent Analysis Test...');
console.log('Image:', TEST_IMAGE);

async function runTest() {
    try {
        console.log('Analyzing image structure and ingredients...');
        const visionData = await analyzeForVisualEnhancement(TEST_IMAGE);

        console.log('\n✅ Vision Analysis Result:');
        console.log('------------------------------------------------');
        console.log(JSON.stringify(visionData, null, 2));
        console.log('------------------------------------------------');
    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

runTest();
