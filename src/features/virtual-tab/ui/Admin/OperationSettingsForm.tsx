import { useState } from 'react';
import { RestaurantOperationSettings, ServiceModel, DEFAULT_SETTINGS } from '../../model/operationSettings';

interface OperationSettingsFormProps {
    currentSettings?: RestaurantOperationSettings;
    onSave: (settings: RestaurantOperationSettings) => Promise<void>;
}

export function OperationSettingsForm({ currentSettings, onSave }: OperationSettingsFormProps) {
    const [settings, setSettings] = useState<Partial<RestaurantOperationSettings>>(
        currentSettings || DEFAULT_SETTINGS.HYBRID
    );
    const [saving, setSaving] = useState(false);

    const handlePresetChange = (preset: keyof typeof DEFAULT_SETTINGS) => {
        setSettings(DEFAULT_SETTINGS[preset]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(settings as RestaurantOperationSettings);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Configurações Operacionais
            </h2>

            {/* Presets Rápidos */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Modelos Prontos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handlePresetChange('TRADITIONAL_WITH_SERVICE')}
                        className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-500 transition-colors text-left"
                    >
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                            🍽️ Tradicional
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Com taxa de serviço, garçom dedicado
                        </div>
                    </button>

                    <button
                        onClick={() => handlePresetChange('CASUAL_NO_SERVICE')}
                        className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-500 transition-colors text-left"
                    >
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                            🍺 Casual
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Sem taxa, atendimento colaborativo
                        </div>
                    </button>

                    <button
                        onClick={() => handlePresetChange('HYBRID')}
                        className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-500 transition-colors text-left"
                    >
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                            ⚡ Híbrido
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Melhor dos dois mundos
                        </div>
                    </button>
                </div>
            </div>

            {/* Modelo de Serviço */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Modelo de Serviço
                </h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                        <input
                            type="radio"
                            name="serviceModel"
                            value="DEDICATED"
                            checked={settings.serviceModel === 'DEDICATED'}
                            onChange={(e) => setSettings({ ...settings, serviceModel: e.target.value as ServiceModel })}
                            className="w-4 h-4"
                        />
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                                Garçom Dedicado
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Mesmo garçom atende, leva e fecha a conta (ideal com taxa de serviço)
                            </div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                        <input
                            type="radio"
                            name="serviceModel"
                            value="COLLABORATIVE"
                            checked={settings.serviceModel === 'COLLABORATIVE'}
                            onChange={(e) => setSettings({ ...settings, serviceModel: e.target.value as ServiceModel })}
                            className="w-4 h-4"
                        />
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                                Colaborativo
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Qualquer garçom pode atender qualquer mesa (ideal sem taxa de serviço)
                            </div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                        <input
                            type="radio"
                            name="serviceModel"
                            value="HYBRID"
                            checked={settings.serviceModel === 'HYBRID'}
                            onChange={(e) => setSettings({ ...settings, serviceModel: e.target.value as ServiceModel })}
                            className="w-4 h-4"
                        />
                        <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                                Híbrido
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Garçom responsável + outros podem ajudar na entrega
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Taxa de Serviço */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Taxa de Serviço
                </h3>
                <div className="space-y-4">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.serviceCharge?.enabled}
                            onChange={(e) => setSettings({
                                ...settings,
                                serviceCharge: {
                                    ...settings.serviceCharge!,
                                    enabled: e.target.checked,
                                },
                            })}
                            className="w-5 h-5"
                        />
                        <span className="text-slate-900 dark:text-white">
                            Cobrar taxa de serviço
                        </span>
                    </label>

                    {settings.serviceCharge?.enabled && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Percentual (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.serviceCharge?.percentage || 10}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        serviceCharge: {
                                            ...settings.serviceCharge!,
                                            percentage: Number(e.target.value),
                                        },
                                    })}
                                    className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Quando cobrar?
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={settings.serviceCharge?.chargeOn?.waiterService}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                serviceCharge: {
                                                    ...settings.serviceCharge!,
                                                    chargeOn: {
                                                        ...settings.serviceCharge!.chargeOn,
                                                        waiterService: e.target.checked,
                                                    },
                                                },
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            Quando garçom atender
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={settings.serviceCharge?.chargeOn?.selfService}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                serviceCharge: {
                                                    ...settings.serviceCharge!,
                                                    chargeOn: {
                                                        ...settings.serviceCharge!.chargeOn,
                                                        selfService: e.target.checked,
                                                    },
                                                },
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            Mesmo em self-service (cliente pediu sozinho)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cliente Pode Pedir Sozinho */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Pedidos
                </h3>
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={settings.rules?.allowCustomerSelfOrder}
                        onChange={(e) => setSettings({
                            ...settings,
                            rules: {
                                ...settings.rules!,
                                allowCustomerSelfOrder: e.target.checked,
                            },
                        })}
                        className="w-5 h-5"
                    />
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                            Permitir cliente pedir sozinho (QR Code)
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Cliente escaneia QR Code e faz pedido sem garçom
                        </div>
                    </div>
                </label>
            </div>

            {/* Pagamento */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Pagamento
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.payment?.whoCanProcess?.waiter}
                            onChange={(e) => setSettings({
                                ...settings,
                                payment: {
                                    ...settings.payment!,
                                    whoCanProcess: {
                                        ...settings.payment!.whoCanProcess,
                                        waiter: e.target.checked,
                                    },
                                },
                            })}
                            className="w-5 h-5"
                        />
                        <span className="text-slate-900 dark:text-white">
                            Garçom pode processar pagamento (leva maquininha)
                        </span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.payment?.whoCanProcess?.selfService}
                            onChange={(e) => setSettings({
                                ...settings,
                                payment: {
                                    ...settings.payment!,
                                    whoCanProcess: {
                                        ...settings.payment!.whoCanProcess,
                                        selfService: e.target.checked,
                                    },
                                },
                            })}
                            className="w-5 h-5"
                        />
                        <span className="text-slate-900 dark:text-white">
                            Cliente pode pagar sozinho (PIX/Cartão online)
                        </span>
                    </label>
                </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
}
