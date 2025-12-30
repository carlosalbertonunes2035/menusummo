import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit as firestoreLimit, Timestamp } from '@firebase/firestore';
import { Order, OrderStatus } from '@/types';
import { useEffect } from 'react';

export const ORDERS_QUERY_KEY = ['orders'];

const convertTimestamps = (data: any): any => {
    if (data instanceof Timestamp) return data.toDate();
    if (Array.isArray(data)) return data.map(convertTimestamps);
    if (typeof data === 'object' && data !== null) {
        const obj: any = {};
        for (const key in data) obj[key] = convertTimestamps(data[key]);
        return obj;
    }
    return data;
};

export const useOrdersQuery = (tenantId: string, options?: { status?: OrderStatus; limit?: number }) => {
    const queryClient = useQueryClient();
    const queryKey = [...ORDERS_QUERY_KEY, tenantId, options?.status, options?.limit];

    // 1. Query for Initial Load & Management
    const { data: orders = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => orders, // Data is primarily managed by onSnapshot
        enabled: !!tenantId,
        staleTime: Infinity, // Real-time data doesn't get stale traditionally
    });

    // 2. Real-time Subscription
    useEffect(() => {
        if (!tenantId) return;

        let q = query(collection(db, 'orders'), where('tenantId', '==', tenantId));

        if (options?.status) {
            q = query(q, where('status', '==', options.status));
        }

        q = query(q, orderBy('createdAt', 'desc'));

        if (options?.limit) {
            q = query(q, firestoreLimit(options.limit));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamps(doc.data())
            })) as Order[];

            queryClient.setQueryData(queryKey, data);
        }, (error) => {
            console.error("Orders sync error:", error);
        });

        return () => unsubscribe();
    }, [tenantId, JSON.stringify(options), queryClient, queryKey]);

    // 3. Mutations
    const updateOrderStatus = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status, updatedAt: new Date().toISOString() });
        },
        onSuccess: () => {
            // Invalidation is automatic via onSnapshot, but we can force it if needed
            // queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        }
    });

    const assignDriver = useMutation({
        mutationFn: async ({ orderId, driverId, deliverySequence }: { orderId: string; driverId: string; deliverySequence?: number }) => {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                driverId,
                status: OrderStatus.DELIVERING,
                deliverySequence: deliverySequence || null,
                updatedAt: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        }
    });

    const updateOrder = useMutation({
        mutationFn: async (payload: { id: string } & Partial<Order>) => {
            const { id, ...data } = payload;
            const orderRef = doc(db, 'orders', id);
            await updateDoc(orderRef, { ...data, updatedAt: new Date().toISOString() });
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        }
    });

    return {
        orders,
        isLoading,
        updateStatus: updateOrderStatus.mutateAsync,
        updateOrder: updateOrder.mutateAsync,
        assignDriver: assignDriver.mutateAsync,
        isUpdating: updateOrderStatus.isPending || updateOrder.isPending || assignDriver.isPending
    };
};
