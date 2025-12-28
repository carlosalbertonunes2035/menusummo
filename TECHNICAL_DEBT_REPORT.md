# 📉 Relatório de Débitos Técnicos & Roadmap Arquitural
**Status:** Alpha Enterprise
**Auditor:** Antigravity AI

---

## 1. Débitos Técnicos de Alta Prioridade (O que impede o crescimento)

### 🧩 A. Monólitos de UI (Acoplamento)
Identifiquei arquivos que cresceram demais e violam o princípio de responsabilidade única:
*   **`Marketing.tsx` (53KB):** Contém lógica de Cupons, SEO, Social Media AI e Configurações de Loja. Se um erro ocorrer no SEO, o gerenciamento de cupons pode quebrar.
*   **`CartModal.tsx` (40KB):** Responsável por UI do carrinho, cálculo de frete, cálculo de descontos e taxas de serviço.
*   **`ProductEditor.tsx` (33KB):** Gerencia abas de Engenharia, SEO, Canais e Informações Básicas.

### ⚡ B. Gargalo de Memória (Scalability)
O **`DataContext.tsx`** ainda é um "Eager Loader":
*   **Problema:** Ele baixa a coleção COMPLETA de `products` e `ingredients` ao iniciar.
*   **Risco Técnico:** Restaurantes com +500 produtos ou +1000 insumos farão o app mobile do garçom/cliente travar ou demorar 10s+ para abrir.
*   **Solução:** Mudar para paginação (Infinite Scroll) usando TanStack Query.

### 🛡️ C. Lógica de Negócio Vazada (Security)
*   **Problema:** O cálculo do `total` do carrinho é feito 100% no cliente (`CartModal.tsx`).
*   **Ataque possível:** Um usuário mal-intencionado pode mudar o preço de um produto para R$ 0,01 via console do navegador e completar o pedido.
*   **Solução:** Implementar `secureCheckout` em Cloud Functions para validar preços contra o banco antes de salvar o pedido.

---

## 2. O que falta implementar (Roadmap de Engenharia)

### 📊 Quadrante de Maturidade

| Área | Status | Pendência Crítica |
| :--- | :--- | :--- |
| **Segurança** | 🟠 Médio | Audit Logs de ações (Quem mudou o preço? Quem deletou o produto?) |
| **Performance** | 🔴 Baixo | Implementar Paginação / Virtualização de Listas |
| **Integridade** | 🟠 Médio | Validação Server-side de Pedidos (Pricing Enforcement) |
| **Tipagem** | 🟢 Alto | Zod universal em todas as mutações `handleAction` |

---

## 3. Plano de Ação (Próximos Passos)

### **Semana 1: Blindagem & Escala**
1.  **Refactor DataContext:** Migrar `products` para paginação.
2.  **Audit Logs:** Criar coleção `audit_logs` e registrar mutações críticas (delete, update price).
3.  **Pricing Security:** Criar Cloud Function `calculateOrder` para validação de checkout.

### **Semana 2: Desmembramento de Monólitos**
1.  Extrair `CouponManager` de `Marketing.tsx`.
2.  Extrair `SocialAgent` de `Marketing.tsx`.
3.  Modularizar `ProductEditor` em componentes menores (já iniciado, mas incompleto).

---

## 📝 Veredito do Auditor
O sistema está **seguro contra vazamento de dados** (graças às novas Firestore Rules), mas está **vulnerável a fraudes de preço** e **problemas de performance**.
Priorize a **Paginação** e o **Checkout Seguro** antes de abrir para grandes volumes de clientes.
