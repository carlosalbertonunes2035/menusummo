
import { StoreSettings } from '@/types/settings';

export const TENANTS = ['default', 'tenant-a', 'tenant-b'];

export function GET_DEFAULT_SETTINGS(tenantId: string): StoreSettings {
    const slug = tenantId || 'default-store';
    return {
        brandName: "Minha Loja",
        unitName: "Matriz",
        logoUrl: "",
        company: {
            legalName: "SUMMO TECNOLOGIA E GESTAO INOVA SIMPLES (I.S.)",
            cnpj: "64.162.119/0001-43",
            phone: "17991234567", // Placeholder phone based on area code
            address: {
                zip: "15044-425",
                street: "RUA JOAQUIM LOPES DA SILVA",
                number: "1215",
                neighborhood: "SOLO SAGRADO I",
                city: "SAO JOSE DO RIO PRETO",
                state: "SP",
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
            packagingAvgCost: 0,
            payment: {
                provider: 'CUSTOM',
                rates: {
                    debit: 1.5,
                    creditCash: 2.5,
                    creditInstallment: 3.5,
                    pix: 0.99
                }
            },
            ifood: {
                plan: 'BASIC',
                payoutModel: 'MONTHLY',
                commission: 12,
                paymentFee: 3.2,
                anticipationFee: 0,
                monthlyFee: 130,
                isFreeMonth: false
            }
        },
        bankAccounts: [],
        loyalty: {
            enabled: false,
            pointsPerCurrency: 1,
            redemptionRate: 20,
            cashbackValuePer100Points: 5,
            minRedemptionPoints: 100,
            branding: {
                name: 'Pontos',
                color: '#FF6B35'
            }
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


export const COST_CENTERS = [
    { id: 'kitchen', name: 'Cozinha / Produção' },
    { id: 'bar', name: 'Bar / Copa' },
    { id: 'service', name: 'Salão / Atendimento' },
    { id: 'delivery', name: 'Delivery / Logística' },
    { id: 'admin', name: 'Administrativo / Escritório' },
    { id: 'marketing', name: 'Marketing / Vendas' }
];

export const FINANCIAL_CATEGORIES = [
    // --- INCOME ---
    { id: 'income_sales_food', name: 'Venda de Produtos (Alimentos)', type: 'INCOME' },
    { id: 'income_sales_beverage', name: 'Venda de Produtos (Bebidas)', type: 'INCOME' },
    { id: 'income_delivery_fee', name: 'Taxas de Entrega Recebidas', type: 'INCOME' },
    { id: 'income_investment', name: 'Aporte / Investimento', type: 'INCOME' },
    { id: 'income_other', name: 'Outras Receitas', type: 'INCOME' },

    // --- EXPENSES (COST OF GOODS) ---
    { id: 'exp_cogs_food', name: 'Insumos (Alimentos)', type: 'EXPENSE' },
    { id: 'exp_cogs_beverage', name: 'Insumos (Bebidas/Revenda)', type: 'EXPENSE' },
    { id: 'exp_packaging', name: 'Embalagens & Descartáveis', type: 'EXPENSE' },

    // --- EXPENSES (LOGISTICS) ---
    { id: 'exp_delivery_driver', name: 'Pagamento de Entregadores', type: 'EXPENSE' },
    { id: 'exp_delivery_fuel', name: 'Combustível / Manutenção Veículos', type: 'EXPENSE' },
    { id: 'exp_delivery_platform', name: 'Logística Terceirizada (iFood/Uber)', type: 'EXPENSE' },

    // --- EXPENSES (OPERATIONAL) ---
    { id: 'exp_labor_salary', name: 'Salários & Encargos', type: 'EXPENSE' },
    { id: 'exp_labor_extra', name: 'Horas Extras / Freelancers', type: 'EXPENSE' },
    { id: 'exp_utilities', name: 'Utilidades (Água, Luz, Gás, Internet)', type: 'EXPENSE' },
    { id: 'exp_rent', name: 'Aluguel & Condomínio', type: 'EXPENSE' },
    { id: 'exp_maintenance', name: 'Manutenção Predial / Equipamentos', type: 'EXPENSE' },
    { id: 'exp_software', name: 'Software & Sistemas', type: 'EXPENSE' },
    { id: 'exp_accounting', name: 'Contabilidade & Jurídico', type: 'EXPENSE' },
    { id: 'exp_marketing', name: 'Marketing & Publicidade', type: 'EXPENSE' },

    // --- EXPENSES (FINANCIAL) ---
    { id: 'exp_tax_card', name: 'Taxas de Cartão / Adquirência', type: 'EXPENSE' },
    { id: 'exp_tax_hub', name: 'Comissões Marketplace (iFood)', type: 'EXPENSE' },
    { id: 'exp_tax_gov', name: 'Impostos (Simples, ICMS, ISS)', type: 'EXPENSE' },
    { id: 'exp_bank_fees', name: 'Tarifas Bancárias', type: 'EXPENSE' },
    { id: 'exp_loan', name: 'Empréstimos / Financiamentos', type: 'EXPENSE' },

    // --- EXPENSES (OTHER) ---
    { id: 'exp_withdraw', name: 'Sangria de Caixa / Retirada Sócios', type: 'EXPENSE' },
    { id: 'exp_loss', name: 'Perdas / Quebras / Roubos', type: 'EXPENSE' },
    { id: 'exp_other', name: 'Outras Despesas', type: 'EXPENSE' }
];
