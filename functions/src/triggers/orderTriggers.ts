import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { processStockDeduction } from '../services/stockService';

/**
 * CRM Auto-Update Trigger
 */
export const onOrderCreated = onDocumentCreated(
    {
        document: 'orders/{orderId}',
        region: 'southamerica-east1'
    },
    async (event) => {
        const db = admin.firestore();
        const snapshot = event.data;
        if (!snapshot) return;

        const orderData = snapshot.data();
        const { tenantId, customerPhone, customerName, total, deliveryAddress, location } = orderData;

        // --- LOYALTY LOGIC ---
        // 1. Redemption (Deduction)
        if (orderData.loyaltyPointsUsed && orderData.loyaltyPointsUsed > 0) {
            console.log(`Processing Loyalty Redemption for Order ${snapshot.id}: ${orderData.loyaltyPointsUsed} points`);

            // Deduct points immediately
            // Note: We use the same customerRef logic as below
            const cleanPhone = customerPhone.replace(/\D/g, '');
            if (cleanPhone.length >= 8) {
                const customerRef = db.collection('customers').doc(`cust-${cleanPhone}`);

                await db.runTransaction(async (t) => {
                    const doc = await t.get(customerRef);
                    if (doc.exists) {
                        const currentPoints = doc.data()?.loyaltyPoints || 0;
                        // Validate balance (Optional strict check, or allow negative? Let's go strict)
                        if (currentPoints >= orderData.loyaltyPointsUsed) {
                            t.update(customerRef, {
                                loyaltyPoints: admin.firestore.FieldValue.increment(-orderData.loyaltyPointsUsed),
                                loyaltyHistory: admin.firestore.FieldValue.arrayUnion({
                                    id: snapshot.id,
                                    date: new Date(),
                                    type: 'REDEEM',
                                    amount: -orderData.loyaltyPointsUsed,
                                    description: `Resgate no pedido #${orderData.orderId || snapshot.id}`, // Assuming friendly ID exists or use ID
                                    orderId: snapshot.id
                                })
                            });
                        } else {
                            console.warn(`Customer ${cleanPhone} has insufficient points (${currentPoints}) for redemption (${orderData.loyaltyPointsUsed}). Skipping deduction.`);
                            // TODO: Flag order as "Fraud Risk"? Or just ignore.
                        }
                    }
                });
            }
        }

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
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    loyaltyPoints: 0 // Initialize for new users
                });
            }
        });
    }
);

/**
 * Stock Deduction & Loyalty Earning Trigger
 */
export const onOrderStatusUpdated = onDocumentUpdated(
    {
        document: 'orders/{orderId}',
        region: 'southamerica-east1'
    },
    async (event) => {
        const change = event.data;
        if (!change) return;

        const newData = change.after.data();
        const oldData = change.before.data();
        const db = admin.firestore();

        // Stock Deduction
        if (newData.status === 'COMPLETED' && oldData.status !== 'COMPLETED') {
            const { tenantId, items, total, customerPhone } = newData;

            // 1. Stock
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    await processStockDeduction(item.productId, item.quantity, tenantId, change.after.id);
                }
            }

            // 2. Loyalty Earning
            // Only earn if valid customer and total > 0
            if (customerPhone && total > 0) {
                const cleanPhone = customerPhone.replace(/\D/g, '');
                if (cleanPhone.length >= 8) {
                    // Get Settings to know Points Ratio
                    // Assuming single tenant for now or fetching tenant settings
                    // Where are settings? 'tenants/{tenantId}' or 'settings/store_default'
                    // Robust approach: Check if 'loyalty' settings are in the Order (snapshot) or fetch from DB
                    // Since we don't snapshot settings, we fetch.

                    let pointsToEarn = 0;
                    let enabled = false;

                    // Attempt to fetch settings
                    // Try 'settings/store_default' (Standard) or 'tenants/{tenantId}'
                    const settingsDoc = await db.doc(tenantId ? `tenants/${tenantId}` : 'settings/store_default').get();
                    if (settingsDoc.exists) {
                        const s = settingsDoc.data();
                        if (s?.loyalty?.enabled) {
                            enabled = true;
                            const ratio = s.loyalty.pointsPerCurrency || 1;
                            pointsToEarn = Math.floor(total * ratio);
                        }
                    } else {
                        // As fallback, check 'settings/store_default' if tenantId failed
                        const fallback = await db.doc('settings/store_default').get();
                        if (fallback.exists && fallback.data()?.loyalty?.enabled) {
                            const s = fallback.data();
                            enabled = true;
                            const ratio = s?.loyalty?.pointsPerCurrency || 1;
                            pointsToEarn = Math.floor(total * ratio);
                        }
                    }

                    if (enabled && pointsToEarn > 0) {
                        console.log(`Awarding ${pointsToEarn} points to ${cleanPhone}`);
                        const customerRef = db.collection('customers').doc(`cust-${cleanPhone}`);
                        await customerRef.update({
                            loyaltyPoints: admin.firestore.FieldValue.increment(pointsToEarn),
                            loyaltyHistory: admin.firestore.FieldValue.arrayUnion({
                                id: change.after.id + '_EARN',
                                date: new Date(),
                                type: 'EARN',
                                amount: pointsToEarn,
                                description: `Compra realizada (R$ ${total.toFixed(2)})`,
                                orderId: change.after.id
                            })
                        });
                    }
                }
            }
        }
    }
);
