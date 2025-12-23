import React from 'react';
import { MapPin } from 'lucide-react';
import DeliveryRadiusMap from '../DeliveryRadiusMap';
import { SettingsFormProps } from './types';
import { inputClass, labelClass, cardClass } from './shared';

export const DeliveryForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
    const apiKey = settings.integrations?.google?.apiKey || '';
    const mapsEnabled = settings.integrations?.google?.placesEnabled ?? false;

    return (
        <div className="space-y-6">
            {/* Delivery Radius Map Visualization */}
            {apiKey && mapsEnabled && settings.address ? (
                <div className={cardClass}>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <MapPin size={18} /> Visualização do Raio de Entrega
                    </h4>
                    <DeliveryRadiusMap
                        storeAddress={settings.address}
                        radiusKm={settings.delivery.deliveryRadius || 5}
                        onRadiusChange={(radius) => onChange({ target: { name: 'delivery.deliveryRadius', value: radius, type: 'number' } } as any)}
                        apiKey={apiKey}
                        initialLocation={settings.company?.location}
                    />
                </div>
            ) : (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-summo-primary flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Mapa de Raio de Entrega Indisponível</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Para visualizar o mapa interativo, você precisa:
                            </p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside">
                                {!apiKey && <li>Configurar a <b>API Key do Google</b> em Integrações</li>}
                                {!mapsEnabled && <li>Habilitar <b>Google Maps API</b> em Integrações</li>}
                                {!settings.address && <li>Preencher o <b>Endereço da Loja</b> em Dados da Empresa</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Settings */}
            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 italic">Regras de Logística e Entrega</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Taxa Base (R$)</label>
                        <input type="number" name="delivery.baseFee" value={settings.delivery.baseFee} onChange={onChange} className={inputClass} />
                        <p className="text-[10px] text-slate-400 mt-1">Taxa mínima para qualquer entrega.</p>
                    </div>
                    <div>
                        <label className={labelClass}>Preço por Km Extra (R$)</label>
                        <input type="number" step="0.1" name="delivery.pricePerKm" value={settings.delivery.pricePerKm} onChange={onChange} className={inputClass} />
                        <p className="text-[10px] text-slate-400 mt-1">Valor adicionado após o raio base.</p>
                    </div>
                    <div>
                        <label className={labelClass}>Raio Base (Km)</label>
                        <input type="number" name="delivery.deliveryRadius" value={settings.delivery.deliveryRadius} onChange={onChange} className={inputClass} />
                        <p className="text-[10px] text-slate-400 mt-1">Distância coberta pela taxa base.</p>
                    </div>
                    <div>
                        <label className={labelClass}>Pedido Mínimo (R$)</label>
                        <input type="number" name="delivery.minOrderValue" value={settings.delivery.minOrderValue} onChange={onChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Frete Grátis acima de (R$)</label>
                        <input type="number" name="delivery.freeShippingThreshold" value={settings.delivery.freeShippingThreshold} onChange={onChange} className={inputClass} />
                    </div>
                </div>
            </div>
        </div>
    );
};
