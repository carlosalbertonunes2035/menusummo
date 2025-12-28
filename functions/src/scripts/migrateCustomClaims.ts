import * as admin from 'firebase-admin';

/**
 * ONE-TIME MIGRATION SCRIPT
 * Sets tenantId custom claims for all existing users
 * 
 * Run with: npx ts-node functions/src/scripts/migrateCustomClaims.ts
 */

admin.initializeApp({
    projectId: 'menusummo-prod'
});

async function migrateCustomClaims() {
    const db = admin.firestore();

    console.log('🔧 Starting custom claims migration...\n');

    try {
        // Get all system_users
        const systemUsersSnapshot = await db.collection('system_users').get();

        console.log(`📊 Found ${systemUsersSnapshot.size} users to migrate\n`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const doc of systemUsersSnapshot.docs) {
            const userId = doc.id;
            const userData = doc.data();
            const tenantId = userData.tenantId;

            if (!tenantId) {
                console.log(`⚠️  Skipping ${userId} - no tenantId`);
                skippedCount++;
                continue;
            }

            try {
                // Get current user from Auth
                const user = await admin.auth().getUser(userId);
                const currentClaims = user.customClaims || {};

                // Check if already has the claim
                if (currentClaims.tenantId === tenantId) {
                    console.log(`✓ ${userId} - already has tenantId claim`);
                    skippedCount++;
                    continue;
                }

                // Set custom claim
                await admin.auth().setCustomUserClaims(userId, {
                    ...currentClaims,
                    tenantId: tenantId
                });

                console.log(`✅ ${userId} - set tenantId: ${tenantId}`);
                successCount++;

            } catch (error: any) {
                console.error(`❌ ${userId} - Error: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⚠️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📊 Total: ${systemUsersSnapshot.size}`);

        if (successCount > 0) {
            console.log('\n⚠️  IMPORTANT: Users need to log out and log back in for claims to take effect!');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

migrateCustomClaims();
