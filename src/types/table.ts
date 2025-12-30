export type TableStatus = 'available' | 'occupied' | 'bill_requested' | 'cleaning';

export interface Table {
    id: string; // e.g., "table-1"
    number: number;
    status: TableStatus;
    currentOrderId: string | null;
    waiterId: string | null;
    customerName: string | null;
    openedAt: Date | null; // Firestore Timestamp converted to Date
    total: number;

    // Logic for Merging/Joining Tables
    parentId: string | null; // If this table is joined to another
    childTables: string[]; // If this is the parent, list of joined tables
}

/**
 * Merged Table - Virtual table created from multiple physical tables
 */
export interface MergedTable {
    id: string;
    tenantId: string;
    tables: string[];           // Physical table numbers (e.g., ["Mesa 05", "Mesa 06"])
    virtualName: string;        // Display name (e.g., "Mesa 05-06")
    createdAt: Date;
    createdBy: string;          // User ID who created the merge
    status: 'ACTIVE' | 'CLOSED';
    closedAt?: Date;
    closedBy?: string;
}

/**
 * Table Closure - Record of table being closed with payments
 */
export interface TableClosure {
    id: string;
    tenantId: string;
    tableNumber: string;
    mergedTableId?: string;     // Reference to merged table if applicable
    closedBy: string;
    closedAt: Date;
    total: number;
    payments: TablePayment[];
    ordersIncluded: string[];   // Order IDs
    status: 'COMPLETED' | 'CANCELLED';
}

/**
 * Payment record for table closure
 */
export interface TablePayment {
    id: string;
    method: 'CASH' | 'CARD' | 'PIX' | 'VOUCHER';
    amount: number;
    change?: number;
    timestamp: Date;
    description?: string;
}
