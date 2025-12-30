import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp,
    runTransaction,
} from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderClaim, OrderClaimItem, OrderClaimStatus } from '../types';
import { Order, OrderItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
    calculatePoints,
    getItemPriority,
    getExpirationTime
} from '../../lib/utils/claimUtils';

/**
 * Hook to manage order claims (waiter collecting orders)
 */
export function useOrderClaim() {
    const { currentUser } = useAuth();
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [myClaims, setMyClaims] = useState<OrderClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to pending orders (not yet claimed)
    useEffect(() => {
        if (!currentUser?.tenantId) {
            setLoading(false);
            return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('tenantId', '==', currentUser.tenantId),
            where('type', '==', 'DINE_IN'),
            where('status', '==', 'PENDING'),
            where('origin', '==', 'DIGITAL')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                // Get all pending orders
                const orders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                })) as Order[];

                // Filter out orders that are already claimed
                const claimsRef = collection(db, 'orderClaims');
                const claimsQuery = query(
                    claimsRef,
                    where('status', 'in', ['CLAIMED', 'DELIVERING'])
                );
                const claimsSnapshot = await getDocs(claimsQuery);
                const claimedOrderIds = new Set(
                    claimsSnapshot.docs.map(doc => doc.data().orderId)
                );

                const unclaimed = orders.filter(order => !claimedOrderIds.has(order.id));
                setPendingOrders(unclaimed);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching pending orders:', err);
                setError('Erro ao carregar pedidos pendentes');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [currentUser?.tenantId]);

    // Listen to my claims
    useEffect(() => {
        if (!currentUser?.uid) {
            return;
        }

        const claimsRef = collection(db, 'orderClaims');
        const q = query(
            claimsRef,
            where('waiterId', '==', currentUser.uid),
            where('status', 'in', ['CLAIMED', 'DELIVERING'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const claims = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                claimedAt: doc.data().claimedAt?.toDate(),
                deliveredAt: doc.data().deliveredAt?.toDate(),
                expiresAt: doc.data().expiresAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            })) as OrderClaim[];

            setMyClaims(claims);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    /**
     * Claim an order (competitive - first come, first served)
     */
    const claimOrder = async (order: Order): Promise<{ success: boolean; message: string }> => {
        if (!currentUser?.uid || !currentUser?.displayName) {
            return { success: false, message: 'Usuário não autenticado' };
        }

        try {
            // Use transaction to ensure only one waiter can claim
            const result = await runTransaction(db, async (transaction) => {
                // Check if order is already claimed
                const claimsRef = collection(db, 'orderClaims');
                const existingClaimsQuery = query(
                    claimsRef,
                    where('orderId', '==', order.id),
                    where('status', 'in', ['CLAIMED', 'DELIVERING'])
                );
                const existingClaims = await getDocs(existingClaimsQuery);

                if (!existingClaims.empty) {
                    const claimedBy = existingClaims.docs[0].data().waiterName;
                    return {
                        success: false,
                        message: `Pedido já coletado por ${claimedBy}`
                    };
                }

                // Create claim
                const claimRef = doc(collection(db, 'orderClaims'));
                const now = new Date();
                const responseTime = Math.floor((now.getTime() - order.createdAt.getTime()) / 1000);
                const points = calculatePoints(responseTime, order.total);

                const items: OrderClaimItem[] = order.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    category: item.channel || 'outros',
                    priority: getItemPriority(item.channel || 'outros'),
                    delivered: false,
                }));

                const newClaim: Omit<OrderClaim, 'id'> = {
                    orderId: order.id,
                    tableSessionId: order.tableNumber || '',
                    waiterId: currentUser.uid,
                    waiterName: currentUser.displayName,
                    claimedAt: now,
                    status: 'CLAIMED',
                    expiresAt: getExpirationTime(now),
                    items,
                    points,
                    responseTime,
                    createdAt: now,
                    updatedAt: now,
                };

                transaction.set(claimRef, {
                    ...newClaim,
                    claimedAt: serverTimestamp(),
                    expiresAt: getExpirationTime(now),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // Update order status
                const orderRef = doc(db, 'orders', order.id);
                transaction.update(orderRef, {
                    status: 'PREPARING',
                    waiterId: currentUser.uid,
                });

                return { success: true, message: 'Pedido coletado com sucesso!' };
            });

            return result;
        } catch (err) {
            console.error('Error claiming order:', err);
            return {
                success: false,
                message: 'Erro ao coletar pedido. Tente novamente.'
            };
        }
    };

    /**
     * Mark items as delivered
     */
    const markItemsDelivered = async (claimId: string, itemIds: string[]) => {
        try {
            const claimRef = doc(db, 'orderClaims', claimId);
            const claim = myClaims.find(c => c.id === claimId);

            if (!claim) {
                throw new Error('Claim not found');
            }

            const updatedItems = claim.items.map(item => {
                if (itemIds.includes(item.productId)) {
                    return {
                        ...item,
                        delivered: true,
                        deliveredAt: new Date(),
                    };
                }
                return item;
            });

            const allDelivered = updatedItems.every(item => item.delivered);

            await updateDoc(claimRef, {
                items: updatedItems,
                status: allDelivered ? 'DELIVERED' : 'DELIVERING',
                deliveredAt: allDelivered ? serverTimestamp() : null,
                updatedAt: serverTimestamp(),
            });

            // If all delivered, update order status
            if (allDelivered) {
                const orderRef = doc(db, 'orders', claim.orderId);
                await updateDoc(orderRef, {
                    status: 'READY',
                });
            }
        } catch (err) {
            console.error('Error marking items delivered:', err);
            throw new Error('Erro ao marcar itens como entregues');
        }
    };

    /**
     * Mark entire claim as delivered
     */
    const markClaimDelivered = async (claimId: string) => {
        const claim = myClaims.find(c => c.id === claimId);
        if (!claim) return;

        const allItemIds = claim.items.map(item => item.productId);
        await markItemsDelivered(claimId, allItemIds);
    };

    return {
        pendingOrders,
        myClaims,
        loading,
        error,
        claimOrder,
        markItemsDelivered,
        markClaimDelivered,
    };
}
