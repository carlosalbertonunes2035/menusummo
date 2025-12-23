import { SalesChannel, Product } from './product';
import { PaymentTransaction } from './finance';

export interface CartItem {
    product: Product;
    quantity: number;
    notes: string;
    selectedOptions?: { groupTitle: string; optionName: string; price: number }[];
    suggestedProduct?: Product | null;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    DELIVERING = 'DELIVERING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum OrderType {
    DELIVERY = 'DELIVERY',
    TAKEOUT = 'TAKEOUT',
    DINE_IN = 'DINE_IN',
    STAFF_MEAL = 'STAFF_MEAL'
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    basePrice: number;
    notes?: string;
    isTakeout?: boolean;
    channel?: SalesChannel;
    selectedOptions?: { groupTitle: string; optionName: string; price: number }[];
}

export interface Order {
    id: string;
    tenantId?: string;
    customerName: string;
    customerPhone?: string;
    items: OrderItem[];
    total: number;
    cost: number;
    status: OrderStatus;
    type: OrderType;
    origin: 'DIGITAL' | 'POS';
    payments: PaymentTransaction[];
    deliveryAddress?: string;
    location?: { lat: number; lng: number };
    createdAt: Date;
    scheduledTo?: Date;
    driverId?: string;
    change?: number;
    couponCode?: string;
    discountTotal?: number;
    tableNumber?: string;
    waiterId?: string;
    feedback?: {
        rating: number;
        comment: string;
        createdAt: Date;
    };
    deliverySequence?: number; // Optimization for driver route
}
