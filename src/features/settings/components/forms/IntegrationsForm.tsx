import React from 'react';
import { MapPin, Key, Sparkles, MessageCircle, Tv, AlertTriangle } from 'lucide-react';
import { SettingsFormProps } from './types';
import { inputClass, labelClass, cardClass } from './shared';

export const IntegrationsForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
    // const ifoodConfig = settings.integrations?.ifood; 
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Google Maps & Places API */}
            <div className={cardClass}>
                <div className="flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><MapPin size={24} /></div>
                    <div><h4 className="font-bold text-slate-800100">Google Maps & Places API</h4><p className="text-xs text-slate-500400">Autocomplete de endereços e mapa de raio de entrega.</p></div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Google Cloud API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="password" name="integrations.google.apiKey" value={settings.integrations?.google?.apiKey || ''} onChange={onChange} placeholder="Cole sua API Key do Google Cloud..." className={`${inputClass} pl-9 font-mono`} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Requer Places API e Maps JavaScript API habilitadas.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50800 rounded-xl">
                            <span className="font-bold text-slate-700200 text-sm">Places API (Autocomplete)</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="integrations.google.placesEnabled" checked={settings.integrations?.google?.placesEnabled ?? true} onChange={onChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50800 rounded-xl">
                            <span className="font-bold text-slate-700200 text-sm">Maps JavaScript API</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="integrations.google.mapsEnabled" checked={settings.integrations?.google?.mapsEnabled ?? true} onChange={onChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gemini AI Integration */}
            <div className={cardClass}>
                <div className="flex items-start gap-4">
                    <div className="bg-orange-50 p-3 rounded-xl text-summo-primary"><Sparkles size={24} /></div>
                    <div><h4 className="font-bold text-slate-800100">Inteligência Artificial (Gemini API)</h4><p className="text-xs text-slate-500400">Conecte a IA do Google.</p></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50800 rounded-xl">
                    <span className="font-bold text-slate-700200 text-sm">Ativar Agente de IA</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="ai.isActive" checked={settings.ai?.isActive || false} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className={`space-y-4 ${!settings.ai?.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className={labelClass}>Google Gemini API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="password" name="ai.apiKey" value={settings.ai?.apiKey || ''} onChange={onChange} placeholder="Cole sua chave aqui (AIza...)" className={`${inputClass} pl-9 font-mono`} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Nome do Agente</label><input type="text" name="ai.agentName" value={settings.ai?.agentName || ''} onChange={onChange} className={inputClass} /></div>
                        <div>
                            <label className={labelClass}>Personalidade</label>
                            <select name="ai.personality" value={settings.ai?.personality || 'Friendly'} onChange={onChange} className={inputClass}>
                                <option value="Friendly">Amigável</option>
                                <option value="Professional">Profissional</option>
                                <option value="Funny">Divertido</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Integration */}
            <div className={cardClass}>
                <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><MessageCircle size={24} /></div>
                    <div><h4 className="font-bold text-slate-800100">WhatsApp</h4><p className="text-xs text-slate-500400">Automatize respostas e notificações.</p></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50800 rounded-xl">
                    <span className="font-bold text-slate-700200 text-sm">Notificações Ativas</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="whatsapp.isActive" checked={settings.whatsapp?.isActive || false} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className={`space-y-4 ${!settings.whatsapp?.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div><label className={labelClass}>Número do WhatsApp (DDI + DDD + Número)</label><input type="text" name="whatsapp.number" value={settings.whatsapp?.number || ''} onChange={onChange} placeholder="Ex: 5511999999999" className={inputClass} /></div>
                    <div><label className={labelClass}>Template de Mensagem</label><textarea name="whatsapp.messageTemplate" value={settings.whatsapp?.messageTemplate || ''} onChange={onChange} rows={3} className={inputClass} placeholder="Olá! Gostaria de fazer um pedido." /></div>
                </div>
            </div>

            {/* iFood Integration */}
            <div className={cardClass}>
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-xl text-red-600"><Tv size={24} /></div>
                    <div><h4 className="font-bold text-slate-800100">iFood</h4><p className="text-xs text-slate-500400">Configuração de taxas e comissões.</p></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50800 rounded-xl">
                    <span className="font-bold text-slate-700200 text-sm">Integração Ativa</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="integrations.ifood.enabled" checked={settings.integrations?.ifood?.enabled} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className={`space-y-4 ${!settings.integrations?.ifood?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Plano iFood</label>
                            <select name="integrations.ifood.plan" value={settings.integrations?.ifood?.plan} onChange={onChange} className={inputClass}>
                                <option value="BASICO">Básico (Entrega Própria)</option>
                                <option value="ENTREGA">Entrega Parceira</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Comissão (%)</label>
                            <div className="relative"><input type="number" name="integrations.ifood.commissionRate" value={settings.integrations?.ifood?.commissionRate} onChange={onChange} className={`${inputClass} pr-8`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span></div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Taxas Financeiras Ocultas (Pagamento Online/Antecipação)</label>
                        <div className="relative"><input type="number" step="0.1" name="integrations.ifood.financialFee" value={settings.integrations?.ifood?.financialFee || 3.2} onChange={onChange} className={`${inputClass} pr-8`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span></div>
                        <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Geralmente 3.2% a 4% (taxa de cartão + antecipação semanal).</p>
                    </div>
                </div>
            </div>
        </div>
    )
};
