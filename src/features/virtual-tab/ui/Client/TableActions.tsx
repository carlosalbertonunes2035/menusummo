import React from 'react';
import { TableSession } from '../../model/types';
import { CallWaiterButton } from './CallWaiterButton';
import { Phone, CreditCard, MessageCircle } from 'lucide-react';

interface TableActionsProps {
    session: TableSession;
}

export function TableActions({ session }: TableActionsProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
            <div className="max-w-4xl mx-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                    {/* Chamar Garçom */}
                    <CallWaiterButton
                        sessionId={session.id}
                        variant="secondary"
                        size="md"
                    />

                    {/* Pedir Conta */}
                    <button
                        onClick={() => {
                            // TODO: Implementar requestBill
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-semibold">Pedir Conta</span>
                    </button>

                    {/* Ver Pedidos */}
                    <button
                        onClick={() => {
                            // TODO: Abrir histórico de pedidos
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <MessageCircle size={24} />
                        <span className="text-sm font-semibold">Meus Pedidos</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
