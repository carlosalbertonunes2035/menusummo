import * as admin from 'firebase-admin';

admin.initializeApp({
    projectId: 'menusummo-prod'
});

async function checkUser(uid: string) {
    try {
        const user = await admin.auth().getUser(uid);
        console.log(`\n👤 User: ${user.email}`);
        console.log(`🆔 UID: ${user.uid}`);
        console.log(`🛡️ Custom Claims:`, user.customClaims);

        if (user.customClaims?.tenantId) {
            console.log(`✅ tenantId is properly set: ${user.customClaims.tenantId}`);
        } else {
            console.log(`❌ tenantId is MISSING from custom claims!`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkUser('QDemTDUDTwO6JzKSeSAJ8OwwibS2');
