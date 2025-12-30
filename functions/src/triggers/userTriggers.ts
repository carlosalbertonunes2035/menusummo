import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

/**
 * Automática synchronization: users <-> system_users
 */
export const syncUserToSystemUser = onDocumentWritten(
    {
        document: 'users/{userId}',
        region: 'southamerica-east1'
    },
    async (event) => {
        const db = admin.firestore();
        const userId = event.params.userId;
        const change = event.data;

        if (!change) return;

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
    }
);
