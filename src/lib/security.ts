import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';

export type SecurityEventType =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'SENSITIVE_SETTING_CHANGE'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'ORDER_CREATION_FAILURE'
    | 'MALICIOUS_UPLOAD_ATTEMPT';

export interface SecurityEvent {
    type: SecurityEventType;
    email?: string;
    tenantId?: string;
    userId?: string;
    details?: any;
    ip?: string;
    userAgent: string;
    severity: 'info' | 'warning' | 'critical';
}

export const securityLogger = {
    /**
     * Logs a security-related event to Firestore for auditing.
     */
    async logEvent(event: Omit<SecurityEvent, 'userAgent'>) {
        try {
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side';
            const timestamp = serverTimestamp();

            // Create base event
            const eventData: any = {
                ...event,
                userAgent,
                timestamp
            };

            // CRITICAL: Firestore doesn't accept 'undefined'. Filter out undefined fields.
            Object.keys(eventData).forEach(key => {
                if (eventData[key] === undefined) {
                    delete eventData[key];
                }
            });

            await addDoc(collection(db, 'security_logs'), eventData);

            // In production, we could also send an alert for critical events
            if (event.severity === 'critical') {
                console.error('🔥 CRITICAL SECURITY EVENT:', eventData);
                // Future: Integrate with Slack/Email notifications
            }
        } catch (error) {
            // Failsafe: Don't break the app if logging fails
            console.error('Failed to log security event:', error);
        }
    },

    /**
     * Specialized helper for login events
     */
    async logLogin(email: string, success: boolean, tenantId?: string, errorDetails?: string) {
        await this.logEvent({
            type: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
            email,
            tenantId,
            severity: success ? 'info' : 'warning',
            details: success ? { message: 'User logged in successfully' } : { error: errorDetails }
        });
    },

    /**
     * Specialized helper for unauthorized access attempts
     */
    async logUnauthorized(userId: string, tenantId: string, action: string) {
        await this.logEvent({
            type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
            userId,
            tenantId,
            severity: 'critical',
            details: { action, message: 'User attempted an action they do not have permission for' }
        });
    }
};
