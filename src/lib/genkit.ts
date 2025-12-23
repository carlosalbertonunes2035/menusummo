// NOTE: This file is designed to be SAFE for both Frontend (Browser) and Backend (Node.js).
// It does NOT import 'genkit' at the top level to avoid bundler (Vite) crashes.

// NOTE: This file is designed to be SAFE for both Frontend (Browser) and Backend (Node.js).
// It does NOT import 'genkit' at the top level to avoid bundler (Vite) crashes.

let whatsappOrderFlow: (input: { message: string, history?: any[], menuContext?: string, personality?: string }) => Promise<{ reply: string, items: any[], notes?: string }>;

// Environment Detection
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

if (isNode) {
    // --- BACKEND (Node.js) ---
    // We use dynamic imports/require ensuring this code is NOT executed/bundled for browser

    // Placeholder to be filled lazily or just define the logic if we were in a simpler setup.
    // However, for correct typing and execution in vite-node, we need to be careful.

    whatsappOrderFlow = async ({ message, history }) => {
        try {
            // Dynamically import Genkit only when running in Node
            // Using 'eval' or 'Function' tricks sometimes helps avoid bundler static analysis, 
            // but dynamic import() is the standard way. 
            // We use a try-catch to be double safe.
            const { gemini15Flash, googleAI } = await import('@genkit-ai/googleai');
            const { genkit, z } = await import('genkit');

            const ai = genkit({
                plugins: [googleAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' })],
                model: gemini15Flash,
            });

            const flow = ai.defineFlow(
                {
                    name: 'whatsappOrderFlow',
                    inputSchema: z.object({
                        message: z.string(),
                        history: z.array(z.object({
                            role: z.enum(['user', 'model']),
                            content: z.string()
                        })).optional()
                    }),
                    outputSchema: z.object({
                        reply: z.string(),
                        items: z.array(z.object({
                            name: z.string(),
                            quantity: z.number(),
                        })),
                        notes: z.string().optional(),
                    }),
                },
                async ({ message, history }: any) => {
                    const historyText = history?.map((h: any) => `${h.role === 'user' ? 'Cliente' : 'Atendente'}: ${h.content}`).join('\n') || '';

                    const { output } = await ai.generate({
                        prompt: `
                    Você é o "Garçom Digital" do SUMMO.
                    HISTÓRICO: ${historyText}
                    MENSAGEM: "${message}"
                    
                    Responda cordialmente e extraia o JSON.
                  `,
                        output: {
                            schema: z.object({
                                reply: z.string(),
                                items: z.array(z.object({
                                    name: z.string(),
                                    quantity: z.number(),
                                    notes: z.string().optional()
                                })),
                                notes: z.string().optional(),
                            }),
                        },
                    });
                    // Ensure we always return a valid object matching the schema
                    return output || { reply: "Desculpe, erro interno.", items: [], notes: "" };
                }
            );

            return await flow({ message, history });

        } catch (error) {
            console.error("Backend Genkit Error:", error);
            // Fallback safe return
            return { reply: "Erro no serviço de IA.", items: [], notes: "" };
        }
    };

} else {
    // --- FRONTEND (Browser) ---
    // Safe mock implementation
    whatsappOrderFlow = async ({ message }) => {
        console.log("Genkit Browser Mock called with:", message);
        await new Promise(r => setTimeout(r, 800)); // Latency simulation

        return {
            reply: "Olá! O chat inteligente está em modo de demonstração no navegador. Em produção, eu estaria conectado ao Gemini.",
            items: [],
            notes: ""
        };
    };
}

export { whatsappOrderFlow };
