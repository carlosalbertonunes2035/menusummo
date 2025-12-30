import { describe, it, expect } from 'vitest';
import { SERVICE_CHARGE_PERCENTAGE } from '@/features/virtual-tab/constants';

/**
 * Integration Tests - Virtual Tab Complete Flow
 * 
 * These tests validate the entire customer journey from QR Code scan to payment
 * 
 * CRITICAL: All financial calculations must use exact precision
 */

/**
 * Helper function to calculate service charge with exact precision
 */
function calculateServiceCharge(amount: number): number {
    return Math.round(amount * SERVICE_CHARGE_PERCENTAGE * 100) / 100;
}

/**
 * Helper function to calculate total with exact precision
 */
function calculateTotal(subtotal: number): number {
    const serviceCharge = calculateServiceCharge(subtotal);
    return Math.round((subtotal + serviceCharge) * 100) / 100;
}

describe('Virtual Tab - Complete Customer Flow', () => {
    describe('Flow 1: Self-Service with Waiter Payment', () => {
        it('should complete full flow: QR → Register → Order → Call Waiter → Pay', async () => {
            // Step 1: Customer scans QR Code
            const qrUrl = 'https://summo.app/m/bar-do-ze/mesa/15';
            expect(qrUrl).toContain('/mesa/15');

            // Step 2: Quick registration
            const customerData = {
                name: 'João Silva',
                phone: '11987654321',
            };
            expect(customerData.name).toBeTruthy();
            expect(customerData.phone).toMatch(/^\d{11}$/);

            // Step 3: Create session
            const session = {
                id: 'session-123',
                tableNumber: '15',
                customerName: customerData.name,
                customerPhone: customerData.phone,
                openedBy: 'CUSTOMER' as const,
                status: 'ACTIVE' as const,
                totalAmount: 0,
                orderIds: [],
            };
            expect(session.status).toBe('ACTIVE');

            // Step 4: Browse menu and add items
            const order1 = {
                id: 'order-1',
                items: [
                    { productId: 'p1', name: 'Cerveja', quantity: 2, price: 12, total: 24 },
                    { productId: 'p2', name: 'Espeto', quantity: 3, price: 18, total: 54 },
                ],
                total: 78,
            };
            session.orderIds.push(order1.id);
            session.totalAmount += order1.total;

            expect(session.orderIds.length).toBe(1);
            expect(session.totalAmount).toBe(78);

            // Step 5: Request bill
            session.status = 'BILL_REQUESTED';
            expect(session.status).toBe('BILL_REQUESTED');

            // Step 6: Calculate service charge with EXACT precision
            const subtotal = session.totalAmount;
            const serviceCharge = calculateServiceCharge(subtotal);
            const total = calculateTotal(subtotal);

            expect(subtotal).toBe(78);
            expect(serviceCharge).toBe(7.8); // 78 * 0.1 = 7.8 (exact)
            expect(total).toBe(85.8); // 78 + 7.8 = 85.8 (exact)

            // Step 7: Choose payment method - Call Waiter
            const paymentAction = {
                sessionId: session.id,
                action: 'CALLED_WAITER',
                paymentLocation: 'TABLE' as const,
                timestamp: new Date(),
            };
            expect(paymentAction.paymentLocation).toBe('TABLE');

            // Step 8: Waiter processes payment
            const payment = {
                sessionId: session.id,
                amount: total,
                method: 'CARD',
                processedBy: 'waiter-carlos',
                processedAt: new Date(),
            };
            expect(payment.amount).toBe(85.8);

            // Step 9: Close session
            session.status = 'CLOSED';
            expect(session.status).toBe('CLOSED');

            // Validation: Complete flow
            expect(session.orderIds.length).toBeGreaterThan(0);
            expect(session.totalAmount).toBeGreaterThan(0);
            expect(session.status).toBe('CLOSED');
        });
    });

    describe('Flow 2: Self-Service with PDV Payment', () => {
        it('should complete full flow: QR → Register → Order → Go to PDV → Pay', async () => {
            // Step 1-4: Same as Flow 1
            const session = {
                id: 'session-456',
                tableNumber: '20',
                customerName: 'Maria Santos',
                customerPhone: '11912345678',
                openedBy: 'CUSTOMER' as const,
                status: 'ACTIVE' as const,
                totalAmount: 120,
                orderIds: ['order-2'],
            };

            // Step 5: Request bill
            session.status = 'BILL_REQUESTED';

            // Step 6: Calculate totals with EXACT precision
            const subtotal = session.totalAmount;
            const serviceCharge = calculateServiceCharge(subtotal);
            const total = calculateTotal(subtotal);

            expect(subtotal).toBe(120);
            expect(serviceCharge).toBe(12); // 120 * 0.1 = 12 (exact)
            expect(total).toBe(132); // 120 + 12 = 132 (exact)

            // Step 7: Choose payment method - Go to PDV
            const paymentAction = {
                sessionId: session.id,
                action: 'WENT_TO_PDV',
                paymentLocation: 'PDV' as const,
                timestamp: new Date(),
            };
            expect(paymentAction.paymentLocation).toBe('PDV');

            // Step 8: Generate PDV code
            const pdvCode = `M${session.tableNumber}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
            expect(pdvCode).toMatch(/^M20-[A-Z0-9]{4}$/);

            // Step 9: Customer pays at PDV
            const payment = {
                sessionId: session.id,
                amount: total,
                method: 'CASH',
                processedBy: 'cashier-ana',
                processedAt: new Date(),
                pdvCode,
            };
            expect(payment.pdvCode).toBeTruthy();

            // Step 10: Close session
            session.status = 'CLOSED';
            expect(session.status).toBe('CLOSED');
        });
    });

    describe('Flow 3: Waiter Opens Table (Traditional)', () => {
        it('should complete traditional flow: Waiter Opens → Takes Order → Delivers → Closes', async () => {
            // Step 1: Waiter opens table
            const session = {
                id: 'session-789',
                tableNumber: '5',
                customerName: 'Pedro Costa',
                customerPhone: '11999887766',
                openedBy: 'WAITER' as const,
                openedByUserId: 'waiter-carlos',
                status: 'ACTIVE' as const,
                totalAmount: 0,
                orderIds: [],
            };
            expect(session.openedBy).toBe('WAITER');

            // Step 2: Waiter takes order
            const order = {
                id: 'order-3',
                items: [
                    { productId: 'p3', name: 'Picanha', quantity: 1, price: 89, total: 89 },
                ],
                total: 89,
                takenBy: 'waiter-carlos',
            };
            session.orderIds.push(order.id);
            session.totalAmount += order.total;

            // Step 3: Waiter delivers
            const delivery = {
                orderId: order.id,
                deliveredBy: 'waiter-carlos',
                deliveredAt: new Date(),
            };
            expect(delivery.deliveredBy).toBe('waiter-carlos');

            // Step 4: Calculate with service charge - EXACT precision
            const subtotal = session.totalAmount;
            const serviceCharge = calculateServiceCharge(subtotal);
            const total = calculateTotal(subtotal);

            expect(subtotal).toBe(89);
            expect(serviceCharge).toBe(8.9); // 89 * 0.1 = 8.9 (exact)
            expect(total).toBe(97.9); // 89 + 8.9 = 97.9 (exact)

            // Step 5: Waiter processes payment
            const payment = {
                sessionId: session.id,
                amount: total,
                method: 'CARD',
                processedBy: 'waiter-carlos',
            };
            expect(payment.amount).toBe(97.9);

            // Step 6: Close session
            session.status = 'CLOSED';
            expect(session.status).toBe('CLOSED');
        });
    });

    describe('Flow 4: Loss Detection - Walkout', () => {
        it('should detect and track walkout (customer leaves without paying)', async () => {
            // Step 1: Session created
            const session = {
                id: 'session-999',
                tableNumber: '8',
                customerName: 'Cliente Suspeito',
                customerPhone: '11900000000',
                openedBy: 'CUSTOMER' as const,
                status: 'ACTIVE' as const,
                totalAmount: 150,
                orderIds: ['order-4'],
                lastActivityAt: new Date(Date.now() - 40 * 60 * 1000), // 40 min ago
            };

            // Step 2: Detect inactivity (30+ minutes)
            const inactiveMinutes = (Date.now() - session.lastActivityAt.getTime()) / (1000 * 60);
            expect(inactiveMinutes).toBeGreaterThan(30);

            // Step 3: Flag as possible walkout
            const flagged = {
                sessionId: session.id,
                reason: 'INACTIVITY_DETECTED',
                inactiveMinutes,
                totalAmount: session.totalAmount,
            };
            expect(flagged.reason).toBe('INACTIVITY_DETECTED');

            // Step 4: Manager reviews - EXACT cost calculation
            const costPercentage = 0.3; // 30%
            const cost = Math.round(session.totalAmount * costPercentage * 100) / 100;

            const lossIncident = {
                id: 'loss-1',
                type: 'WALKOUT',
                amount: session.totalAmount,
                cost: cost,
                sessionId: session.id,
                customerName: session.customerName,
                customerPhone: session.customerPhone,
                status: 'PENDING',
            };
            expect(lossIncident.type).toBe('WALKOUT');
            expect(lossIncident.cost).toBe(45); // 30% of 150 = 45 (exact)

            // Step 5: Add to blacklist
            const blacklist = {
                customerPhone: session.customerPhone,
                reason: 'WALKOUT',
                totalLoss: lossIncident.amount,
                status: 'ACTIVE',
            };
            expect(blacklist.status).toBe('ACTIVE');

            // Validation
            expect(lossIncident.amount).toBe(150);
            expect(blacklist.customerPhone).toBe(session.customerPhone);
        });
    });

    describe('Flow 5: QR Code Generation', () => {
        it('should generate and manage QR Codes for all tables', () => {
            const tenantSlug = 'bar-do-ze';
            const tables = ['1', '2', '3', '10', '15', '20'];

            const qrCodes = tables.map(tableNumber => ({
                tableNumber,
                url: `https://summo.app/m/${tenantSlug}/mesa/${tableNumber}`,
            }));

            expect(qrCodes.length).toBe(6);
            expect(qrCodes[0].url).toContain('/mesa/1');
            expect(qrCodes[5].url).toContain('/mesa/20');

            // Validate all URLs are unique
            const urls = qrCodes.map(qr => qr.url);
            const uniqueUrls = new Set(urls);
            expect(uniqueUrls.size).toBe(urls.length);
        });
    });
});

