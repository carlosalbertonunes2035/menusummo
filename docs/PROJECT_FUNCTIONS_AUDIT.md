# Auditoria de Funções do Projeto SUMMO

Este documento lista e descreve todas as funções críticas do sistema, tanto no Frontend (React) quanto no Backend (Cloud Functions).

## 1. Backend: Cloud Functions (`functions/src`)

Estas funções rodam no servidor do Firebase e garantem a segurança e integridade dos dados.

### Gatilhos de Banco de Dados (Triggers)
*   **`onOrderCreated` (orders/{orderId})**:
    *   **Arquivo**: `functions/src/triggers/orderTriggers.ts`
    *   **Função**: Valida novos pedidos, verifica integridade dos dados e inicializa status.
*   **`onOrderStatusUpdated` (orders/{orderId})**:
    *   **Arquivo**: `functions/src/triggers/orderTriggers.ts`
    *   **Função**: Gerencia regras de negócio ao mudar status (ex: notificar cliente, liberar mesa).
*   **`onMenuImport` (imports/{importId})**:
    *   **Arquivo**: `functions/src/triggers/menuImportTrigger.ts`
    *   **Função**: Processa arquivos de cardápio enviados via upload, extraindo dados com IA.
*   **`onTenantCreate` (tenants/{tenantId})**:
    *   **Arquivo**: `functions/src/triggers/tenantTriggers.ts`
    *   **Função**: Inicializa as configurações padrão de um novo estabelecimento.
*   **`onUserCreate` (auth)**:
    *   **Arquivo**: `functions/src/triggers/userTriggers.ts`
    *   **Função**: Cria o perfil de usuário no Firestore após o registro no Authentication.

### Agentes de IA (Agents)
*   **`VisionAgent`**: `functions/src/ai/agents/visionAgent.ts` - Processamento visual de cardápios e imagens.
*   **`MarketingAgent`**: `functions/src/ai/agents/marketingAgent.ts` - Geração de copy e descrições.
*   **`PosAgent`**: `functions/src/ai/agents/posAgent.ts` - Inteligência para o PDV (sugestões, correções).
*   **`LogisticsAgent`**: `functions/src/ai/agents/logisticsAgent.ts` - Otimização de rotas e despacho.


### Funções Chamáveis (Callable Functions)
*   **`secureCheckout`**: Endpoint seguro para finalização de compra.
    *   **Função**: Recebe o carrinho, valida preços no servidor (evitando manipulação no frontend), cria o pedido e retorna o ID.
    *   **Uso**: Checkouts da Loja Online e Cardápio Digital.
*   **`generateMarketingCopy`**: Geração de texto com IA.
    *   **Função**: Usa Gemini para criar descrições persuasivas para produtos com base nos ingredientes.
    *   **Uso**: Editor de Produtos -> Aba SEO & Marketing.

## 2. Frontend: Gerenciamento de Dados (`src/contexts`)

Funções que rodam no navegador do usuário para gerenciar o estado da aplicação.

### `AppContext.tsx` -> `handleAction`
*   **Função**: Centralizador de operações CRUD (Create, Read, Update, Delete).
*   **Assinatura**: `handleAction(collection, action, id, data)`
*   **Comportamento**:
    *   `products`: Delega para `ProductService.save` ou `remove`.
    *   `orders`: Delega para `OrderService.save` ou `remove`.
    *   **Nota de Auditoria**: Para a coleção `products`, a distinção entre 'add' e 'update' é abstrata; o `ProductService.save` decide internamente se cria ou atualiza com base na existência do ID.

### `ProductService.ts` -> `save`
*   **Função**: Salva ou atualiza um produto.
*   **Lógica**:
    1. Se o objeto tem ID, verifica se existe no banco.
    2. Se existe, executa `updateDoc` (preserva campos não enviados).
    3. Se não existe (ou não tem ID), executa `setDoc` (cria/sobrescreve).
    4. **Correção Recente**: Agora aceita IDs pré-gerados para rascunhos, permitindo que a exclusão funcione antes mesmo do primeiro salvamento real.

### `useMenuEditor.ts` -> `handleDelete`
*   **Função**: Exclui o produto em edição.
*   **Lógica Atualizada**:
    1. Verifica se existe `selectedProduct.id`.
    2. Tenta excluir via `handleAction` ('delete').
    3. **Resiliência**: Se o produto for um rascunho (ainda não salvo no banco), o Firestore ignora a exclusão (sucesso implícito), e a interface limpa os dados locais. Isso garante que o botão "Lixeira" funcione sempre.

## 3. Fluxo de Identidade do Produto
Para garantir que todo produto seja "excluível" e "rastreável":

1.  **Criação (`handleOpenCreator`)**: Um ID válido do Firestore é gerado IMEDIATAMENTE na memória (`doc(collection(db, 'products')).id`).
2.  **Edição**: O produto é manipulado localmente com este ID.
3.  **Salvamento (`handleSave`)**: O objeto com ID é enviado ao banco. O banco detecta que é um ID novo e cria o documento.
4.  **Exclusão (`handleDelete`)**: O ID é enviado para exclusão. Funciona tanto para produtos salvos (deleta do banco) quanto não salvos (operação inócua no banco, limpa tela).

---
*Gerado automaticamente em 26/12/2025*
