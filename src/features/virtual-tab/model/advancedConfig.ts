/**
 * Advanced Restaurant Configuration System
 * Complete control panel for restaurant owners
 */

/**
 * Service Charge Advanced Configuration
 */
export interface ServiceChargeAdvanced {
    // Básico
    enabled: boolean;
    percentage: number;                    // Ex: 10%

    // Distribuição
    distribution: {
        model: 'INDIVIDUAL' | 'POOL' | 'HOUSE' | 'MIXED';
        // INDIVIDUAL: 100% para garçom que atendeu
        // POOL: Divide igualmente entre todos do turno
        // HOUSE: 100% para o estabelecimento
        // MIXED: Parte garçom, parte casa

        split?: {
            waiterPercentage: number;          // Ex: 70% para garçom
            housePercentage: number;           // Ex: 30% para casa
        };
    };

    // Quando cobrar
    rules: {
        chargeOnWaiterService: boolean;      // Cobra se garçom atendeu
        chargeOnSelfService: boolean;        // Cobra mesmo em self-service
        chargeOnDelivery: boolean;           // Cobra em delivery
        chargeOnTakeout: boolean;            // Cobra em retirada

        minimumAmount?: number;              // Valor mínimo para cobrar (ex: R$ 20)
        maximumAmount?: number;              // Valor máximo (ex: R$ 50)
    };

    // Horários especiais
    schedules?: {
        weekday: number;                     // % em dias de semana
        weekend: number;                     // % em fins de semana
        peakHours: {
            enabled: boolean;
            hours: { start: string; end: string }[];
            percentage: number;                // % diferente em horário de pico
        };
    };

    // Exceções
    exceptions: {
        noChargeForChildren: boolean;        // Não cobra para crianças
        noChargeForSeniors: boolean;         // Não cobra para idosos
        noChargeForEmployees: boolean;       // Não cobra para funcionários
        customExemptions: string[];          // Outros isentos
    };

    // Transparência
    display: {
        showOnMenu: boolean;                 // Mostrar no cardápio
        showOnBill: boolean;                 // Mostrar na conta
        isOptional: boolean;                 // Cliente pode recusar
        message?: string;                    // Mensagem customizada
    };
}

/**
 * Peak Hours Configuration
 */
export interface PeakHoursConfig {
    enabled: boolean;

    periods: {
        name: string;                        // Ex: "Almoço", "Jantar", "Happy Hour"
        days: number[];                      // 0-6 (Dom-Sáb)
        startTime: string;                   // "12:00"
        endTime: string;                     // "14:00"

        multipliers: {
            serviceCharge?: number;            // Ex: 1.5x (15% ao invés de 10%)
            waiterBonus?: number;              // Bônus extra para garçom
            priority: 'HIGH' | 'NORMAL';       // Prioridade de atendimento
        };
    }[];
}

/**
 * Table Management Rules
 */
export interface TableManagementRules {
    // Tempo de ocupação
    timeouts: {
        maxOccupancyMinutes?: number;        // Tempo máximo na mesa
        warningAtMinutes?: number;           // Avisar cliente após X minutos
        autoCloseAfterMinutes?: number;      // Fechar automaticamente
    };

    // Reservas
    reservations: {
        enabled: boolean;
        advanceBookingDays: number;          // Quantos dias antes pode reservar
        depositRequired: boolean;            // Requer depósito
        depositAmount?: number;              // Valor do depósito
        cancellationPolicy: 'FLEXIBLE' | 'MODERATE' | 'STRICT';
        noShowFee?: number;                  // Multa por não comparecer
    };

    // Rotatividade
    turnover: {
        targetMinutes: number;               // Meta de tempo por mesa
        alertSlowTables: boolean;            // Alertar mesas lentas
        suggestMerge: boolean;               // Sugerir juntar mesas
    };

