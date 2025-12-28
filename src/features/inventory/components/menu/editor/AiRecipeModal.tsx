import React, { useState, useEffect } from 'react';
import { Sparkles, ChefHat, Check, X, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client'; // Assuming standard export

interface AiRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (recipeData: any) => void;
    productName: string;
    productCategory?: string;
}

export const AiRecipeModal: React.FC<AiRecipeModalProps> = ({ isOpen, onClose, onAccept, productName, productCategory }) => {
    const [loading, setLoading] = useState(true);
    const [suggestion, setSuggestion] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && productName) {
            generateSuggestion();
        }
    }, [isOpen, productName]);

    const generateSuggestion = async () => {
        setLoading(true);
        setError('');
        try {
            // CALL CLOUD FUNCTION HERE
            // For now, simulating the response as verified in 'simulation.ts'
            // In production, this would be: const generate = httpsCallable(functions, 'generateRecipeSuggestion');

            // SIMULATED LATENCY
            await new Promise(r => setTimeout(r, 2000));

            // SIMULATED AI RESPONSE based on User's request (Espetinho context)
            const mockResult = {
                name: `Receita Sugerida: ${productName}`,
                ingredients: [
                    { name: "Carne Bovina (Alcatra)", quantity: 0.150, unit: "kg", estimatedCost: 10.00 },
                    { name: "Espeto de Bambu", quantity: 1, unit: "uni", estimatedCost: 0.10 },
                    { name: "Sal Grosso", quantity: 0.005, unit: "kg", estimatedCost: 0.05 }
                ],
                totalCost: 10.15
            };

            setSuggestion(mockResult);

        } catch (err) {
            console.error(err);
            setError('Falha ao gerar sugestão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-purple-100">

                {/* Header Magic */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Wand2 size={24} className="text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded text-purple-100">IA Proativa</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Detectei uma Receita!</h3>
                        <p className="text-purple-100 text-sm mt-1">
                            Baseado em <strong>"{productName}"</strong>, encontrei estes insumos. Deseja criar?
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={16} className="text-purple-600 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">Consultando chef virtual...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                            <p className="text-gray-800 font-bold">{error}</p>
                            <button onClick={generateSuggestion} className="mt-4 text-purple-600 font-bold hover:underline">Tentar Novamente</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs font-black text-purple-400 uppercase border-b border-purple-100">
                                            <th className="pb-2">Insumo Detectado</th>
                                            <th className="pb-2 text-right">Qtd</th>
                                            <th className="pb-2 text-right">Custo Est.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-100">
                                        {suggestion?.ingredients.map((ing: any, idx: number) => (
                                            <tr key={idx} className="text-gray-700">
                                                <td className="py-2 font-medium flex items-center gap-2">
                                                    {ing.name.includes('Bambu') ? <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold">OCULTO</span> : <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>}
                                                    {ing.name}
                                                </td>
                                                <td className="py-2 text-right text-gray-500">{ing.quantity}{ing.unit}</td>
                                                <td className="py-2 text-right font-bold">{formatCurrency(ing.estimatedCost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-purple-200">
                                            <td colSpan={2} className="pt-3 font-black text-right text-purple-900 uppercase text-xs">Custo Total Sugerido</td>
                                            <td className="pt-3 text-right font-black text-lg text-purple-700">{formatCurrency(suggestion?.totalCost)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                *Ao aceitar, vou criar esses insumos no estoque se eles não existirem.
                            </p>

                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                                    Não, Obrigado
                                </button>
                                <button
                                    onClick={() => onAccept(suggestion)}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Aceitar Receita
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


