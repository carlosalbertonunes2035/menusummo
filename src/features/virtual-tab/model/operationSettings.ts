/**
 * Restaurant Operation Settings - Configurable per tenant
 * Allows each business to define their operational model
 */

/**
 * Service Model - How waiters operate
 */
export type ServiceModel =
    | 'DEDICATED'      // Garçom atende, leva e fecha (com taxa de serviço)
    | 'COLLABORATIVE'  // Qualquer garçom pode ajudar (sem taxa de serviço)
    | 'HYBRID';        // Garçom responsável + ajuda colaborativa

/**
 * Service Charge Configuration
 */
export interface ServiceChargeConfig {
    enabled: boolean;
    percentage: number;              // Ex: 10 (para 10%)

    // Quando cobrar
    chargeOn: {
        waiterService: boolean;        // Cobra se garçom atendeu
        selfService: boolean;          // Cobra mesmo em self-service
    };

    // Como distribuir
    distribution: 'INDIVIDUAL' | 'POOL' | 'HOUSE';
    // INDIVIDUAL: Garçom que atendeu fica com tudo
    // POOL: Divide entre todos garçons do turno
    // HOUSE: Vai para o estabelecimento
}

/**
 * Table Assignment Strategy
 */
export type TableAssignmentStrategy =
    | 'FIXED_SECTIONS'     // Garçons têm seções fixas (ex: Mesas 1-10)
    | 'ROTATION'           // Rodízio de mesas entre garçons
    | 'FIRST_COME'         // Primeiro garçom que atender
    | 'CUSTOMER_CHOICE';   // Cliente escolhe garçom

/**
 * Delivery Model
 */
export interface DeliveryConfig {
    model: 'WAITER_ONLY' | 'PICKUP_COUNTER' | 'HYBRID';

    // Se WAITER_ONLY
    waiterDelivery: {
        responsibleWaiterOnly: boolean;  // Só garçom responsável pode levar
        allowCollaborative: boolean;     // Outros garçons podem ajudar
        requireConfirmation: boolean;    // Cliente confirma recebimento
    };

    // Se PICKUP_COUNTER
    pickupCounter: {
        enabled: boolean;
        notifyCustomer: boolean;         // Notificar quando pronto
        notificationMethod: 'PUSH' | 'SMS' | 'DISPLAY';
        displayNumbers: boolean;         // Sistema de senhas
    };

    // Priorização
    priorityItems: string[];           // Categorias prioritárias (ex: "Bebida")
}

/**
 * Payment Configuration
 */
export interface PaymentConfig {
    // Métodos aceitos
    acceptedMethods: {
        cash: boolean;
        card: boolean;
        pix: boolean;
        voucher: boolean;
    };

    // Quem pode processar
    whoCanProcess: {
        waiter: boolean;                 // Garçom leva maquininha
        cashier: boolean;                // Cliente vai ao caixa
        selfService: boolean;            // Cliente paga sozinho (PIX/Card online)
    };

    // Regras
    requireWaiterForCash: boolean;     // Dinheiro só com garçom
    allowSplitBill: boolean;           // Permitir dividir conta
    autoCloseAfterPayment: boolean;    // Fechar mesa automaticamente
}

/**
 * Complete Restaurant Operation Settings
 */
export interface RestaurantOperationSettings {
    tenantId: string;

    // Modelo de Serviço
    serviceModel: ServiceModel;

    // Taxa de Serviço
    serviceCharge: ServiceChargeConfig;

    // Atribuição de Mesas
    tableAssignment: TableAssignmentStrategy;

    // Seções Fixas (se FIXED_SECTIONS)
    sections?: {
        name: string;
        tables: string[];              // IDs das mesas
        assignedWaiters: string[];     // IDs dos garçons
    }[];

    // Entrega
    delivery: DeliveryConfig;

    // Pagamento
    payment: PaymentConfig;

    // Regras Adicionais
    rules: {
        allowCustomerSelfOrder: boolean;    // Cliente pode pedir sozinho
        requireWaiterApproval: boolean;     // Pedido precisa aprovação
        autoAssignWaiter: boolean;          // Atribuir garçom automaticamente
        notifyOnNewOrder: boolean;          // Notificar garçons
        trackDeliveryTime: boolean;         // Rastrear tempo de entrega
    };

