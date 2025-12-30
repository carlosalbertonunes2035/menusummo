
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';

const db = admin.firestore();
const auth = admin.auth();

// Validation Schema
const TeamMemberSchema = z.object({
    action: z.enum(['create', 'update', 'delete']),
    data: z.object({
        id: z.string().optional(),
        name: z.string().min(2),
        email: z.string().email(),
        roleId: z.string(),
        cpf: z.string().optional(),
        pin: z.string().optional(),
        password: z.string().min(6).optional(), // Only for creation or reset
        active: z.boolean().default(true)
    }).partial().refine(data => {
        // 'delete' only needs id
        if (data.id) return true;
        // 'create' needs essential fields
        return data.name && data.email && data.roleId;
    }, { message: "Dados incompletos para criação" })
});

export const manageTeamMember = onCall(async (request) => {
    // 1. Security Check: Authenticated & Tenant Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const callerUid = request.auth.uid;
    const callerToken = request.auth.token;

    // Ensure caller has a tenantId
    if (!callerToken.tenantId) {
        throw new HttpsError('permission-denied', 'User does not belong to a tenant.');
    }

    // Role Check: Only OWNER or MANAGER can manage team
    // (Assuming 'role' claim exists, otherwise fallback to DB check)
    // For now, let's trust custom claims or check if user is in 'users' collection with specific role
    // Ideally, Custom Claims should have 'role'

    const tenantId = callerToken.tenantId;

    try {
        // Validate Input
        const { action, data } = TeamMemberSchema.parse(request.data);

        // --- DELETE ACTION ---
        if (action === 'delete') {
            if (!data.id) throw new HttpsError('invalid-argument', 'ID required for deletion');

            // Prevent self-deletion
            if (data.id === callerUid) {
                throw new HttpsError('invalid-argument', 'Você não pode se excluir.');
            }

            // Verify target belongs to same tenant
            const targetDoc = await db.collection('system_users').doc(data.id).get();
            if (targetDoc.exists && targetDoc.data()?.tenantId !== tenantId) {
                throw new HttpsError('permission-denied', 'Unauthorized access to this user.');
            }

            await auth.deleteUser(data.id);
            await db.collection('users').doc(data.id).delete();
            await db.collection('system_users').doc(data.id).delete();

            logger.info(`[Team] User deleted: ${data.id} by ${callerUid}`);
            return { success: true };
        }

        // --- CREATE / UPDATE ACTION ---

        // Check if role is valid (security)
        // TODO: Validate roleId against 'roles' collection if necessary

        let targetUid = data.id;

        // CREATE
        if (action === 'create') {
            if (!data.email || !data.password) {
                throw new HttpsError('invalid-argument', 'Email and Password required for new user.');
            }

            try {
                const userRecord = await auth.createUser({
                    email: data.email,
                    password: data.password,
                    displayName: data.name,
                    disabled: false
                });
                targetUid = userRecord.uid;
            } catch (e: any) {
                if (e.code === 'auth/email-already-exists') {
                    throw new HttpsError('already-exists', 'Este email já está em uso.');
                }
                throw e;
            }
        }
        // UPDATE (password optional)
        else if (action === 'update') {
            if (!targetUid) throw new HttpsError('invalid-argument', 'ID required for update');

            // Update Auth (DisplayName, Email, Password if provided)
            const updateData: any = {};
            if (data.name) updateData.displayName = data.name;
            if (data.email) updateData.email = data.email;
            if (data.password) updateData.password = data.password;

            if (Object.keys(updateData).length > 0) {
                await auth.updateUser(targetUid, updateData);
            }
        }

        // Set Custom Claims (Crucial for RBAC)
        await auth.setCustomUserClaims(targetUid!, {
            tenantId: tenantId,
            role: data.roleId
        });

        // Atomic Firestore Update
        await db.runTransaction(async (t) => {
            const systemUserRef = db.collection('system_users').doc(targetUid!);
            const userRef = db.collection('users').doc(targetUid!);

            // Read existing if update (not strictly needed for blind writes but good hygiene)

            const commonData = {
                name: data.name,
                email: data.email,
                roleId: data.roleId,
                active: data.active !== undefined ? data.active : true,
                tenantId: tenantId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const systemSpecificData = {
                ...commonData,
                cpf: data.cpf || null,
                pin: data.pin || null, // PIN is stored in system_users (profile), NOT Auth
            };

            t.set(systemUserRef, systemSpecificData, { merge: true });
            t.set(userRef, {
                ...commonData,
                id: targetUid // Ensure ID is present
            }, { merge: true });
        });

        logger.info(`[Team] User ${action}d: ${targetUid}`);
        return { success: true, uid: targetUid };

    } catch (error: any) {
        logger.error('[Team] Error:', error);
        if (error instanceof z.ZodError) {
            throw new HttpsError('invalid-argument', error.errors[0].message);
        }
        throw new HttpsError('internal', error.message);
    }
});
