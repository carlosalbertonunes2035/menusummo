import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ALL_MODULES } from '@/components/layouts/Sidebar';
import { SettingsFormProps } from './types';
import { cardClass } from './shared';

export const InterfaceForm: React.FC<SettingsFormProps> = ({ settings, onChange, onToggleDockItem = (id) => { } }) => (
    <div className="space-y-6 animate-fade-in">
        <div className={cardClass}>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Gestor de Pedidos</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Exibir Coluna "Pronto"</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="interface.showReadyColumn" checked={settings.interface?.showReadyColumn || false} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </div>
        </div>
        <div className={cardClass}>
            <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-100">Apps na Dock / Sidebar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_MODULES.map((module: any) => {
                    const isSelected = (settings.dockItems || []).includes(module.id);
                    const Icon = module.icon;
                    return (
                        <div key={module.id} onClick={() => onToggleDockItem(module.id)} className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition ${isSelected ? 'bg-summo-bg border-summo-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg text-white bg-slate-800 dark:bg-slate-700">
                                    <Icon size={18} />
                                </div>
                                <div><p className="font-bold text-sm text-slate-800 dark:text-slate-100">{module.label}</p></div>
                            </div>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-summo-primary border-summo-primary text-white' : 'bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-600'}`}>
                                {isSelected && <CheckCircle2 size={12} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);
