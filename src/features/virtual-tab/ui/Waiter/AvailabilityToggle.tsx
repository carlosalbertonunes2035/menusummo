import React, { useState, useEffect } from 'react';
import { Power, Circle } from 'lucide-react';
import { useWaiterStatus } from '../../model/hooks/useWaiterStatus';
import type { WaiterAvailability } from '../../constants';

/**
 * Availability Toggle Component
 * Allows waiters to toggle their availability status
 */

export function AvailabilityToggle() {
    const { status, loading, updateAvailability } = useWaiterStatus();
    const [isUpdating, setIsUpdating] = useState(false);

    const availabilityOptions: Array<{
        value: WaiterAvailability;
        label: string;
        color: string;
        bgColor: string;
        description: string;
    }> = [
            {
                value: 'AVAILABLE',
                label: 'Disponível',
                color: 'text-green-700',
                bgColor: 'bg-green-100 border-green-500',
                description: 'Aceitar novas mesas e solicitações',
            },
            {
                value: 'BUSY',
                label: 'Ocupado',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-100 border-yellow-500',
                description: 'Atendendo mesas, não aceitar novas',
            },
            {
                value: 'OFFLINE',
                label: 'Offline',
                color: 'text-gray-700',
                bgColor: 'bg-gray-100 border-gray-500',
                description: 'Não disponível para atendimento',
            },
        ];

    const handleToggle = async (newStatus: WaiterAvailability) => {
        if (isUpdating || newStatus === status?.availability) return;

        try {
            setIsUpdating(true);
            await updateAvailability(newStatus);
        } catch (error) {
            console.error('Error updating availability:', error);
            alert('Erro ao atualizar disponibilidade');
        } finally {
            setIsUpdating(false);
        }
    };

    const currentOption = availabilityOptions.find(
        opt => opt.value === status?.availability
    ) || availabilityOptions[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Power size={20} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Status de Disponibilidade</h3>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${currentOption.bgColor}`}>
                    <Circle size={12} className={`fill-current ${currentOption.color}`} />
                    <span className={`text-sm font-semibold ${currentOption.color}`}>
                        {currentOption.label}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {availabilityOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleToggle(option.value)}
                        disabled={isUpdating || option.value === status?.availability}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${option.value === status?.availability
                            ? option.bgColor
                            : 'bg-white border-gray-200 hover:border-gray-300'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <Circle
                                size={16}
                                className={`mt-0.5 ${option.value === status?.availability
                                    ? `fill-current ${option.color}`
                                    : 'text-gray-400'
                                    }`}
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${option.value === status?.availability
                                        ? option.color
                                        : 'text-gray-900'
                                        }`}>
                                        {option.label}
                                    </span>
                                    {option.value === status?.availability && (
                                        <span className="text-xs text-gray-600">Ativo</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {status?.currentTables && status.currentTables > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Mesas Ativas:</strong> {status.currentTables}
                    </p>
                </div>
            )}
        </div>
    );
}
