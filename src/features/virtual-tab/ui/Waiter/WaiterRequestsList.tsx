import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../model/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, QuerySnapshot, DocumentData } from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Notification } from '../../model/hooks/useNotifications';

/**
 * Waiter Requests List Component
 * Shows pending requests for waiters (call waiter, bill requests)
 */

export function WaiterRequestsList() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { notifyWaiterRequest } = useNotifications();
    const [requests, setRequests] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to requests
    useEffect(() => {
        if (!currentUser?.tenantId) return;

        const q = query(
            collection(db, 'notifications'),
            where('tenantId', '==', currentUser.tenantId),
            where('recipientRole', '==', 'waiter'),
            where('read', '==', false),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const requestsData = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Notification[];

            setRequests(requestsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.tenantId]);

    // Mark as read
    const markAsRead = async (requestId: string) => {
        try {
            await updateDoc(doc(db, 'notifications', requestId), {
                read: true,
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Accept request
    const acceptRequest = async (request: Notification) => {
        try {
            await markAsRead(request.id!);
            if (request.tableNumber) {
                navigate(`/waiter/table/${request.tableNumber}`);
            } else if (request.type === 'BILL_REQUEST' || request.type === 'WAITER_REQUEST') {
                // If it's a general request without a table, go to summary
                navigate('/waiter/dashboard');
            }
        } catch (err) {
            console.error('Error accepting request:', err);
        }
    };

    // Dismiss request
    const dismissRequest = async (requestId: string) => {
        await markAsRead(requestId);
    };

    // Get time ago
    const getTimeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds}s atrás`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
        return `${Math.floor(seconds / 3600)}h atrás`;
    };

    // Get priority color
    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 border-red-500 text-red-900';
            case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-900';
            case 'MEDIUM': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
            default: return 'bg-blue-100 border-blue-500 text-blue-900';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center p-8">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma Solicitação
                </h3>
                <p className="text-gray-600">
                    Você está em dia! Não há solicitações pendentes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    Solicitações Pendentes
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    {requests.length}
                </span>
            </div>

            {requests.map((request) => (
                <div
                    key={request.id}
                    className={`border-l-4 rounded-lg p-4 ${getPriorityColor(request.priority)}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg">{request.title}</h3>
                                {request.priority === 'URGENT' && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                        URGENTE
                                    </span>
                                )}
                            </div>

                            <p className="text-sm mb-3">{request.message}</p>

                            <div className="flex items-center gap-4 text-xs">
                                {request.tableNumber && (
                                    <span className="font-semibold">
                                        Mesa {request.tableNumber}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-gray-600">
                                    <Clock size={12} />
                                    {getTimeAgo(request.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => acceptRequest(request)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                aria-label="Aceitar solicitação"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={() => dismissRequest(request.id!)}
                                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                aria-label="Dispensar solicitação"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
