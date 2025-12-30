import { useState } from 'react';
import { TableSession } from '../../model/types';
import { useWaiterRequest } from '../../model/hooks/useWaiterRequest';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentOptionsProps {
    session: TableSession;
    onPaymentComplete: () => void;
}

export function PaymentOptions({ session, onPaymentComplete }: PaymentOptionsProps) {
    const { requestBill } = useWaiterRequest(session.id, session.tenantId, session.tableNumber);
    const [selectedMethod, setSelectedMethod] = useState<'digital' | 'waiter' | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleDigitalPayment = async (method: 'PIX' | 'CARD') => {
        setProcessing(true);
        try {
            // TODO: Integrate with payment gateway (Mercado Pago/Stripe)
            toast.success(`Pagamento via ${method} em desenvolvimento`);

            // For now, just show a placeholder
            if (method === 'PIX') {
                toast('Gerando QR Code PIX...', { icon: '📱' });
            } else {
                toast('Redirecionando para pagamento...', { icon: '💳' });
            }
        } catch (err) {
            toast.error('Erro ao processar pagamento');
        } finally {
            setProcessing(false);
        }
    };

    const handleCallWaiterToPay = async () => {
        setProcessing(true);
        try {
            await requestBill('Cliente deseja fechar a conta');
            toast.success('Garçom chamado para fechar a conta!');
            setSelectedMethod(null);
        } catch (err) {
            toast.error('Erro ao chamar garçom');
        } finally {
            setProcessing(false);
        }
    };

    if (!selectedMethod) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Pagamento
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                    Total: <span className="font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(session.totalAmount)}
                    </span>
                </p>

                <div className="space-y-3">
                    {/* Digital Payment */}
                    <button
                        onClick={() => setSelectedMethod('digital')}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-between"
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">💳</span>
                            <span>Pagar Agora</span>
                        </span>
                        <span className="text-sm opacity-80">PIX ou Cartão</span>
                    </button>

                    {/* Call Waiter */}
                    <button
                        onClick={() => setSelectedMethod('waiter')}
                        className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-between"
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">👋</span>
                            <span>Chamar Garçom</span>
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Dinheiro ou Cartão</span>
                    </button>
                </div>
            </div>
        );
    }

    if (selectedMethod === 'digital') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <button
                    onClick={() => setSelectedMethod(null)}
                    className="mb-4 text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-2"
                >
                    ← Voltar
                </button>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Pagamento Digital
                </h2>

                <div className="space-y-3">
                    {/* PIX */}
                    <button
                        onClick={() => handleDigitalPayment('PIX')}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">📱</span>
                        <span>Pagar com PIX</span>
                    </button>

                    {/* Card */}
                    <button
                        onClick={() => handleDigitalPayment('CARD')}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">💳</span>
                        <span>Pagar com Cartão</span>
                    </button>
                </div>
            </div>
        );
    }

    if (selectedMethod === 'waiter') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <button
                    onClick={() => setSelectedMethod(null)}
                    className="mb-4 text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-2"
                >
                    ← Voltar
                </button>

                <div className="text-center py-8">
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Chamar Garçom
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Um garçom virá até sua mesa para processar o pagamento
                    </p>

                    <button
                        onClick={handleCallWaiterToPay}
                        disabled={processing}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {processing ? 'Chamando...' : 'Confirmar Chamada'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
