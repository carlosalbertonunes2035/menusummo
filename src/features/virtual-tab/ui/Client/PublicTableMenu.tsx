import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTableSession } from '../../model/hooks/useTableSession';
import { TableSession } from '../../model/types';
import {
    LoadingStep,
    ErrorStep,
    RegistrationStep,
    MenuStep,
    CheckoutStep,
    CompletedStep
} from './PublicMenuSteps';

type Step = 'loading' | 'register' | 'menu' | 'checkout' | 'completed';

export function PublicTableMenu() {
    const { tenantSlug, tableNumber } = useParams<{ tenantSlug: string; tableNumber: string }>();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('loading');
    const [session, setSession] = useState<TableSession | null>(null);

    const {
        session: existingSession,
        loading,
        createSession,
        error
    } = useTableSession(tableNumber || '');

    // Check for existing session
    useEffect(() => {
        if (loading) return;

        if (existingSession && existingSession.status === 'ACTIVE') {
            setSession(existingSession);
            setStep('menu');
        } else {
            setStep('register');
        }
    }, [existingSession, loading]);

    // Handle registration
    const handleRegister = async (data: { name: string; phone: string }) => {
        try {
            const newSession = await createSession({
                tableNumber: tableNumber || '',
                customerName: data.name,
                customerPhone: data.phone,
                openedBy: 'CUSTOMER',
                openedByUserId: 'self-service',
            });

            setSession(newSession);
            setStep('menu');
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Erro ao criar sessão. Tente novamente.');
        }
    };

    // Handle checkout
    const handleCheckout = () => {
        setStep('checkout');
    };

    // Handle payment method selected
    const handlePaymentMethodSelected = (method: 'TABLE' | 'PDV') => {
        console.log('Payment method selected:', method);
        // Payment flow is handled by components or global state
    };

    // Orchestrator based on state
    if (step === 'loading') return <LoadingStep />;

    if (error) return <ErrorStep error={error} onRetry={() => window.location.reload()} />;

    if (step === 'register') {
        return <RegistrationStep tableNumber={tableNumber || ''} onRegister={handleRegister} />;
    }

    if (step === 'menu' && session) {
        return <MenuStep session={session} onCheckout={handleCheckout} />;
    }

    if (step === 'checkout' && session) {
        return (
            <CheckoutStep
                session={session}
                onPaymentMethodSelected={handlePaymentMethodSelected}
            />
        );
    }

    if (step === 'completed') return <CompletedStep />;

    return null;
}
