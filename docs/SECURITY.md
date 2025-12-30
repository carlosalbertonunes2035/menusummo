# 🛡️ Segurança & Infraestrutura

## 1. Endurecimento Enterprise (Hardening)
O Summo Enterprise implementa protocolos de segurança rigorosos para evitar vazamentos de dados e acessos não autorizados.

### Política de Segurança de Conteúdo (CSP)
- **Implementação**: Gerenciada via cabeçalhos no `firebase.json`.
- **Restrições**: Limita a execução de scripts apenas a domínios confiáveis (Firebase, APIs do Google), prevenindo ataques de XSS.

### Proteção de Chaves de API
- **Vulnerabilidade**: Exposição de chaves do Google Maps ou Gemini API no lado do cliente.
- **Correção**: Operações sensíveis são roteadas através de **Cloud Functions** (Lado do Servidor). O cliente nunca tem acesso à chave bruta.

---

## 2. Limitação de Taxa & Proteção (Rate Limiting)
- **Rate Limiting de Login**: Previne ataques de força bruta em contas de usuários.
- **Firebase App Check**: Protege o Firestore e as Functions contra requisições que não venham do app original (bots/scrapers).
- **Integração Cloudflare**: Configurado para proteção contra DDoS e cache avançado na borda (edge caching).

---

## 3. Logs de Auditoria & Conformidade
A implementação do `BaseRepository` garante que cada operação de escrita seja registrada para fins de auditoria.
- **Isolamento de `tenantId`**: Cada documento é estritamente vinculado a um `tenantId`. As regras do Firestore garantem que os usuários só possam ler/gracrever documentos onde o `tenantId` corresponda ao seu `systemUser` autenticado.
- **Identidade do Usuário**: Operações exigem `auth.currentUser.uid` para transparência e rastreabilidade.

---

## 4. Regras de Segurança do Firestore
Nossas regras são particionadas em:
1.  **Dados Públicos**: Acesso apenas de leitura para clientes com base nos slugs das lojas.
2.  **Dados Privados Enterprise**: Controle de acesso baseado em funções (RBAC), garantindo que apenas membros autorizados possam gerenciar inventário, pessoal e registros financeiros.
