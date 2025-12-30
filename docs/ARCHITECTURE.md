# 🏗️ Arquitetura & Camada de Dados

## 1. Padrão AI-First Triad
Para garantir que a base de código permaneça manutenível e compatível com agentes de IA, transitamos de "God Files" (monólitos com mais de 500 linhas) para o padrão **AI-First Triad**.

### A Estrutura
Cada funcionalidade principal está agora dividida em três camadas distintas:
1.  **Tipos (`/types/`)**: Interfaces TypeScript estritas que servem como o contrato para a funcionalidade.
2.  **Logic Hook (`/hooks/`)**: Lógica headless contendo gestão de estado, cálculos e efeitos colaterais.
3.  **Atomic UI (`/components/`)**: Componentes de apresentação visual que consomem o hook de lógica e são mantidos pequenos (<150 linhas).

### Benefícios
- **Gestão de Contexto de IA**: Agentes podem ler apenas o hook ou apenas o componente de UI, reduzindo o consumo de tokens e erros.
- **Testes Unitários**: A lógica é facilmente testável isoladamente da interface visual.

---

## 2. TanStack Query v5 (Camada de Dados)
Migramos de um modelo de prop-drilling baseado no `AppContext` para o **TanStack Query** para uma gestão de dados reativa e com cache.

### Infraestrutura
- **`QueryProvider.tsx`**: Configura padrões globais (ex: `staleTime: 5 * 60 * 1000`).
- **Persistência**: As queries são cacheadas para reduzir significativamente os custos de leitura do Firestore (redução projetada de ~60% no projeto).
- **Biblioteca de Hooks**:
    - `useSettingsQuery`: Configurações reativas da loja.
    - `useProductsQuery`: Sincronização em tempo real do catálogo.
    - `useIngredientsQuery`: Gestão de inventário.

### Por que TanStack Query?
1.  **Cache Reativo**: Os dados são atualizados em todo o app instantaneamente quando uma query é invalidada.
2.  **Atualizações Otimistas**: As mudanças parecem instantâneas para o usuário enquanto o sincronismo ocorre em segundo plano.
3.  **Gestão de Erros**: Lógica de repetição (retry) e boundaries de erro integrados.

---

## 3. Otimização do Cardápio Digital
O cardápio público utiliza um `PublicDataContext` especializado que resolve dados baseados em slugs de URL, otimizando para SEO e carregamentos iniciais rápidos.

- **Resolução de Slug**: `1 Tenant = 1 Slug Único`.
- **Injeção de Branding**: Cores e logos são injetados dinamicamente em variáveis CSS (`--summo-primary`, `--summo-bg`) em tempo de execução com base nas configurações do lojista.