    // Limpeza
    cleaning: {
        estimatedMinutes: number;            // Tempo estimado de limpeza
        requiresConfirmation: boolean;       // Garçom confirma limpeza
        autoMarkClean: boolean;              // Marcar como limpa automaticamente
    };
}

/**
 * Customer Experience Rules
 */
export interface CustomerExperienceRules {
    // Pedido mínimo
    minimumOrder: {
        enabled: boolean;
        amount: number;                      // Ex: R$ 20 por pessoa
        perPerson: boolean;
        message?: string;
    };

    // Couvert
    coverCharge: {
        enabled: boolean;
        amount: number;                      // Ex: R$ 5 por pessoa
        includedItems?: string[];            // Ex: ["Pão", "Manteiga"]
        optional: boolean;                   // Cliente pode recusar
    };

    // Tempo de preparo
    preparationTime: {
        showEstimate: boolean;               // Mostrar tempo estimado
        notifyWhenReady: boolean;            // Notificar quando pronto
        allowTracking: boolean;              // Cliente pode rastrear pedido
    };

    // Feedback
    feedback: {
        requestAfterMeal: boolean;           // Pedir avaliação após refeição
        incentivize: boolean;                // Oferecer desconto por avaliação
        incentiveAmount?: number;            // Ex: 10% desconto
    };

    // Programa de fidelidade
    loyalty: {
        enabled: boolean;
        pointsPerReal: number;               // Ex: 1 ponto a cada R$ 1
        rewardThreshold: number;             // Ex: 100 pontos = R$ 10 desconto
        birthdayBonus?: number;              // Bônus no aniversário
    };
}

/**
 * Waiter Management Rules
 */
export interface WaiterManagementRules {
    // Distribuição de gorjetas
    tipDistribution: {
        model: 'INDIVIDUAL' | 'POOL' | 'POINTS';
        // INDIVIDUAL: Cada um fica com suas gorjetas
        // POOL: Divide igualmente
        // POINTS: Divide por pontos de desempenho

        poolRules?: {
            includeKitchen: boolean;           // Inclui cozinha na divisão
            kitchenPercentage?: number;        // % para cozinha
            includeBartender: boolean;         // Inclui bartender
            bartenderPercentage?: number;      // % para bartender
        };
    };

    // Metas e bônus
    targets: {
        enabled: boolean;
        daily: {
            salesTarget: number;               // Meta de vendas diária
            bonus: number;                     // Bônus se atingir
        };
        monthly: {
            salesTarget: number;
            bonus: number;
        };
    };

    // Avaliação
    performance: {
        trackResponseTime: boolean;          // Rastrear tempo de resposta
        trackCustomerRating: boolean;        // Rastrear avaliação do cliente
        trackSalesVolume: boolean;           // Rastrear volume de vendas

        penalties: {
            lateResponse: number;              // Penalidade por demora
            poorRating: number;                // Penalidade por má avaliação
            customerComplaint: number;         // Penalidade por reclamação
        };
    };

    // Turnos
    shifts: {
        morning: { start: string; end: string };
        afternoon: { start: string; end: string };
        evening: { start: string; end: string };

        minimumWaiters: {
            morning: number;
            afternoon: number;
            evening: number;
        };
    };
}

/**
 * Kitchen & Delivery Rules
 */
export interface KitchenDeliveryRules {
    // Priorização
    prioritization: {
        enabled: boolean;
        rules: {
            drinksFirst: boolean;              // Bebidas têm prioridade
            appetizersFirst: boolean;          // Entradas primeiro
            vipCustomers: boolean;             // Clientes VIP
            largeOrders: boolean;              // Pedidos grandes
        };
    };

    // Estações
    stations: {
        bar: {
            enabled: boolean;
            categories: string[];              // Categorias que vão para o bar
            printer?: string;                  // Impressora do bar
        };
        grill: {
            enabled: boolean;
            categories: string[];
            printer?: string;
        };
        kitchen: {
            enabled: boolean;
            categories: string[];
            printer?: string;
        };
        desserts: {
            enabled: boolean;
            categories: string[];
            printer?: string;
        };
    };

