import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * Orphaned SystemUsers Cleanup
 */
export const cleanupOrphanedSystemUsers = onSchedule(
    {
        schedule: 'every 24 hours',
        region: 'southamerica-east1'
    },
    async (event) => {
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
    }
);
