/**
 * Virtual Tab Constants
 */

export const SERVICE_CHARGE_PERCENTAGE = 0.1; // 10%

export const PAYMENT_LOCATIONS = {
    TABLE: 'TABLE',
    PDV: 'PDV',
} as const;

export type PaymentLocation = typeof PAYMENT_LOCATIONS[keyof typeof PAYMENT_LOCATIONS];

export const SESSION_STATUS = {
    ACTIVE: 'ACTIVE',
    BILL_REQUESTED: 'BILL_REQUESTED',
    PAYING: 'PAYING',
    CLOSED: 'CLOSED',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export const INACTIVITY_TIMEOUT_MINUTES = 30;

export const QR_CODE_OPTIONS = {
    width: 300,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#FFFFFF',
    },
} as const;

export const WAITER_AVAILABILITY = {
    AVAILABLE: 'AVAILABLE',
    BUSY: 'BUSY',
    OFFLINE: 'OFFLINE',
} as const;

export type WaiterAvailability = typeof WAITER_AVAILABILITY[keyof typeof WAITER_AVAILABILITY];

export const LOSS_TYPES = {
    WALKOUT: 'WALKOUT',
    CANCELLED_ORDER: 'CANCELLED_ORDER',
    KITCHEN_ERROR: 'KITCHEN_ERROR',
    WAITER_ERROR: 'WAITER_ERROR',
    CUSTOMER_COMPLAINT: 'CUSTOMER_COMPLAINT',
    ORPHAN_ORDER: 'ORPHAN_ORDER',
    EXPIRED_PRODUCT: 'EXPIRED_PRODUCT',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    OTHER: 'OTHER',
} as const;

export type LossType = typeof LOSS_TYPES[keyof typeof LOSS_TYPES];
