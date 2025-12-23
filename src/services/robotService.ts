
/**
 * RobotService - Automações Determísticas (Custo Zero / Instantâneas)
 * Focado em eliminar uso desnecessário de IA para tarefas previsíveis.
 */

export const RobotService = {
    // 1. Geração de SEO Baseado em Regras
    generateBaseSEO: (brandName: string, categoryNames: string[]) => {
        const categoriesStr = categoryNames.slice(0, 3).join(', ');
        return {
            description: `Peça o melhor de ${brandName} online! ${categoriesStr ? `Especialistas em ${categoriesStr}.` : ''} Entrega rápida e qualidade garantida.`,
            keywords: [
                'delivery',
                brandName.toLowerCase(),
                ...categoryNames.map(c => c.toLowerCase()),
                'pedir online',
                'cardápio digital'
            ].slice(0, 10)
        };
    },

    // 2. Templates de Cupons de Sucesso
    getCouponTemplates: () => [
        { code: 'BEMVINDO10', type: 'PERCENTAGE', value: 10, label: 'Boas-vindas (10%)' },
        { code: 'PRIMEIRACOMPRA', type: 'FIXED', value: 15, label: 'Primeira Vez (R$ 15)' },
        { code: 'FDS20', type: 'PERCENTAGE', value: 20, label: 'Fim de Semana (20%)' },
        { code: 'FRETEGRATIS', type: 'FIXED', value: 0, label: 'Frete Grátis', minOrderValue: 50 },
    ],

    // 3. Regras de Upsell (Cross-sell Inteligente sem IA)
    getRuleBasedUpsell: (productCategory: string): string | null => {
        const rules: Record<string, string[]> = {
            'Hambúrguer': ['Batata Frita', 'Refrigerante', 'Milkshake'],
            'Espetinho': ['Cerveja', 'Pão de Alho', 'Arroz Carreteiro'],
            'Pizza': ['Refrigerante 2L', 'Pizza Doce', 'Borda Recheada'],
            'Açaí': ['Leite Ninho', 'Nutella', 'Granola Extra'],
            'Bebida': ['Porção de Fritas', 'Amendoim'],
        };

        const suggestions = rules[productCategory] || [];
        if (suggestions.length === 0) return null;

        // Retorna um termo de busca para o robô localizar no cardápio
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    },

    // 4. Limpeza de Strings e Formatação Automática
    autoFixStoreName: (name: string) => {
        return name
            .trim()
            .replace(/\s+/g, ' ') // Remove espaços duplos
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
};
