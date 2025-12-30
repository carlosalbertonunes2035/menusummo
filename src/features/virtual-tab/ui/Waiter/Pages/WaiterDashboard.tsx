import React from 'react';
import { WaiterRequestsList } from '../WaiterRequestsList';
import { MyTables } from '../MyTables';
import { TableGridSelection } from '../TableGridSelection';
import { AvailabilityToggle } from '../AvailabilityToggle';
import { VirtualTabErrorBoundary } from '../../Shared/ErrorBoundary';

export function WaiterDashboard() {
    const [activeTableIds, setActiveTableIds] = React.useState<string[]>([]);

    return (
        <div className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel do Garçom</h1>
                    <p className="text-gray-500">Gestão de mesas e solicitações em tempo real</p>
                </div>
                <div className="w-64">
                    <AvailabilityToggle />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Requests (Sticky on desktop) */}
                <div className="lg:col-span-1 space-y-6">
                    <VirtualTabErrorBoundary>
                        <WaiterRequestsList />
                    </VirtualTabErrorBoundary>
                </div>

                {/* Right: Management */}
                <div className="lg:col-span-2 space-y-8">
                    <VirtualTabErrorBoundary>
                        <section>
                            <MyTables onSyncActiveTables={setActiveTableIds} />
                        </section>
                    </VirtualTabErrorBoundary>

                    <VirtualTabErrorBoundary>
                        <section>
                            <TableGridSelection activeTableIds={activeTableIds} />
                        </section>
                    </VirtualTabErrorBoundary>
                </div>
            </div>
        </div>
    );
}
