
import { StoreSettings } from '@/types/settings';

export const TENANTS = ['default', 'tenant-a', 'tenant-b'];

export function GET_DEFAULT_SETTINGS(tenantId: string): StoreSettings {
    const slug = tenantId || 'default-store';
    return {
        brandName: "Minha Loja",
        unitName: "Matriz",
        logoUrl: "",
        company: {
            legalName: "Minha Loja Ltda",
            cnpj: "",
            phone: "",
            address: {
                zip: "",
                street: "",
                number: "",
                neighborhood: "",
                city: "",
                state: "",
            }
        },
        address: "",
        storefront: {
            storeName: "Minha Loja",
            slug: slug
        },
        financial: {
            taxRate: 0,
            fixedCostRate: 0,
            packagingAvgCost: 0
        },
        schedule: [
            { day: 'Segunda', openTime: '18:00', closeTime: '23:00', isOpen: true },
            { day: 'Terça', openTime: '18:00', closeTime: '23:00', isOpen: true },
            { day: 'Quarta', openTime: '18:00', closeTime: '23:00', isOpen: true },
            { day: 'Quinta', openTime: '18:00', closeTime: '23:00', isOpen: true },
            { day: 'Sexta', openTime: '18:00', closeTime: '00:00', isOpen: true },
            { day: 'Sábado', openTime: '18:00', closeTime: '00:00', isOpen: true },
            { day: 'Domingo', openTime: '18:00', closeTime: '23:00', isOpen: true }
        ],
        delivery: {
            fees: [],
            deliveryRadius: 5,
            pricePerKm: 2,
            minOrderValue: 0,
            freeShippingThreshold: 100,
            baseFee: 5,
            active: true
        },
        operation: {
            dineIn: true,
            takeout: true,
            delivery: true
        },
        payment: {
            acceptCash: true,
            acceptPix: true,
            pixKey: "",
            pixKeyType: "EMAIL",
            acceptCard: true,
            brands: {
                visa: true,
                mastercard: true,
                elo: true,
                hipercard: true,
                amex: true
            },
            acceptVouchers: false,
            vouchers: {
                alelo: false,
                sodexo: false,
                ticket: false,
                vr: false
            }
        },
        kitchen: {
            preparationTime: 30,
            safetyBuffer: 5
        },
        orderModes: {
            delivery: { enabled: true, minTime: 30, maxTime: 60 },
            takeout: { enabled: true, minTime: 15, maxTime: 30 },
            dineIn: { enabled: true, minTime: 0, maxTime: 0 },
            staff: { enabled: true, minTime: 0, maxTime: 0 },
            scheduling: { enabled: false, maxDays: 7, intervalMin: 30, minLeadTime: 60 }
        },
        printer: {
            devices: []
        },
        ai: {
            isActive: false,
            apiKey: "",
            agentName: "Summo Bot",
            personality: "Professional"
        },
        whatsapp: {
            number: "",
            isActive: false,
            messageTemplate: "Olá, gostaria de fazer um pedido."
        },
        onboarding: {
            step1_config: false,
            step2_product: false,
            step3_ingredient: false,
            step4_sale: false,
            isCompleted: false
        }
    };
}

export const INITIAL_CASH_REGISTER = {
    isOpen: false,
    initialAmount: 0,
    currentBalance: 0,
    totalSales: 0,
    transactions: []
};

export * from './stubs';

export const FINANCIAL_CATEGORIES = [];