    // Balcão de retirada
    pickupCounter: {
        enabled: boolean;
        displaySystem: 'NUMBERS' | 'NAMES' | 'BOTH';
        notificationMethod: 'PUSH' | 'SMS' | 'DISPLAY' | 'ALL';
        autoCompleteMinutes: number;         // Auto-completar após X minutos
    };

    // Tempo de preparo
    preparationTimes: {
        drinks: number;                      // Minutos
        appetizers: number;
        mainCourse: number;
        desserts: number;

        alertIfExceeded: boolean;            // Alertar se ultrapassar
        autoEscalate: boolean;               // Escalar para gerente
    };
}

/**
 * Financial Rules
 */
export interface FinancialRules {
    // Formas de pagamento
    paymentMethods: {
        cash: {
            enabled: boolean;
            requiresChange: boolean;           // Tem troco
            maxChangeAmount?: number;          // Troco máximo
        };
        card: {
            enabled: boolean;
            acceptCredit: boolean;
            acceptDebit: boolean;
            minimumAmount?: number;            // Valor mínimo para cartão
            installments: {
                enabled: boolean;
                maxInstallments: number;
                minimumPerInstallment: number;
            };
        };
        pix: {
            enabled: boolean;
            qrCodeType: 'STATIC' | 'DYNAMIC';
            autoConfirm: boolean;              // Confirma automaticamente
        };
        voucher: {
            enabled: boolean;
            acceptedTypes: string[];           // Ex: ["Alelo", "Sodexo"]
        };
    };

    // Divisão de conta
    billSplitting: {
        enabled: boolean;
        methods: ('EQUAL' | 'BY_ITEM' | 'BY_PERCENTAGE' | 'CUSTOM')[];
        maxSplits: number;                   // Máximo de divisões
    };

    // Descontos
    discounts: {
        allowWaiterDiscount: boolean;        // Garçom pode dar desconto
        maxWaiterDiscount: number;           // Desconto máximo (%)
        requiresManagerApproval: number;     // Acima de X% precisa gerente

        automaticDiscounts: {
            happyHour: {
                enabled: boolean;
                percentage: number;
                days: number[];
                hours: { start: string; end: string };
                categories?: string[];           // Categorias com desconto
            };
            birthday: {
                enabled: boolean;
                percentage: number;
            };
            firstTime: {
                enabled: boolean;
                percentage: number;
            };
        };
    };

    // Taxas adicionais
    additionalFees: {
        deliveryFee?: number;
        packagingFee?: number;
        lateNightFee?: {                     // Taxa de madrugada
            enabled: boolean;
            amount: number;
            startTime: string;
            endTime: string;
        };
    };
}

/**
 * Security & Fraud Prevention
 */
export interface SecurityRules {
    // Prevenção de fraudes
    fraudPrevention: {
        maxOrdersPerSession: number;         // Máximo de pedidos por sessão
        maxAmountPerOrder: number;           // Valor máximo por pedido
        requirePhoneVerification: boolean;   // Verificar telefone
        blacklistEnabled: boolean;           // Sistema de blacklist

        suspiciousActivity: {
            multipleFailedPayments: number;    // Tentativas falhas
            rapidOrders: number;               // Pedidos muito rápidos
            highValueOrders: number;           // Pedidos de alto valor
        };
    };

    // Controle de acesso
    accessControl: {
        requireManagerForVoid: boolean;      // Gerente para cancelar
        requireManagerForDiscount: number;   // Gerente para desconto > X%
        requireManagerForRefund: boolean;    // Gerente para reembolso

        pinRequired: {
            voidOrder: boolean;
            largeDiscount: boolean;
            cashDrawer: boolean;
        };
    };

