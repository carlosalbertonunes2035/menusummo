import React, { useState } from 'react';
import { TableSession } from '../../model/types';
import { formatCurrency } from '@/lib/utils';
import { User, CreditCard, ArrowRight, Check } from 'lucide-react';
import { generatePDVCode } from '../../lib/utils/qrCodeGenerator';

interface CheckoutOptionsProps {
    session: TableSession;
    onPaymentMethodSelected: (method: 'TABLE' | 'PDV') => void;
}

export function CheckoutOptions({ session, onPaymentMethodSelected }: CheckoutOptionsProps) {
    const [selectedMethod, setSelectedMethod] = useState<'TABLE' | 'PDV' | null>(null);
    const [pdvCode, setPdvCode] = useState<string>('');
    const [waiterComing, setWaiterComing] = useState(false);

    // Calculate totals
    const subtotal = session.totalAmount;
    const serviceCharge = subtotal * 0.1; // 10% taxa de serviço
    const total = subtotal + serviceCharge;

    const handleCallWaiter = async () => {
        setSelectedMethod('TABLE');
        setWaiterComing(true);

        // TODO: Chamar garçom via useWaiterRequest
        // await requestWaiter(session.id, 'BILL_REQUEST');

        // Rastrear ação
        await trackPaymentAction(session.id, {
            action: 'CALLED_WAITER',
            paymentLocation: 'TABLE',
            timestamp: new Date(),
        });

        onPaymentMethodSelected('TABLE');
    };

    const handleGoToPDV = async () => {
        setSelectedMethod('PDV');

        // Gerar código para PDV
        const code = generatePDVCode(session.tableNumber);
        setPdvCode(code);

        // Rastrear ação
        await trackPaymentAction(session.id, {
            action: 'WENT_TO_PDV',
            paymentLocation: 'PDV',
            timestamp: new Date(),
        });

        onPaymentMethodSelected('PDV');
    };

    // Tela de confirmação - Garçom a caminho
    if (waiterComing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-green-600" size={40} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        ✅ Garçom a Caminho!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Um garçom está indo até sua mesa com a maquininha de cartão.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-600 mb-1">Total a pagar:</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(total)}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-sm">Aguarde...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Tela de código PDV
    if (selectedMethod === 'PDV' && pdvCode) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="text-blue-600" size={40} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        🚶 Vá ao Caixa
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Mostre este código no caixa para efetuar o pagamento:
                    </p>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 mb-6">
                        <div className="text-white text-5xl font-bold tracking-wider">
                            {pdvCode}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-600 mb-1">Total a pagar:</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(total)}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            // TODO: Marcar como pago
                            alert('Obrigado! Volte sempre!');
                        }}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        Já Paguei
                    </button>
                </div>
            </div>
        );
    }

    // Tela principal de escolha
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-1">Resumo da Conta</h1>
                    <p className="text-orange-100">Mesa {session.tableNumber}</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4">
                {/* Customer Info */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="text-gray-600" size={24} />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{session.customerName}</div>
                            <div className="text-sm text-gray-600">{session.customerPhone}</div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Seus Pedidos</h2>

                    {/* TODO: Listar itens reais do pedido */}
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-gray-700">
                            <span>2x Cerveja Heineken</span>
                            <span className="font-semibold">R$ 24,00</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>3x Espeto de Picanha</span>
                            <span className="font-semibold">R$ 54,00</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>1x Batata Frita</span>
                            <span className="font-semibold">R$ 15,00</span>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span className="font-semibold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Taxa de serviço (10%)</span>
                            <span className="font-semibold">{formatCurrency(serviceCharge)}</span>
                        </div>
                    </div>

                    <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">TOTAL</span>
                            <span className="text-2xl font-bold text-orange-600">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Como deseja pagar?
                    </h2>

                    <div className="space-y-3">
                        {/* Option 1: Call Waiter */}
                        <button
                            onClick={handleCallWaiter}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg">Chamar Garçom</div>
                                    <div className="text-sm text-orange-100">Pagar na mesa</div>
                                </div>
                            </div>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                        </button>

                        {/* Option 2: Go to PDV */}
                        <button
                            onClick={handleGoToPDV}
                            className="w-full bg-white border-2 border-gray-200 text-gray-900 p-4 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100 rounded-full flex items-center justify-center transition-colors">
                                    <CreditCard className="text-gray-600 group-hover:text-orange-600 transition-colors" size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg">Ir ao Caixa</div>
                                    <div className="text-sm text-gray-600">Pagar no PDV</div>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to track payment actions
async function trackPaymentAction(
    sessionId: string,
    data: {
        action: string;
        paymentLocation: 'TABLE' | 'PDV';
        timestamp: Date;
    }
) {
    // TODO: Salvar no Firestore
    console.log('Payment action tracked:', { sessionId, ...data });
}
