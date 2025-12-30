export interface Address {
    zip: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string;
}

export interface SalesChannels {
    ownDelivery: boolean;
    counter: boolean;
    dineIn: boolean;
    ifood: boolean;
    rappi: boolean;
    aiqfome: boolean;
    otherApps: string[];
}

export interface DeliveryChannels {
    ownDelivery: boolean;
    ifood: boolean;
    rappi: boolean;
    aiqfome: boolean;
    others: boolean;
}

export interface DigitalMenuConfig {
    hasOwn: boolean;
    platform: string;
}

export type OnboardingStep = 1 | 2 | 3;

export type OwnerRole = 'owner' | 'manager' | 'chef' | 'other';
export type EstablishmentType = 'restaurant' | 'snack_bar' | 'food_truck' | 'bakery' | 'confectionery' | 'other';
export type OperationTime = 'new' | '1-2y' | '3-5y' | '5y+';
export type CurrentSystem = 'paper' | 'spreadsheet' | 'other_system' | 'none';
export type BusinessGoal = 'cost_control' | 'inventory' | 'orders' | 'team' | 'sales' | 'loyalty' | 'professionalize';
export type MainChallenge = 'waste' | 'profit' | 'orders' | 'team' | 'customers' | 'retention' | 'manual';

export interface RegistrationData {
    // === STEP 1: Personal Identity ===
    ownerName: string;
    ownerRole: OwnerRole;
    email: string;
    phone: string;

    // === STEP 2: Business & Security ===
    password: string;
    businessName: string;
    establishmentType: EstablishmentType;
    operationTime: OperationTime;
    legalName: string;
    cnpj: string;
    address: Address;

    // === STEP 3: Business Intelligence ===
    segment: string;
    monthlyRevenue: string;
    salesChannels: SalesChannels;
    digitalMenu: DigitalMenuConfig;
    currentSystem: CurrentSystem;
    currentSystemName: string;
    goals: BusinessGoal[];
    mainChallenge: MainChallenge;

    // Legacy compatibility
    deliveryChannels: DeliveryChannels;
    serviceTypes: string[];
}
