
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';
import { logger } from '@/lib/logger';

export enum AuditEventType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    AUTH = 'AUTH',
    SYSTEM = 'SYSTEM'
}

export interface AuditLogEntry {
    tenantId: string;
    userId: string;
    action: AuditEventType;
    collection: string;
    docId: string;
    oldData?: any;
    newData?: any;
    timestamp: any;
    userAgent?: string;
    ip?: string;
}

export class AuditService {
    private static instance: AuditService;

    private constructor() { }

    public static getInstance(): AuditService {
        if (!AuditService.instance) {
            AuditService.instance = new AuditService();
        }
        return AuditService.instance;
    }

    async logEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
        try {
            const logRef = collection(db, 'audit_logs');
            await addDoc(logRef, {
                ...entry,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            logger.error('Failed to log audit event', { error, entry });
            // We don't throw here to avoid breaking the main operation if logging fails
        }
    }

    async logMutation(
        tenantId: string,
        userId: string,
        action: AuditEventType,
        collectionName: string,
        docId: string,
        oldData?: any,
        newData?: any
    ): Promise<void> {
        // Sanitize data: remove sensitive fields or large blobs if necessary
        const sanitizedOld = this.sanitize(oldData);
        const sanitizedNew = this.sanitize(newData);

        await this.logEvent({
            tenantId,
            userId,
            action,
            collection: collectionName,
            docId,
            oldData: sanitizedOld,
            newData: sanitizedNew,
            userAgent: navigator.userAgent
        });
    }

    private sanitize(data: any): any {
        if (!data) return null;
        const sanitized = { ...data };
        // Remove known large/unnecessary fields for logs
        delete sanitized.image;
        delete sanitized.base64;
        return sanitized;
    }
}

export const auditService = AuditService.getInstance();