    // Auditoria
    audit: {
        logAllActions: boolean;              // Logar todas as ações
        videoRecording: boolean;             // Gravar vídeo (se disponível)
        requireReason: boolean;              // Exigir motivo para ações
    };
}

/**
 * Complete Restaurant Configuration
 */
export interface CompleteRestaurantConfig {
    tenantId: string;

    // Informações básicas
    basic: {
        name: string;
        type: 'RESTAURANT' | 'BAR' | 'CAFE' | 'FAST_FOOD' | 'FINE_DINING';
        cuisine: string[];
        capacity: number;
        tables: number;
    };

    // Configurações principais
    serviceCharge: ServiceChargeAdvanced;
    peakHours: PeakHoursConfig;
    tableManagement: TableManagementRules;
    customerExperience: CustomerExperienceRules;
    waiterManagement: WaiterManagementRules;
    kitchenDelivery: KitchenDeliveryRules;
    financial: FinancialRules;
    security: SecurityRules;

    // Operação
    operation: {
        serviceModel: 'DEDICATED' | 'COLLABORATIVE' | 'HYBRID';
        allowSelfService: boolean;
        allowReservations: boolean;
        allowDelivery: boolean;
        allowTakeout: boolean;
    };

    // Notificações
    notifications: {
        newOrder: ('PUSH' | 'SMS' | 'EMAIL' | 'SOUND')[];
        orderReady: ('PUSH' | 'SMS' | 'DISPLAY')[];
        billRequested: ('PUSH' | 'SOUND')[];
        customerWaiting: ('PUSH' | 'SOUND')[];
    };

    // Integrações
    integrations: {
        accounting?: string;                 // Ex: "ContaAzul"
        delivery?: string[];                 // Ex: ["iFood", "Rappi"]
        payment?: string;                    // Ex: "MercadoPago"
        erp?: string;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    lastModifiedBy: string;
}

/**
 * Configuration Presets for Quick Setup
 */
export const ADVANCED_PRESETS: Record<string, Partial<CompleteRestaurantConfig>> = {
    FINE_DINING: {
        basic: {
            type: 'FINE_DINING',
            name: 'Restaurante Fino',
            cuisine: ['Contemporânea'],
            capacity: 80,
            tables: 20,
        },
        serviceCharge: {
            enabled: true,
            percentage: 10,
            distribution: {
                model: 'INDIVIDUAL',
            },
            rules: {
                chargeOnWaiterService: true,
                chargeOnSelfService: false,
                chargeOnDelivery: false,
                chargeOnTakeout: false,
            },
            exceptions: {
                noChargeForChildren: false,
                noChargeForSeniors: false,
                noChargeForEmployees: true,
                customExemptions: [],
            },
            display: {
                showOnMenu: true,
                showOnBill: true,
                isOptional: false,
            },
        },
        operation: {
            serviceModel: 'DEDICATED',
            allowSelfService: false,
            allowReservations: true,
            allowDelivery: false,
            allowTakeout: false,
        },
    },

    CASUAL_BAR: {
        basic: {
            type: 'BAR',
            name: 'Bar Casual',
            cuisine: ['Petiscos', 'Bebidas'],
            capacity: 120,
            tables: 30,
        },
        serviceCharge: {
            enabled: false,
            percentage: 0,
            distribution: {
                model: 'POOL',
            },
            rules: {
                chargeOnWaiterService: false,
                chargeOnSelfService: false,
                chargeOnDelivery: false,
                chargeOnTakeout: false,
            },
            exceptions: {
                noChargeForChildren: false,
                noChargeForSeniors: false,
                noChargeForEmployees: false,
                customExemptions: [],
            },
            display: {
                showOnMenu: false,
                showOnBill: false,
                isOptional: false,
            },
        },
        operation: {
            serviceModel: 'COLLABORATIVE',
            allowSelfService: true,
            allowReservations: false,
            allowDelivery: true,
            allowTakeout: true,
        },
    },
};
