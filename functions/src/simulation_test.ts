
import * as admin from 'firebase-admin';
import { createProductTreeLogic } from './tools/tools';
import { z } from 'zod';

// Config
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const PROJECT_ID = 'menusummo-prod';
const TENANT_ID = 'sim-tenant-' + Date.now();

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

async function runSimulation() {
    console.log('\n🧪 INICIANDO SIMULAÇÃO "MICHELIN" (End-to-End)...\n');

    // 1. SETUP: Simular Input da IA
    const aiOutput = {
        tenantId: TENANT_ID,
        products: [
            {
                name: 'X-Burger Michelin',
                description: 'Burger artesanal com blend secreto e queijo importado.',
                category: 'Burgers',
                price: 45.00,
                ingredients: [
                    { name: 'Pão Brioche', quantity: 1, unit: 'un', estimatedCost: 2.50 },
                    { name: 'Carne Angus', quantity: 0.180, unit: 'kg', estimatedCost: 35.00 },
                    { name: 'Queijo Cheddar', quantity: 0.040, unit: 'kg', estimatedCost: 60.00 }
                ]
            }
        ]
    };

    console.log('📝 Passo 1: Executando lógica de criação de produtos (IA Mock)...');
    try {
        const result = await createProductTreeLogic(aiOutput);
        console.log('✅ Resultado:', result);
    } catch (e) {
        console.error('❌ Falha na criação:', e);
        process.exit(1);
    }

    // 2. VERIFICAÇÃO DE DADOS (Engenharia Reversa)
    console.log('\n🔍 Passo 2: Verificando Integridade dos Dados no Firestore...');

    // Check Ingredients
    const ingredientsSnap = await db.collection('ingredients').where('tenantId', '==', TENANT_ID).get();
    console.log(`   - Insumos criados: ${ingredientsSnap.size} (Esperado: 3)`);
    ingredientsSnap.docs.forEach(d => {
        const data = d.data();
        console.log(`     -> ${data.name}: Custo R$ ${data.cost} / ${data.unit}`);
    });

    if (ingredientsSnap.size !== 3) throw new Error('Falha na criação de insumos');

    // Check Product & Recipe
    const productSnap = await db.collection('products').where('tenantId', '==', TENANT_ID).get();
    const product = productSnap.docs[0].data();
    console.log(`   - Produto criado: ${product.name} (R$ ${product.channels[0].price})`);
    console.log(`   - Custo Total (CMV): R$ ${product.cost.toFixed(2)}`);

    // 3. SIMULAÇÃO DE VENDA (Stock Deduction)
    console.log('\n💸 Passo 3: Simulando Venda no POS (Deduzindo Estoque)...');

    // Create Order
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
        id: orderRef.id,
        tenantId: TENANT_ID,
        status: 'COMPLETED', // Trigger stock deduction
        items: [
            {
                productId: product.id,
                quantity: 2, // Sold 2 burgers
                productName: product.name,
                recipeId: product.recipeId
            }
        ],
        total: 90.00,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`   - Pedido criado com 2x ${product.name}. ID: ${orderRef.id}`);

    // Wait for Trigger (Simulated wait)
    console.log('   - Aguardando trigger de estoque (2s)...');
    await new Promise(r => setTimeout(r, 4000));

    // 4. VERIFICAÇÃO DE ESTOQUE
    console.log('\n📦 Passo 4: Verificando Baixa de Estoque...');
    const flavorOne = ingredientsSnap.docs.find(d => d.data().name === 'Carne Angus');
    if (flavorOne) {
        const updated = await db.collection('ingredients').doc(flavorOne.id).get();
        const currentStock = updated.data()?.currentStock;
        // Expected: 0 - (0.180 * 2) = -0.360
        console.log(`     -> Carne Angus Estoque: ${currentStock} (Esperado: -0.36)`);

        if (Math.abs(currentStock + 0.36) < 0.01) {
            console.log('✅ TESTE APROVADO: Estoque baixado corretamente!');
        } else {
            console.warn('⚠️ TESTE FALHOU ou Trigger não rodou (Verifique se o Emulator está rodando ou se conectou ao Prod).');
            console.log('Nota: Este teste assume que o trigger onOrderCreated está ativo ambiente de destino.');
        }
    }

    console.log('\n🎉 Simulação Concluída.');
}

runSimulation();
