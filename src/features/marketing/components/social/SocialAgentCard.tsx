import React from 'react';
import { Wand2, Loader2, Copy } from 'lucide-react';
import { useSocialAgent } from './useSocialAgent';

export const SocialAgentCard: React.FC = () => {
    const {
        prompt,
        setPrompt,
        isGenerating,
        ideas,
        handleGenerate
    } = useSocialAgent();

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Social Media IA</h3>
                    <p className="opacity-90 text-sm mb-4">Diga o que quer postar e a IA cria legendas e ideias para Stories e Feed.</p>
                    <div className="flex gap-2">
                        <input
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Ex: Dia de chuva, promoção de açaí..."
                            className="flex-1 p-3 rounded-xl text-gray-800 outline-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-white text-orange-700 px-6 font-bold rounded-xl flex items-center gap-2 hover:bg-orange-50 transition"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                            Gerar
                        </button>
                    </div>
                </div>
                <Wand2 className="absolute -bottom-10 -right-10 text-white opacity-10" size={150} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded uppercase">
                                {idea.type}
                            </span>
                            <button className="text-gray-400 hover:text-orange-600">
                                <Copy size={16} />
                            </button>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2">{idea.title}</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{idea.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
