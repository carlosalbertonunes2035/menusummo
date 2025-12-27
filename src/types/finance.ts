export enum PaymentMethod {
    CASH = 'CASH',
    PIX = 'PIX',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    MEAL_VOUCHER = 'MEAL_VOUCHER',
    CREDIT_TAB = 'CREDIT_TAB'
}


export interface PaymentTransaction {
    id: string;
    method: PaymentMethod;
    amount: number;
    description: string;
    timestamp: Date;
}

export interface CashTransaction {
    id: string;
    type: 'IN' | 'OUT' | 'BLEED' | 'SUPPLY' | 'OPEN';
    amount: number;
    description: string;
    timestamp: Date;
}

export interface CashRegister {
    isOpen: boolean;
    openedAt?: Date;
    initialAmount: number;
    currentBalance: number;
    totalSales: number;
    transactions: (CashTransaction | PaymentTransaction)[];
}

// --- Financial Module 2.0 (Accounting Level) ---

export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH_DRAWER' | 'WALLET';

export interface BankAccount {
    id: string;
    name: string; // e.g. "Conta Inter PJ"
    bankName: string; // e.g. "Banco Inter"
    accountType: BankAccountType;
    initialBalance: number;
    currentBalance: number; // Calculated field
    currency: string;
    description?: string;
    isDefault?: boolean;
    isActive: boolean;
    createdAt: Date;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'CLEARED' | 'RECONCILED' | 'VOID';

export interface LedgerTransaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;

    // Links
    bankAccountId: string; // Where money moved
    categoryId?: string; // For DRE
    orderId?: string; // Linked source

    // Dates
    date: Date; // Occurrence date
    competenceDate: Date; // Accrual basis date (DRE)
    reconciledAt?: Date;

    // Metadata
    notes?: string;
    attachments?: string[];
}


export interface FinancialCategory {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    parentId?: string; // For hierarchical trees
    color?: string;
    icon?: string;
}

export interface Revenue {
    id: string;
    description: string;
    amount: number;
    category: string; // ID of FinancialCategory
    date: Date; // Accrual date
    receivedAt?: Date; // Cash basis date
    status: 'PENDING' | 'RECEIVED';
    customerId?: string; // Optional link to customer
    orderId?: string; // Optional link to order
    paymentMethod?: PaymentMethod;
    bankAccountId?: string; // Where it was received
    recurrence?: 'ONE_OFF' | 'MONTHLY' | 'WEEKLY';
}


export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string; // ID from FINANCIAL_CATEGORIES
    costCenter?: string; // ID from COST_CENTERS
    supplier?: string;
    date: Date; // Accrual
    dueDate?: Date;
    paidAt?: Date;
    status: 'PENDING' | 'PAID' | 'VOID';
    paymentMethod?: PaymentMethod;
    bankAccountId?: string; // Source of funds
    attachments?: string[];
    notes?: string;
}

