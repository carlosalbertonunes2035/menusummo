import React from 'react';
import { QuickRegistration } from './QuickRegistration';
import { TableMenu } from './TableMenu';
import { CheckoutOptions } from './CheckoutOptions';
import { TableSession } from '../../model/types';
import { LoadingSpinner } from '../Shared/LoadingStates';

interface StepProps {
    tableNumber: string;
    session?: TableSession | null;
    error?: string | null;
    onRegister?: (data: { name: string; phone: string }) => void;
    onCheckout?: () => void;
    onPaymentMethodSelected?: (method: 'TABLE' | 'PDV') => void;
    onRetry?: () => void;
}

export const LoadingStep = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">Carregando...</p>
        </div>
    </div>
);

export const ErrorStep = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={onRetry}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
                Tentar Novamente
            </button>
        </div>
    </div>
);

export const RegistrationStep = ({ tableNumber, onRegister }: StepProps) => (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 mb-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
                <p className="text-orange-100">Mesa {tableNumber}</p>
            </div>
        </div>

        <div className="max-w-md mx-auto px-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Taxa de serviço de 10%</strong> será adicionada no final
                </p>
            </div>

            <QuickRegistration
                tableNumber={tableNumber || ''}
                onSubmit={onRegister!}
            />
        </div>
    </div>
);

export const MenuStep = ({ session, onCheckout }: StepProps) => (
    <TableMenu
        session={session!}
        onCheckout={onCheckout!}
    />
);

export const CheckoutStep = ({ session, onPaymentMethodSelected }: StepProps) => (
    <CheckoutOptions
        session={session!}
        onPaymentMethodSelected={onPaymentMethodSelected!}
    />
);

export const CompletedStep = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Obrigado!
            </h1>
            <p className="text-gray-600 mb-6">
                Volte sempre!
            </p>
            <div className="text-sm text-gray-500">
                Redirecionando...
            </div>
        </div>
    </div>
);
