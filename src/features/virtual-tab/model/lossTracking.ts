/**
 * Loss Tracking System - Complete traceability and financial loss control
 * Never lose track of what happened and how much was lost
 */

/**
 * Loss Type - Different types of losses
 */
export type LossType =
    | 'WALKOUT'           // Cliente fugiu sem pagar
    | 'CANCELLED_ORDER'   // Pedido cancelado
    | 'KITCHEN_ERROR'     // Erro da cozinha (queimou, errado)
    | 'WAITER_ERROR'      // Erro do garçom (derrubou, esqueceu)
    | 'CUSTOMER_COMPLAINT'// Cliente reclamou e não pagou
    | 'SYSTEM_ERROR'      // Erro do sistema
    | 'ORPHAN_ORDER'      // Pedido órfão (sem sessão)
    | 'EXPIRED_PRODUCT'   // Produto venceu
    | 'OTHER';            // Outro motivo

/**
 * Loss Incident - Complete record of a loss
 */
export interface LossIncident {
    id: string;
    tenantId: string;

    // Tipo e Valor
    type: LossType;
    amount: number;                  // Valor da perda em R$
    cost: number;                    // Custo real dos produtos

    // Contexto
    tableId?: string;
    tableNumber?: string;
    sessionId?: string;
    orderId?: string;

    // Rastreabilidade: Quem estava envolvido
    tracking: {
        openedBy?: string;             // Quem abriu a mesa
        openedByName?: string;

        attendedBy?: string;           // Quem atendeu
        attendedByName?: string;

        deliveredBy?: string[];        // Quem(s) levou(levaram)
        deliveredByNames?: string[];

        lastWaiterId?: string;         // Último garçom responsável
        lastWaiterName?: string;
    };

    // Detalhes do Incidente
    details: {
        customerName?: string;
        customerPhone?: string;

        items: LossItem[];             // Itens perdidos

        description: string;           // Descrição do que aconteceu
        evidence?: string[];           // URLs de fotos/vídeos

        reportedBy: string;            // Quem reportou
        reportedByName: string;
        reportedAt: Date;

        reviewedBy?: string;           // Gerente que revisou
        reviewedByName?: string;
        reviewedAt?: Date;

        approved: boolean;             // Perda aprovada pelo gerente?
        approvalNotes?: string;
    };

    // Timeline
    timeline: LossTimelineEvent[];

    // Status
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISPUTED';

    // Ações Tomadas
    actions: {
        notifiedManager: boolean;
        notifiedOwner: boolean;
        customerBlacklisted: boolean;
        waiterWarned: boolean;
        processImproved: boolean;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Loss Item - Individual item that was lost
 */
export interface LossItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    totalPrice: number;
    totalCost: number;

    // Detalhes
    category: string;
    preparedBy?: string;             // Quem preparou
    deliveredBy?: string;            // Quem levou

    // Status quando perdido
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
}

/**
 * Loss Timeline Event
 */
export interface LossTimelineEvent {
    timestamp: Date;
    actor: string;                   // User ID
    actorName: string;
    action: string;
    details?: string;
}

/**
 * Table Session Complete Tracking
 */
export interface TableSessionTracking {
    sessionId: string;
    tableId: string;
    tableNumber: string;

    // Quem abriu
    openedBy: 'CUSTOMER' | 'WAITER' | 'SYSTEM';
    openedByUserId: string;
    openedByName: string;
    openedAt: Date;

    // Cliente
    customerName: string;
    customerPhone: string;
    customerHistory?: {
        totalVisits: number;
        totalSpent: number;
        averageTicket: number;
        lastVisit: Date;
        hasWalkouts: boolean;           // Já fugiu antes?
        walkoutCount: number;
    };

    // Garçons envolvidos
    waitersInvolved: {
        waiterId: string;
        waiterName: string;
        role: 'OPENER' | 'ATTENDANT' | 'DELIVERER' | 'CLOSER';
        actions: string[];              // ['OPENED_TABLE', 'TOOK_ORDER', 'DELIVERED_ITEM']
        timestamp: Date;
    }[];

