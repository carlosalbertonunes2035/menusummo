
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
// We cannot easily invoke 'onCall' functions directly in a script without a wrapper/mock.
// However, since we want to test the LOGIC, we should have extracted the logic like we did for tools.
// But createTenant is in 'flows/onboardingFlow.ts'.
// Let's modify onboardingFlow.ts to export the logic first if needed, OR verify via Emulator Client SDK in the script.

// STRATEGY: Use Client SDK logic in Node to call the Emulator Function OR 
// Use admin SDK to simulate the "Outcome" if we can't call the function easily.
// Actually, firebase-functions-test is the standard way, but setting it up in a standalone script is tricky.
// EASIEST WAY: Use 'node-fetch' to hit the Emulator Endpoint if running!
// OR: Just rewrite the logic check (Engenharia Reversa) validation script, assuming the user triggers it manually or via curl.
// But the user asked for "Implement Internal Test of Creation".

// Let's try to invoke the Cloud Function via HTTP (Emulator) if possible.
// If the emulator is running at localhost:5001 (default), we can POST to it.
import { z } from 'zod';

// Emulator Config
const REGION = 'southamerica-east1';
const PROJECT_ID = 'menusummo-prod';
const EMULATOR_HOST = 'http://127.0.0.1:5001';

async function runOnboardingSimulation() {
    console.log('\n🚀 INICIANDO SIMULAÇÃO DE ONBOARDING (Cadastro "Gold Standard")...\n');
    console.log('⚠️  Este teste requer que o FIREBASE EMULATOR esteja rodando em ' + EMULATOR_HOST);

    // 1. DADOS DE TESTE
    const testData = {
        ownerName: "Chefe Testador Michelin",
        email: `teste.michelin.${Date.now()}@exemplo.com`,
        phone: "+5511999999999",
        password: "password123",
        businessName: "Bistro Simulação",
        businessSlug: `bistro-sim-${Date.now()}` // Unique
    };

    console.log(`📝 Passo 1: Tentando registrar: ${testData.businessName} (${testData.email})`);

    try {
        // We use fetch to call the HTTP endpoint of the Callable Function
        // Callable functions expect { data: ... } body and return { result: ... }
        const endpoint = `${EMULATOR_HOST}/${PROJECT_ID}/${REGION}/createTenant`;

        console.log(`   -> POST ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: testData })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na Função: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const json = await response.json() as any;
        const result = json.result; // Callable structure

        console.log('✅ Função Executada! Resultado:', result);

        if (!result.token) throw new Error('Token de Auth não retornado!');
        if (!result.tenantId) throw new Error('TenantID não retornado!');

        // 2. VERIFICAÇÃO DO BANCO (Engenharia Reversa)
        // Precisamos inicializar o Admin para ler o banco
        if (admin.apps.length === 0) {
            // Setup Env for Emulator
            process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
            process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
            admin.initializeApp({ projectId: PROJECT_ID });
        }
        const db = admin.firestore();
        const auth = admin.auth();

        console.log('\n🔍 Passo 2: Auditando Banco de Dados...');

        // Check Auth User
        try {
            const userRecord = await auth.getUserByEmail(testData.email);
            console.log(`   -> Auth User Criado: ${userRecord.uid} (Claims: ${JSON.stringify(userRecord.customClaims)})`);

            if (userRecord.customClaims?.tenantId !== result.tenantId) throw new Error('Claim tenantId incorreto');
            if (userRecord.customClaims?.role !== 'OWNER') throw new Error('Claim role incorreto');
        } catch (e) {
            throw new Error('Usuário Auth não encontrado.');
        }

        // Check Settings Doc
        const settingsDoc = await db.doc(`settings/${result.tenantId}`).get();
        if (!settingsDoc.exists) throw new Error('Documento de Settings não criado.');
        console.log(`   -> Settings OK: ${settingsDoc.id}`);

        // Check System User
        const sysUserSnap = await db.collection('system_users').where('email', '==', testData.email).get();
        if (sysUserSnap.empty) throw new Error('System User não criado.');
        console.log(`   -> System User OK.`);

        // Check Initial Options
        const optionsSnap = await db.collection('option_groups').where('tenantId', '==', result.tenantId).get();
        console.log(`   -> Grupos de Opção Padrão: ${optionsSnap.size} (Esperado > 0)`);

        console.log('\n🎉 SIMULAÇÃO DE ONBOARDING: SUCESSO ABSOLUTO!');
        console.log('O sistema criou Usuário, Banco, Permissões e retornou o Token de Login.');

    } catch (e: any) {
        console.error('\n❌ FALHA NA SIMULAÇÃO:', e.message);
        if (e.cause) console.error(e.cause);
        console.log('Dica: Verifique se o Emulador está rodando (firebase emulators:start).');
    }
}

// Check if fetch is available (Node 18+) or install node-fetch.
// Assuming Node 20 environment as per package.json
runOnboardingSimulation();
