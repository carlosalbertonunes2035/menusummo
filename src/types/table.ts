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
