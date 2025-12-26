import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { processStockDeduction } from '../services/stockService';

/**
 * CRM Auto-Update Trigger
 */
export const onOrderCreated = functions.region('southamerica-east1').firestore
    .document('orders/{orderId}')
    .onCreate(async (snapshot, context) => {
        const db = admin.firestore();
        const orderData = snapshot.data();
        const { tenantId, customerPhone, customerName, total, deliveryAddress, location } = orderData;

        if (!customerPhone || customerName === 'Cliente Balcão') return null;

        const cleanPhone = customerPhone.replace(/\D/g, '');
        if (cleanPhone.length < 8) return null;

        const customerRef = db.collection('customers').doc(`cust-${cleanPhone}`);

        return db.runTransaction(async (transaction) => {
            const customerDoc = await transaction.get(customerRef);

            if (customerDoc.exists) {
                const data = customerDoc.data();
                transaction.update(customerRef, {
                    totalSpent: (data?.totalSpent || 0) + total,
                    totalOrders: (data?.totalOrders || 0) + 1,
                    lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
                    address: deliveryAddress || data?.address || '',
                    location: location || data?.location || null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                transaction.set(customerRef, {
                    id: `cust-${cleanPhone}`,
                    tenantId,
                    name: customerName,
                    phone: customerPhone,
                    address: deliveryAddress || '',
                    totalSpent: total,
                    totalOrders: 1,
                    lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
                    location: location || null,
                    segments: ['NEW'],
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    });

/**
 * Stock Deduction Trigger
 */
export const onOrderStatusUpdated = functions.region('southamerica-east1').firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (newData.status === 'COMPLETED' && oldData.status !== 'COMPLETED') {
            const { tenantId, items } = newData;
            if (!items || !Array.isArray(items)) return null;

            for (const item of items) {
                await processStockDeduction(item.productId, item.quantity, tenantId, change.after.id);
            }
        }
        return null;
    });
