import React, { useState } from 'react';
import { StoreSettings } from '@/types';
import { SettingsFormProps } from './types';
import { Wand2, Store, Users, MessageSquare, Target, Sparkles } from 'lucide-react';

export const BusinessProfileForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
    // Helper to simulate nested change events for the parent handler
    const handleChange = (field: string, value: any) => {
        onChange({
            target: {
                name: `businessProfile.${field}`,
                value,
                type: 'text' // Mock type
            }
        } as any);
    };

    const profile = settings.businessProfile || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Intro */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    Cérebro do seu Negócio
                </h3>
                <p className="text-indigo-700/80 mt-2 text-sm leading-relaxed max-w-2xl">
                    Conte para o sistema quem você é. A Inteligência Artificial usará essas informações para
                    criar descrições de produtos, sugerir campanhas de marketing e otimizar seu SEO cardápio
                    com a sua cara.
                </p>
            </div>

            {/* Main Story Field */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Store size={18} className="text-summo-primary" />
                    Sua História & Identidade
                </label>
                <div className="relative group">
                    <textarea
                        value={profile.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-summo-primary focus:ring-4 focus:ring-summo-primary/10 outline-none transition text-base leading-relaxed h-40 resize-none shadow-sm group-hover:border-gray-200"
                        placeholder="Ex: Somos uma hamburgueria artesanal fundada por dois irmãos em 2015. Nosso foco é o 'smash burger' com crosta perfeita e ingredientes frescos de produtores locais. O ambiente é descolado, com música rock e decoração industrial. Queremos que o cliente se sinta comendo na rua em Nova York..."
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur">
                            Quanto mais detalhes, melhor a IA entende você.
                        </span>
                    </div>
                </div>
            </div>

            {/* AI Generator Button Area */}
            <div className="flex justify-end">
                <button
                    type="button"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition flex items-center gap-2"
                    title="Em breve: Preenchimento automático com IA"
                >
                    <Wand2 size={18} />
                    Analisar e Preencher Perfil com IA
                </button>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Structured Data Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Segmento */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Target size={14} /> Segmento Principal
                    </label>
                    <input
                        type="text"
                        value={profile.segment || ''}
                        onChange={(e) => handleChange('segment', e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-summo-primary outline-none font-medium text-gray-800"
                        placeholder="Ex: Hamburgueria Artesanal"
                    />
                    <p className="text-[10px] text-gray-400">Define o "universo" de palavras que a IA pode usar.</p>
                </div>

                {/* Público Alvo */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Users size={14} /> Público Alvo
                    </label>
                    <input
                        type="text"
                        value={profile.targetAudience || ''}
                        onChange={(e) => handleChange('targetAudience', e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-summo-primary outline-none font-medium text-gray-800"
                        placeholder="Ex: Jovens, Famílias, Amantes de Rock"
                    />
                    <p className="text-[10px] text-gray-400">Ajuda a direcionar gírias ou formalidade.</p>
                </div>

                {/* Tom de Voz */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <MessageSquare size={14} /> Tom de Voz
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Divertido', 'Profissional', 'Acolhedor'].map(tone => (
                            <button
                                key={tone}
                                type="button"
                                onClick={() => handleChange('toneOfVoice', tone)}
                                className={`px-2 py-2 rounded-lg text-xs font-bold border transition ${profile.toneOfVoice === tone
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={profile.toneOfVoice || ''}
                        onChange={(e) => handleChange('toneOfVoice', e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-summo-primary outline-none font-medium text-gray-800"
                        placeholder="Ou digite outro tom..."
                    />
                </div>

                {/* Diferenciais (Tags) */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Sparkles size={14} /> Diferenciais
                    </label>
                    <input
                        type="text"
                        value={profile.highlights?.join(', ') || ''}
                        onChange={(e) => handleChange('highlights', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-summo-primary outline-none font-medium text-gray-800"
                        placeholder="Ex: Forno a Lenha, Ingredientes Orgânicos..."
                    />
                    <p className="text-[10px] text-gray-400">Separe por vírgulas.</p>
                </div>

            </div>
        </div>
    );
};