    // Gamificação
    gamification: {
        enabled: boolean;
        pointsForSpeed: boolean;
        pointsForVolume: boolean;
        pointsForSatisfaction: boolean;
        rewards: 'RANKING_ONLY' | 'MONETARY' | 'BENEFITS';
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Default settings for different business types
 */
export const DEFAULT_SETTINGS: Record<string, Partial<RestaurantOperationSettings>> = {
    // Restaurante tradicional com taxa de serviço
    TRADITIONAL_WITH_SERVICE: {
        serviceModel: 'DEDICATED',
        serviceCharge: {
            enabled: true,
            percentage: 10,
            chargeOn: {
                waiterService: true,
                selfService: false,
            },
            distribution: 'INDIVIDUAL',
        },
        tableAssignment: 'FIXED_SECTIONS',
        delivery: {
            model: 'WAITER_ONLY',
            waiterDelivery: {
                responsibleWaiterOnly: true,
                allowCollaborative: false,
                requireConfirmation: false,
            },
            pickupCounter: {
                enabled: false,
                notifyCustomer: false,
                notificationMethod: 'PUSH',
                displayNumbers: false,
            },
            priorityItems: ['Bebida'],
        },
        payment: {
            acceptedMethods: {
                cash: true,
                card: true,
                pix: true,
                voucher: true,
            },
            whoCanProcess: {
                waiter: true,
                cashier: true,
                selfService: false,
            },
            requireWaiterForCash: true,
            allowSplitBill: true,
            autoCloseAfterPayment: false,
        },
        rules: {
            allowCustomerSelfOrder: false,
            requireWaiterApproval: false,
            autoAssignWaiter: true,
            notifyOnNewOrder: true,
            trackDeliveryTime: true,
        },
        gamification: {
            enabled: false,
            pointsForSpeed: false,
            pointsForVolume: false,
            pointsForSatisfaction: false,
            rewards: 'RANKING_ONLY',
        },
    },

    // Bar/Espetinho sem taxa de serviço (colaborativo)
    CASUAL_NO_SERVICE: {
        serviceModel: 'COLLABORATIVE',
        serviceCharge: {
            enabled: false,
            percentage: 0,
            chargeOn: {
                waiterService: false,
                selfService: false,
            },
            distribution: 'POOL',
        },
        tableAssignment: 'FIRST_COME',
        delivery: {
            model: 'HYBRID',
            waiterDelivery: {
                responsibleWaiterOnly: false,
                allowCollaborative: true,
                requireConfirmation: false,
            },
            pickupCounter: {
                enabled: true,
                notifyCustomer: true,
                notificationMethod: 'PUSH',
                displayNumbers: true,
            },
            priorityItems: ['Bebida'],
        },
        payment: {
            acceptedMethods: {
                cash: true,
                card: true,
                pix: true,
                voucher: false,
            },
            whoCanProcess: {
                waiter: true,
                cashier: true,
                selfService: true,
            },
            requireWaiterForCash: false,
            allowSplitBill: true,
            autoCloseAfterPayment: true,
        },
        rules: {
            allowCustomerSelfOrder: true,
            requireWaiterApproval: false,
            autoAssignWaiter: false,
            notifyOnNewOrder: true,
            trackDeliveryTime: false,
        },
        gamification: {
            enabled: true,
            pointsForSpeed: true,
            pointsForVolume: true,
            pointsForSatisfaction: false,
            rewards: 'RANKING_ONLY',
        },
    },

    // Modelo híbrido (melhor dos dois mundos)
    HYBRID: {
        serviceModel: 'HYBRID',
        serviceCharge: {
            enabled: true,
            percentage: 10,
            chargeOn: {
                waiterService: true,
                selfService: false,
            },
            distribution: 'INDIVIDUAL',
        },
        tableAssignment: 'ROTATION',
        delivery: {
            model: 'HYBRID',
            waiterDelivery: {
                responsibleWaiterOnly: false,
                allowCollaborative: true,
                requireConfirmation: false,
            },
            pickupCounter: {
                enabled: true,
                notifyCustomer: true,
                notificationMethod: 'PUSH',
                displayNumbers: false,
            },
            priorityItems: ['Bebida'],
        },
        payment: {
            acceptedMethods: {
                cash: true,
                card: true,
                pix: true,
                voucher: true,
            },
            whoCanProcess: {
                waiter: true,
                cashier: true,
                selfService: true,
            },
            requireWaiterForCash: false,
            allowSplitBill: true,
            autoCloseAfterPayment: true,
        },
        rules: {
            allowCustomerSelfOrder: true,
            requireWaiterApproval: false,
            autoAssignWaiter: true,
            notifyOnNewOrder: true,
            trackDeliveryTime: true,
        },
        gamification: {
            enabled: true,
            pointsForSpeed: true,
            pointsForVolume: false,
            pointsForSatisfaction: true,
            rewards: 'BENEFITS',
        },
    },
};
