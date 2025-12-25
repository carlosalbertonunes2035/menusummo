import React from 'react';
import { Clock } from 'lucide-react';
import { SettingsFormProps } from './types';
import { cardClass } from './shared';

export const ScheduleForm: React.FC<SettingsFormProps> = ({ settings, onScheduleChange = (d, f, v) => { } }) => {
    // const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    if (!settings.schedule || settings.schedule.length === 0) {
        return (
            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 mb-4">Horário de Funcionamento</h4>
                <div className="text-center py-10">
                    <Clock size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 mb-4">Ainda não foram configurados horários.</p>
                    <button
                        onClick={() => onScheduleChange(0, 'initialize', null)}
                        className="bg-summo-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-summo-primary/20 hover:bg-summo-dark transition"
                    >
                        Inicializar Horários Padrão
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cardClass}>
            <h4 className="font-bold text-slate-800 mb-4">Horário de Funcionamento</h4>
            <div className="space-y-3">
                {settings.schedule.map((day, index) => (
                    <div key={day.day} className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={day.isOpen} onChange={(e) => onScheduleChange(index, 'isOpen', e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            <span className={`font-bold text-sm ${day.isOpen ? 'text-slate-800' : 'text-slate-400'}`}>{day.day}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${!day.isOpen ? 'opacity-30 pointer-events-none' : ''}`}>
                            <input type="time" value={day.openTime} onChange={e => onScheduleChange(index, 'openTime', e.target.value)} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm" />
                            <span className="text-slate-400 text-xs">até</span>
                            <input type="time" value={day.closeTime} onChange={e => onScheduleChange(index, 'closeTime', e.target.value)} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
