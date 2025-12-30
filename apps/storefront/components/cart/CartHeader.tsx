'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface CartHeaderProps {
    onBack: () => void;
    onClear: () => void;
    step: string;
    showClear: boolean;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
    onBack,
    onClear,
    step,
    showClear
}) => {
    const getStepLabel = () => {
        if (step === 'BAG') return 'SACOLA';
        if (step === 'IDENTITY') return 'IDENTIFICAÇÃO';
        if (step === 'FULFILLMENT') return 'ENTREGA';
        if (step === 'PAYMENT') return 'PAGAMENTO';
        return '';
    };

    const getProgressWidth = () => {
        if (step === 'BAG') return 'w-1/4';
        if (step === 'IDENTITY') return 'w-2/4';
        if (step === 'FULFILLMENT') return 'w-3/4';
        if (step === 'PAYMENT') return 'w-full';
        return 'w-0';
    };

    return (
        <div className="px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-sm font-bold text-gray-500 tracking-widest">{getStepLabel()}</span>
                {showClear ? (
                    <button
                        onClick={onClear}
                        className="text-sm font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition"
                    >
                        Limpar
                    </button>
                ) : <div className="w-8"></div>}
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div className={`h-full bg-summo-primary transition-all duration-500 ease-out ${getProgressWidth()}`}></div>
            </div>
        </div>
    );
};
