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
