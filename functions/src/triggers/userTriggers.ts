import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Automática synchronization: users <-> system_users
 */
export const syncUserToSystemUser = functions.region('southamerica-east1').firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
        const db = admin.firestore();
        const userId = context.params.userId;

        try {
            if (!change.after.exists) {
                console.log(`[syncUserToSystemUser] Deletando user ${userId} de system_users`);
                await db.collection('system_users').doc(userId).delete();
                return;
            }

            const userData = change.after.data();
            console.log(`[syncUserToSystemUser] Sincronizando user ${userId} para system_users`);
            await db.collection('system_users').doc(userId).set(userData || {}, { merge: true });

            console.log(`[syncUserToSystemUser] ✅ Sincronização concluída para ${userId}`);
        } catch (error) {
            console.error(`[syncUserToSystemUser] ❌ Erro ao sincronizar ${userId}:`, error);
        }
    });
