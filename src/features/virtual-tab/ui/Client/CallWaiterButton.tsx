import { useState } from 'react';
import { useWaiterRequest } from '../../model/hooks/useWaiterRequest';
import { WaiterRequest } from '../../model/types';
import toast from 'react-hot-toast';

interface CallWaiterButtonProps {
    sessionId: string;
    tenantId?: string;
    tableNumber?: string;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}

export function CallWaiterButton({
    sessionId,
    tenantId,
    tableNumber,
    variant = 'secondary',
    size = 'md'
}: CallWaiterButtonProps) {
    const { requesting, requestAssistance } = useWaiterRequest(sessionId, tenantId, tableNumber);
    const [showOptions, setShowOptions] = useState(false);

    const handleQuickCall = async () => {
        try {
            await requestAssistance('Cliente solicitou atendimento');
            toast.success('Garçom chamado! Aguarde um momento.');
            setShowOptions(false);
        } catch (err) {
            toast.error('Erro ao chamar garçom');
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
        secondary: 'bg-white dark:bg-slate-800 border-2 border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700',
    };

    return (
        <div className="relative">
            <button
                onClick={handleQuickCall}
                disabled={requesting}
                className={`${variantClasses[variant]} ${sizeClasses[size]} font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 w-full`}
            >
                {requesting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Chamando...
                    </>
                ) : (
                    <>
                        👋 Chamar Garçom
                    </>
                )}
            </button>
        </div>
    );
}
