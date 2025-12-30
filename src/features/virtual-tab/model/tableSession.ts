/**
 * Table Session - Represents a customer's active session at a table
 */
export interface TableSession {
    id: string;
    tenantId: string;

    // Table Info
    tableNumber: string;            // "Mesa 15"
    tableId: string;                // "table-15"

    // Customer Info
    customerName: string;
    customerPhone: string;
    customerId?: string;            // If customer already registered in CRM

    // Origin and Assignment
    openedBy: 'CUSTOMER' | 'WAITER'; // Who opened the table
    openedByUserId: string;          // ID of customer or waiter
    assignedWaiterId?: string;       // Responsible waiter (if any)
    assignedWaiterName?: string;

    // Status
    status: 'ACTIVE' | 'BILL_REQUESTED' | 'PAYING' | 'CLOSED';
    openedAt: Date;
    closedAt?: Date;

    // Orders
    orderIds: string[];             // List of order IDs made during session
    totalAmount: number;            // Accumulated total

    // Payment
    paymentFlow?: 'SELF_SERVICE_DIGITAL' | 'SELF_SERVICE_WAITER' | 'WAITER_INITIATED';
    paymentStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    paymentMethod?: 'PIX' | 'CARD' | 'CASH' | 'VOUCHER';

    // Waiter Requests
    waiterRequests: WaiterRequest[];

    // Metrics
    firstOrderAt?: Date;
    lastOrderAt?: Date;
    lastActivityAt: Date;
    averageResponseTime?: number;   // Average waiter response time

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Waiter Request - Customer requesting waiter assistance
 */
export interface WaiterRequest {
    id: string;
    type: 'ASSISTANCE' | 'BILL_REQUEST' | 'COMPLAINT' | 'QUESTION' | 'OTHER';
    message?: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH';

    // Status
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

    // Assignment
    assignedWaiterId?: string;
    assignedWaiterName?: string;

    // Timestamps
    createdAt: Date;
    respondedAt?: Date;
    resolvedAt?: Date;
}

/**
 * Quick Registration Form Data
 */
export interface QuickRegistrationData {
    customerName: string;
    customerPhone: string;
}

/**
 * Table Session Status
 */
export type TableSessionStatus = 'ACTIVE' | 'BILL_REQUESTED' | 'PAYING' | 'CLOSED';

/**
 * Payment Flow Types
 */
export type PaymentFlow =
    | 'SELF_SERVICE_DIGITAL'  // Customer pays alone (PIX/Card online)
    | 'SELF_SERVICE_WAITER'   // Customer calls waiter to pay
    | 'WAITER_INITIATED';     // Waiter closes the bill

/**
 * Payment Status
 */
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

