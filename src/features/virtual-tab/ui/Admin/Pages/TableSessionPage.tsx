import React from 'react';
import { QRCodeManager } from '../QRCodeManager';
import { LossDashboard } from '../LossDashboard';
import { OperationSettingsForm } from '../OperationSettingsForm';
import { VirtualTabErrorBoundary } from '../../Shared/ErrorBoundary';
import { useConfig } from '../../../model/hooks/useConfig';

export function TableSessionPage() {
    const { config, updateConfig, loading } = useConfig();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <VirtualTabErrorBoundary>
                <section>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Comanda Virtual</h1>
                    <QRCodeManager />
                </section>
            </VirtualTabErrorBoundary>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VirtualTabErrorBoundary>
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Configurações Operacionais</h2>
                        {/* Adaptando o OperationConfig do hook para o RestaurantOperationSettings do componente se necessário */}
                        {/* Por enquanto, vamos passar um mock/handle simples ou adaptar o componente */}
                        <OperationSettingsForm
                            currentSettings={config as any}
                            onSave={async (settings) => {
                                console.log('Saving settings:', settings);
                                await updateConfig(settings as any);
                            }}
                        />
                    </section>
                </VirtualTabErrorBoundary>

                <VirtualTabErrorBoundary>
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Relatório de Perdas</h2>
                        <LossDashboard />
                    </section>
                </VirtualTabErrorBoundary>
            </div>
        </div>
    );
}