    // Pedidos
    orders: {
        orderId: string;
        createdAt: Date;
        createdBy: string;
        items: number;
        total: number;
        status: string;
    }[];

    // Entregas
    deliveries: {
        itemId: string;
        productName: string;
        deliveredBy: string;
        deliveredByName: string;
        deliveredAt: Date;
    }[];

    // Pagamentos
    payments: {
        method: string;
        amount: number;
        processedBy: string;
        processedByName: string;
        processedAt: Date;
    }[];

    // Fechamento
    closedBy?: string;
    closedByName?: string;
    closedAt?: Date;
    closeReason: 'PAID' | 'WALKOUT' | 'CANCELLED' | 'SYSTEM_ERROR';

    // Totais
    totalOrdered: number;
    totalPaid: number;
    totalLoss: number;                // Se walkout

    // Flags
    hasIssues: boolean;
    issueType?: 'WALKOUT' | 'COMPLAINT' | 'ERROR' | 'DELAY';

    // Duração
    durationMinutes: number;
}

/**
 * Loss Report - Aggregated loss data
 */
export interface LossReport {
    tenantId: string;
    period: {
        start: Date;
        end: Date;
    };

    // Totais
    summary: {
        totalIncidents: number;
        totalLossAmount: number;        // Valor total perdido
        totalLossCost: number;          // Custo real total

        byType: Record<LossType, {
            count: number;
            amount: number;
            cost: number;
        }>;

        byWaiter: Record<string, {
            waiterId: string;
            waiterName: string;
            incidents: number;
            amount: number;
        }>;

        byDay: Record<string, {
            date: Date;
            incidents: number;
            amount: number;
        }>;

        byShift: {
            morning: { incidents: number; amount: number };
            afternoon: { incidents: number; amount: number };
            evening: { incidents: number; amount: number };
        };
    };

    // Top Perdas
    topIncidents: LossIncident[];     // 10 maiores perdas

    // Tendências
    trends: {
        walkoutRate: number;            // % de mesas que fugiram
        averageLoss: number;            // Perda média por incidente
        mostCommonType: LossType;
        mostProblematicWaiter?: string;
        mostProblematicDay?: string;
        mostProblematicShift?: string;
    };

    // Recomendações
    recommendations: string[];

    // Metadata
    generatedAt: Date;
    generatedBy: string;
}

/**
 * Customer Blacklist Entry
 */
export interface CustomerBlacklist {
    id: string;
    tenantId: string;

    // Cliente
    customerPhone: string;
    customerName: string;

    // Motivo
    reason: 'WALKOUT' | 'FRAUD' | 'ABUSE' | 'OTHER';
    incidentIds: string[];            // IDs dos incidentes
    totalLoss: number;

    // Status
    status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

    // Ações
    allowedActions: {
        canOrder: boolean;
        requiresPrepayment: boolean;
        requiresManagerApproval: boolean;
    };

    // Resolução
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionNotes?: string;

    // Metadata
    createdAt: Date;
    expiresAt?: Date;
}

/**
 * Waiter Performance Impact
 */
export interface WaiterLossImpact {
    waiterId: string;
    waiterName: string;
    period: {
        start: Date;
        end: Date;
    };

    // Perdas
    losses: {
        total: number;
        asOpener: number;               // Perdas em mesas que abriu
        asAttendant: number;            // Perdas em mesas que atendeu
        asDeliverer: number;            // Perdas em entregas que fez
    };

    // Contexto
    context: {
        tablesOpened: number;
        ordersDelivered: number;
        lossRate: number;               // % de perdas
    };

    // Comparação
    comparison: {
        averageLossRate: number;        // Média do estabelecimento
        ranking: number;                // Posição no ranking
        totalWaiters: number;
    };

    // Status
    needsAttention: boolean;
    warningIssued: boolean;
    trainingRequired: boolean;
}
