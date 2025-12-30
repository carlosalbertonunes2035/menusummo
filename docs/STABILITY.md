# 🧪 Estabilidade & Padrões de Engenharia

## 1. Framework de Testes: Vitest
Utilizamos o **Vitest** para testes unitários e de integração. A suíte está configurada para rodar de forma eficiente com a React Testing Library.

### Padrão de Mocking Recomendado
Para evitar erros de "Provider não encontrado", utilizamos o padrão `importOriginal`. Isso garante que os componentes de Provider em si permaneçam funcionais, enquanto mockamos apenas a lógica interna desejada.

```typescript
// ✅ PADRÃO RECOMENDADO
vi.mock('@/contexts/AppContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/contexts/AppContext')>();
    return {
        ...actual,
        useApp: () => ({
            ...actual.useApp(),
            showToast: vi.fn(), // Mock direcionado
        })
    };
});
```

### Regras Principais
- **Não mockar Providers para fora da existência**: Se você mockar um arquivo de contexto, DEVE retornar o componente `Provider` usando `importOriginal`.
- **Estado Limpo**: Sempre use `vi.clearAllMocks()` no `beforeEach` para evitar contaminação entre testes.

---

## 2. Padrão de Repositório (Repository Pattern)
O acesso aos dados é centralizado através de repositórios (ex: `ProductRepository`, `CustomerRepository`) que estendem um `BaseRepository`.

- **Consistência**: Todas as atualizações usam `setDoc(doc, payload, { merge: true })` em vez de `updateDoc` para garantir a existência do documento e consistência nos logs de auditoria.
- **Logs de Auditoria**: Cada operação de repositório exige o ID do usuário autenticado no momento para trilhas de auditoria.

---

## 3. Linting & Segurança de Tipos
- **Rules of Hooks**: Aplicadas rigorosamente para evitar chamadas ilegais de hooks (ex: hooks condicionais).
- **Sem Any Implícito**: Todos os payloads de dados devem ser tipados via esquemas Zod ou interfaces TypeScript.
- **Pureza**: React effects e memos devem evitar efeitos colaterais que triggerem re-renders infinitos.
