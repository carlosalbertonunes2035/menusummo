import { z } from 'zod';

/**
 * Validation Schemas for Virtual Tab
 * Following industry best practices for runtime type safety
 */

// Customer Registration Schema
export const QuickRegistrationSchema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome muito longo')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

    phone: z.string()
        .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
        .transform(phone => phone.replace(/\D/g, '')),
});

export type QuickRegistrationInput = z.infer<typeof QuickRegistrationSchema>;

// Table Session Schema
export const TableSessionSchema = z.object({
    id: z.string().uuid('ID inválido'),
    tableNumber: z.string().min(1, 'Número da mesa obrigatório'),
    customerName: z.string().min(2, 'Nome do cliente obrigatório'),
    customerPhone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
    openedBy: z.enum(['CUSTOMER', 'WAITER', 'MANAGER']),
    openedByUserId: z.string().optional(),
    status: z.enum(['ACTIVE', 'BILL_REQUESTED', 'PAYING', 'CLOSED']),
    totalAmount: z.number().min(0, 'Total não pode ser negativo'),
    orderIds: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
    closedAt: z.date().optional(),
});

export type ValidatedTableSession = z.infer<typeof TableSessionSchema>;

// Payment Tracking Schema
export const PaymentTrackingSchema = z.object({
    sessionId: z.string().uuid(),
    tableNumber: z.string(),
    customerName: z.string(),
    customerPhone: z.string(),

    // Totals
    subtotal: z.number().min(0),
    serviceCharge: z.number().min(0),
    total: z.number().min(0),

    // Payment method
    paymentLocation: z.enum(['TABLE', 'PDV']),
    paymentMethod: z.enum(['CASH', 'CARD', 'PIX']).optional(),

    // Who processed
    processedBy: z.string(),
    processedByName: z.string(),

    // When
    requestedAt: z.date(),
    paidAt: z.date().optional(),
    duration: z.number().min(0).optional(), // minutes

    // Traceability
    waiterCalled: z.boolean().default(false),
    wentToPDV: z.boolean().default(false),
});

export type ValidatedPaymentTracking = z.infer<typeof PaymentTrackingSchema>;

// Loss Incident Schema
export const LossIncidentSchema = z.object({
    id: z.string().uuid(),
    type: z.enum([
        'WALKOUT',
        'CANCELLED_ORDER',
        'KITCHEN_ERROR',
        'WAITER_ERROR',
        'CUSTOMER_COMPLAINT',
        'ORPHAN_ORDER',
        'EXPIRED_PRODUCT',
        'SYSTEM_ERROR',
        'OTHER',
    ]),
    amount: z.number().min(0),
    cost: z.number().min(0),
    sessionId: z.string().uuid(),
    customerName: z.string(),
    customerPhone: z.string(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    reason: z.string().optional(),
    approvedBy: z.string().optional(),
    approvedAt: z.date().optional(),
    createdAt: z.date(),
});

export type ValidatedLossIncident = z.infer<typeof LossIncidentSchema>;

// QR Code Generation Schema
export const QRCodeGenerationSchema = z.object({
    tenantSlug: z.string()
        .min(3, 'Slug deve ter pelo menos 3 caracteres')
        .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),

    tableNumber: z.string()
        .min(1, 'Número da mesa obrigatório')
        .regex(/^[0-9A-Za-z]+$/, 'Número da mesa inválido'),
});

export type ValidatedQRCodeGeneration = z.infer<typeof QRCodeGenerationSchema>;

// Service Charge Calculation Schema
export const ServiceChargeCalculationSchema = z.object({
    subtotal: z.number()
        .min(0, 'Subtotal não pode ser negativo')
        .finite('Subtotal deve ser um número válido'),

    serviceChargePercentage: z.number()
        .min(0, 'Percentual não pode ser negativo')
        .max(1, 'Percentual não pode ser maior que 100%')
        .default(0.1),
});

export type ValidatedServiceChargeCalculation = z.infer<typeof ServiceChargeCalculationSchema>;

/**
 * Validation Helper Functions
 */

export function validateQuickRegistration(data: unknown) {
    return QuickRegistrationSchema.parse(data);
}

export function validateTableSession(data: unknown) {
    return TableSessionSchema.parse(data);
}

export function validatePaymentTracking(data: unknown) {
    return PaymentTrackingSchema.parse(data);
}

export function validateLossIncident(data: unknown) {
    return LossIncidentSchema.parse(data);
}

export function validateQRCodeGeneration(data: unknown) {
    return QRCodeGenerationSchema.parse(data);
}

export function validateServiceChargeCalculation(data: unknown) {
    return ServiceChargeCalculationSchema.parse(data);
}

/**
 * Safe validation (returns result instead of throwing)
 */

export function safeValidateQuickRegistration(data: unknown) {
    return QuickRegistrationSchema.safeParse(data);
}

export function safeValidateTableSession(data: unknown) {
    return TableSessionSchema.safeParse(data);
}

export function safeValidatePaymentTracking(data: unknown) {
    return PaymentTrackingSchema.safeParse(data);
}
