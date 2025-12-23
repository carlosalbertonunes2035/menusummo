import React from 'react';
import { SettingsFormProps } from './types';
import { inputClass, labelClass, cardClass } from './shared';

export const OperationForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => (
    <div className={`${cardClass} animate-fade-in`}>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Tempo de Cozinha (KDS Inteligente)</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                    <label className={labelClass}>Tempo de Preparo (min)</label>
                    <input type="number" name="kitchen.preparationTime" value={settings.kitchen?.preparationTime || 20} onChange={onChange} className={inputClass} />
                    <p className="text-[10px] text-slate-400 mt-1">Tempo médio para produzir um pedido.</p>
                </div>
                <div>
                    <label className={labelClass}>Janela de Segurança (min)</label>
                    <input type="number" name="kitchen.safetyBuffer" value={settings.kitchen?.safetyBuffer || 10} onChange={onChange} className={inputClass} />
                    <p className="text-[10px] text-slate-400 mt-1">Margem extra antes do preparo.</p>
                </div>
            </div>
        </div>

        {/* Simplified Toggle Sections for Order Modes - using same pattern */}
        {[
            { mode: 'delivery', label: 'Entrega (Delivery)' },
            { mode: 'takeout', label: 'Retirada (Balcão)' },
            { mode: 'dineIn', label: 'Consumo Local (Mesa)' },
            { mode: 'staff', label: 'Refeição Colaborador (Staff)' }
        ].map((m) => (
            <div key={m.mode}>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{m.label}</h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Ativar</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name={`orderModes.${m.mode}.enabled`} checked={(settings.orderModes as any)?.[m.mode]?.enabled || false} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div><label className={labelClass}>Tempo Mín. (min)</label><input type="number" name={`orderModes.${m.mode}.minTime`} value={(settings.orderModes as any)?.[m.mode]?.minTime || 0} onChange={onChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Tempo Máx. (min)</label><input type="number" name={`orderModes.${m.mode}.maxTime`} value={(settings.orderModes as any)?.[m.mode]?.maxTime || 0} onChange={onChange} className={inputClass} /></div>
                </div>
            </div>
        ))}

        {/* Scheduling Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Agendamento de Pedidos (Pre-Order)</h4>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Ativar Agendamentos</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="orderModes.scheduling.enabled" checked={settings.orderModes.scheduling?.enabled || false} onChange={onChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>
            <div className={`grid grid-cols-2 gap-4 mt-2 ${!settings.orderModes.scheduling?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div><label className={labelClass}>Adiantamento Máx (Dias)</label><input type="number" name="orderModes.scheduling.maxDays" value={settings.orderModes.scheduling?.maxDays || 7} onChange={onChange} className={inputClass} /></div>
                <div><label className={labelClass}>Intervalo Blocos (min)</label><input type="number" name="orderModes.scheduling.intervalMin" value={settings.orderModes.scheduling?.intervalMin || 15} onChange={onChange} className={inputClass} /></div>
            </div>
        </div>
    </div>
);
