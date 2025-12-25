import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Orphaned SystemUsers Cleanup
 */
export const cleanupOrphanedSystemUsers = functions.region('southamerica-east1').pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const db = admin.firestore();
        console.log('[cleanupOrphanedSystemUsers] Iniciando limpeza...');

        const systemUsersSnapshot = await db.collection('system_users').get();
        let deletedCount = 0;

        for (const systemUserDoc of systemUsersSnapshot.docs) {
            const userId = systemUserDoc.id;
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                await systemUserDoc.ref.delete();
                deletedCount++;
            }
        }

        console.log(`[cleanupOrphanedSystemUsers] ✅ Limpeza concluída. ${deletedCount} órfãos deletados.`);
    });
