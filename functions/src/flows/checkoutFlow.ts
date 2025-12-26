import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

/**
 * Secure Checkout Flow
 * Recalculates totals and validates order before persisting to Firestore.
 */
export const secureCheckout = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    const {
        tenantId, items, customerName, customerPhone,
        type, deliveryFee, discountTotal, couponCode,
        deliveryAddress, location, paymentMethod, change,
        scheduledTo, tableNumber, notes
    } = data;

    if (!tenantId || !items || !Array.isArray(items)) {
        throw new functions.https.HttpsError('invalid-argument', 'Dados inválidos: tenantId e items são obrigatórios.');
    }

    try {
        let itemsTotal = 0;
        const validatedItems = [];

        // 1. Validate Items & Prices
        for (const item of items) {
            const productId = item.productId || item.id;
            const productDoc = await db.collection('products').doc(productId).get();

            if (!productDoc.exists) {
                throw new functions.https.HttpsError('not-found', `Produto não encontrado: ${productId}`);
            }

            const productData = productDoc.data();

            // Determine Channel and Price
            const origin = data.origin || 'DIGITAL_MENU';
            const targetChannel = origin === 'POS' ? 'pos' : 'digital-menu';

            let basePrice = 0;
            const channelConfig = productData?.channels?.find((c: any) => c.channel === targetChannel);

            if (channelConfig) {
                basePrice = channelConfig.promotionalPrice || channelConfig.price || 0;
            } else {
                basePrice = productData?.price || 0;
            }

            const optionsTotal = item.selectedOptions?.reduce((acc: number, opt: any) => acc + (opt.price || 0), 0) || 0;
            const unitPrice = basePrice + optionsTotal;
            const itemTotal = unitPrice * (item.quantity || 1);

            itemsTotal += itemTotal;

            validatedItems.push({
                productId: productId,
                productName: productData?.name || 'Item',
                quantity: item.quantity,
                basePrice: basePrice,
                price: unitPrice,
                selectedOptions: item.selectedOptions || [],
                notes: item.notes || '',
                channel: targetChannel,
                isTakeout: type === 'TAKEOUT'
            });
        }

        const safeDeliveryFee = Number(deliveryFee) || 0;
        const safeDiscount = Number(discountTotal) || 0;
        const finalTotal = Math.max(0, itemsTotal + safeDeliveryFee - safeDiscount);

        const orderData = {
            tenantId,
            customerName,
            customerPhone,
            items: validatedItems,
            total: finalTotal,
            subtotal: itemsTotal,
            deliveryFee: safeDeliveryFee,
            discountTotal: safeDiscount,
            couponCode: couponCode || null,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            type: type || 'DELIVERY',
            origin: 'DIGITAL',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            payments: paymentMethod ? [{
                id: Date.now().toString(),
                method: paymentMethod,
                amount: finalTotal,
                timestamp: new Date(),
                description: 'Online Checkout'
            }] : [],
            deliveryAddress: deliveryAddress || null,
            location: location || null,
            change: change || null,
            scheduledTo: scheduledTo || null,
            tableNumber: tableNumber || null
        };

        const orderRef = await db.collection('orders').add(orderData);

        return {
            success: true,
            orderId: orderRef.id,
            total: finalTotal,
            message: 'Pedido criado com segurança.'
        };

    } catch (error: any) {
        console.error('[secureCheckout] Erro:', error);
        throw new functions.https.HttpsError('internal', `Falha ao processar checkout seguro: ${error.message}`);
    }
});