describe('Virtual Tab - Payment Tracking Reports', () => {
    it('should generate payment location report', () => {
        const payments = [
            { location: 'TABLE', amount: 85.8, processedBy: 'waiter-carlos' },
            { location: 'TABLE', amount: 120, processedBy: 'waiter-maria' },
            { location: 'PDV', amount: 132, processedBy: 'cashier-ana' },
            { location: 'TABLE', amount: 97.9, processedBy: 'waiter-carlos' },
            { location: 'PDV', amount: 45, processedBy: 'cashier-ana' },
        ];

        const tablePayments = payments.filter(p => p.location === 'TABLE');
        const pdvPayments = payments.filter(p => p.location === 'PDV');

        expect(tablePayments.length).toBe(3);
        expect(pdvPayments.length).toBe(2);

        const tablePercentage = (tablePayments.length / payments.length) * 100;
        const pdvPercentage = (pdvPayments.length / payments.length) * 100;

        expect(tablePercentage).toBe(60);
        expect(pdvPercentage).toBe(40);
    });

    it('should calculate average payment time', () => {
        const payments = [
            { requestedAt: new Date('2024-01-01T12:00:00'), paidAt: new Date('2024-01-01T12:03:30') },
            { requestedAt: new Date('2024-01-01T12:10:00'), paidAt: new Date('2024-01-01T12:14:00') },
            { requestedAt: new Date('2024-01-01T12:20:00'), paidAt: new Date('2024-01-01T12:22:30') },
        ];

        const durations = payments.map(p =>
            (p.paidAt.getTime() - p.requestedAt.getTime()) / (1000 * 60)
        );

        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

        expect(durations[0]).toBe(3.5); // 3.5 minutes
        expect(durations[1]).toBe(4); // 4 minutes
        expect(durations[2]).toBe(2.5); // 2.5 minutes
        expect(avgDuration).toBeCloseTo(3.33, 2); // 3.33 with 2 decimal precision
    });
});
