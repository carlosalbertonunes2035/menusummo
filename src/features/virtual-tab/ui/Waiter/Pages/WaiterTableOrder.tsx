import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTableSession } from '../../../model/hooks/useTableSession';
import { TableMenu } from '../../Client/TableMenu';
import { VirtualTabErrorBoundary } from '../../Shared/ErrorBoundary';

export function WaiterTableOrder() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { session, loading, error } = useTableSession(tableId || '');

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/app/waiter')}
                    className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                    Voltar para o Painel
                </button>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="p-8 text-center max-w-md mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Mesa Livre</h2>
                    <p className="text-gray-600 mb-6">Esta mesa ainda não tem uma comanda aberta.</p>
                    <button
                        onClick={() => navigate('/app/waiter')}
                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold"
                    >
                        Abrir Comanda no Painel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate('/app/waiter')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-gray-900">Pedido de Mesa</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
                <VirtualTabErrorBoundary>
                    <TableMenu session={session} />
                </VirtualTabErrorBoundary>
            </div>
        </div>
    );
}

export default WaiterTableOrder;
