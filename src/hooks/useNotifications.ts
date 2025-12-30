
import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { useOrders } from '@/hooks/useOrders';
import { sendNotification } from '@/services/notificationService';
import { OrderStatus } from '@/types';
import { usePrevious } from '@/lib/hooks';

export const useNotifications = () => {
    const { tenantId } = useApp();
    const { data: orders } = useOrders({ limit: 50 });
    const { ingredients } = useIngredientsQuery(tenantId);
    const prevOrdersLength = usePrevious(orders.length);

    // Track notified low stock items to avoid spamming on every render
    const notifiedLowStockRef = useRef<Set<string>>(new Set());

    // 1. MONITOR NEW ORDERS
    useEffect(() => {
        if (prevOrdersLength !== undefined && orders.length > prevOrdersLength) {
            // Find the new order(s) - assuming added to top or simple diff
            // For robustness, we check orders created in the last 10 seconds
            const now = new Date().getTime();
            const recentOrders = orders.filter(o => (now - new Date(o.createdAt).getTime()) < 10000);

            recentOrders.forEach(order => {
                // Ensure we don't notify for orders we just placed ourselves (optional check, 
                // but good for multi-device. Here we assume all incoming are relevant).
                // Avoid notifying 'COMPLETED' (e.g. historical import)
                if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED) {
                    sendNotification(
                        `Novo Pedido #${order.id.slice(-4)}`,
                        `${order.customerName} - R$ ${order.total.toFixed(2)}`,
                        'ORDER'
                    );
                }
            });
        }
    }, [orders.length, prevOrdersLength, orders]);

    // 2. MONITOR LOW STOCK
    useEffect(() => {
        ingredients.forEach(ing => {
            if (ing.currentStock <= ing.minStock && ing.isActive !== false) {
                if (!notifiedLowStockRef.current.has(ing.id)) {
                    sendNotification(
                        'Alerta de Estoque Baixo',
                        `${ing.name}: Restam apenas ${ing.currentStock} ${ing.unit}`,
                        'STOCK'
                    );
                    notifiedLowStockRef.current.add(ing.id);
                }
            } else {
                // Remove from tracked if stock recovered
                if (notifiedLowStockRef.current.has(ing.id)) {
                    notifiedLowStockRef.current.delete(ing.id);
                }
            }
        });
    }, [ingredients]);

    // 3. MONITOR CRITICAL TASKS (Example Logic)
    useEffect(() => {
        // Check once every 30 minutes
        const interval = setInterval(() => {
            const storedLogs = localStorage.getItem('summo_db_daily_logs');
            if (storedLogs) {
                const logs = JSON.parse(storedLogs);
                const todayStr = new Date().toISOString().split('T')[0];
                const todayLog = logs.find((l: any) => l.id === todayStr);

                if (todayLog) {
                    const pendingCritical = todayLog.tasks.filter((t: any) => t.isCritical && !t.completed);
                    if (pendingCritical.length > 0) {
                        sendNotification(
                            'Tarefas Críticas Pendentes',
                            `Existem ${pendingCritical.length} tarefas obrigatórias não realizadas!`,
                            'ALERT'
                        );
                    }
                }
            }
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);
};
