import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import { formatCurrency } from '@/lib/utils';
import type { TableSession } from '../../model/types';

/**
 * My Tables Component
 * Shows tables currently assigned to the waiter
 */

export function MyTables({ onSyncActiveTables }: { onSyncActiveTables?: (ids: string[]) => void }) {
    const { currentUser } = useAuth();
    const [tables, setTables] = useState<TableSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync active tables with parent
    useEffect(() => {
        if (onSyncActiveTables) {
            onSyncActiveTables(tables.map(t => t.tableId));
        }
    }, [tables, onSyncActiveTables]);

    // Subscribe to waiter's tables
    useEffect(() => {
        if (!currentUser?.uid || !currentUser?.tenantId) return;

        const q = query(
            collection(db, 'tableSessions'),
            where('tenantId', '==', currentUser.tenantId),
            where('openedByUserId', '==', currentUser.uid),
            where('status', 'in', ['ACTIVE', 'BILL_REQUESTED', 'PAYING'])
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const tablesData = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                lastActivityAt: doc.data().lastActivityAt?.toDate() || new Date(),
            })) as TableSession[];

            setTables(tablesData.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid, currentUser?.tenantId]);

    // Get status badge and colors
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    label: 'Ocupada',
                    badge: 'bg-blue-100 text-blue-800',
                    border: 'border-blue-500 shadow-blue-50',
                    bg: 'bg-blue-50/30'
                };
            case 'BILL_REQUESTED':
                return {
                    label: 'Conta Solicitada',
                    badge: 'bg-orange-100 text-orange-800 animate-pulse',
                    border: 'border-orange-500 shadow-orange-50',
                    bg: 'bg-orange-50/30'
                };
            case 'PAYING':
                return {
                    label: 'Pagando',
                    badge: 'bg-purple-100 text-purple-800',
                    border: 'border-purple-500 shadow-purple-50',
                    bg: 'bg-purple-50/30'
                };
            case 'CLEANING':
                return {
                    label: 'Limpeza',
                    badge: 'bg-cyan-100 text-cyan-800',
                    border: 'border-cyan-400 shadow-cyan-50',
                    bg: 'bg-cyan-50/30'
                };
            default:
                return {
                    label: 'Livre',
                    badge: 'bg-emerald-100 text-emerald-800',
                    border: 'border-emerald-200 shadow-emerald-50',
                    bg: 'bg-white'
                };
        }
    };

    // Get time since opened
    const getTimeSinceOpened = (date: Date): string => {
        const minutes = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60));

        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <div className="text-center p-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma Mesa Aberta
                </h3>
                <p className="text-gray-600">
                    Você não tem mesas abertas no momento.
                </p>
            </div>
        );
    }

    // Calculate totals
    const totalTables = tables.length;
    const totalRevenue = tables.reduce((sum, table) => sum + table.totalAmount, 0);
    const tablesWithBillRequested = tables.filter(t => t.status === 'BILL_REQUESTED').length;

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Mesas Ativas</p>
                            <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
                        </div>
                        <Users className="text-orange-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total em Aberto</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <DollarSign className="text-green-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Contas Solicitadas</p>
                            <p className="text-2xl font-bold text-gray-900">{tablesWithBillRequested}</p>
                        </div>
                        <CheckCircle className="text-blue-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Tables List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Minhas Mesas</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {tables.map((table) => {
                        const config = getStatusConfig(table.status);
                        return (
                            <div
                                key={table.id}
                                className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${config.border} ${config.bg}`}
                                onClick={() => {
                                    // Navigate to Ordering Menu
                                    window.location.href = `/app/waiter/order/${table.tableId}`;
                                }}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                                            <span className="text-xl font-bold text-gray-900">{table.tableNumber.split(' ').pop()}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Users size={16} />
                                            <span className="font-bold text-sm truncate">{table.customerName || 'Sem nome'}</span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {getTimeSinceOpened(table.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1 font-bold text-gray-900">
                                                {formatCurrency(table.totalAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-400">
                                            {table.orderIds.length} {table.orderIds.length === 1 ? 'pedido' : 'pedidos'}
                                        </span>
                                        {table.status === 'BILL_REQUESTED' && (
                                            <div className="flex items-center gap-1 text-orange-600 font-bold text-xs uppercase animate-pulse">
                                                Solicitou Fechamento
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
