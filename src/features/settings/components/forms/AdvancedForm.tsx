import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { SettingsFormProps } from './types';
import { cardClass } from './shared';

export const AdvancedForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => (
    <div className={cardClass}>
        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Zap size={18} /> Preferências Locais e Dados</h4>
        <p className="text-sm text-slate-500 mt-2">Configurações avançadas do sistema e armazenamento local.</p>
    </div>
);
