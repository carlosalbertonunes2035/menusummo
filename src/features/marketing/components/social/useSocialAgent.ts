import { useState } from 'react';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client';
import { SocialIdea } from './types';

export function useSocialAgent() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [ideas, setIdeas] = useState<SocialIdea[]>([]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            const generateSocialMedia = httpsCallable(functions, 'generateSocialMedia');
            const { data } = await generateSocialMedia({ prompt });
            setIdeas(data as SocialIdea[]);
        } catch (e) {
            console.error(e);
            // Fallback mock if function fails locally without emulators
            setIdeas([{
                title: "Ideia Local",
                content: "Erro na IA ou emuladores desconectados.",
                type: "ERRO"
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        prompt,
        setPrompt,
        isGenerating,
        ideas,
        handleGenerate
    };
}
