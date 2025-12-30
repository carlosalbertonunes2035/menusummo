<div align="center">
  <img width="1200" height="475" alt="SUMMO Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <br />
  <h1>🍊 SUMMO | Inteligência de Lucro Real</h1>
  <p><i>"Não fique só com o bagaço. Esprema o lucro, liberte o seu tempo."</i></p>
</div>

---

## 🚀 O Diferencial SUMMO (v2.0)

A **SUMMO** não é apenas um PDV. É uma **Fábrica de Lucro** movida por Inteligência Artificial Generativa (Google Gemini 2.0).
Nossa missão é simples: **Parar o dreno de capital** de restaurantes através de análise de dados precisa e automação grounded (fiel à realidade).

### 🧠 AI Product Factory (Novo!)

Diferente de IAs que "alucinam", o SUMMO possui um pipeline de agentes especializados que respeitam o contexto do seu negócio (ex: não inventa ingredientes gourmet em uma espetaria simples).

1.  **Vision Agent (O Olheiro)**: Lê cardápios físicos (PDF/JPG) e extrai itens com 99% de precisão.
2.  **Engineer Agent (O Chef)**: Cria fichas técnicas baseadas na realidade do estabelecimento (Grounding).
3.  **Marketing Agent (O Publicitário)**: Gera descrições vendedoras e SEO técnico com o tom de voz da marca.

---

## 🛠️ Nova Stack Tecnológica

- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilo**: [Tailwind CSS 4](https://tailwindcss.com/) (Dark Mode Premium)
- **Backend Serverless**: [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- **IA Generativa**: **Google Genkit** + **Vertex AI** (Gemini 1.5 Flash & Pro)
- **Banco de Dados**: Firestore (NoSQL Real-time)
- **Armazenamento**: Firebase Storage (com regras de segurança por tenant)

---

## 📂 Estrutura do Projeto

O projeto segue uma arquitetura **Feature-Sliced** moderna para escalabilidade:

```text
/
├── functions/           # Backend (Cloud Functions & AI Agents)
│   ├── src/ai/agents/   # Vision, Engineer, Marketing Agents
│   └── src/triggers/    # Import Orchestrator
├── src/
│   ├── components/ui/   # Design System (Botões, Cards, Modais)
│   ├── features/        # Módulos de Negócio Isolados
│   │   ├── inventory/   # Importação IA e Gestão de Produtos
│   │   ├── menu/        # Cardápio Digital Público
│   │   └── ...
│   ├── lib/             # Configurações (Firebase, Utils)
│   └── services/        # Integrações (Gemini, Impressão)
└── summo-agent/         # Servidor de Impressão Local (Microserviço)
```

---

## 🏃 Começo Rápido

### Pré-requisitos
- Node.js (v18+)
- Conta Google Cloud (Vertex AI ativado)
- Firebase CLI (`npm install -g firebase-tools`)

1. **Instalação**:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Configuração Local**:
   Crie um arquivo `.env` na raiz:
   ```env
   VITE_FIREBASE_API_KEY=sua_chave
   VITE_GEMINI_API_KEY=sua_chave
   ```

3. **Rodar Aplicação**:
   ```bash
   npm run dev
   ```

4. **Rodar Backend (Emuladores)**:
   ```bash
   firebase emulators:start
   ```

---

## 📖 Documentação

- [📊 Resumo Executivo](EXECUTIVE_SUMMARY.md) - Visão completa da plataforma SUMMO
- [🏗️ Arquitetura](ARCHITECTURE.md) - Padrões e estrutura técnica
- [⚡ Algoritmos](algorithms.md) - Algoritmos ultrarrápidos
- [🍽️ Operações de Restaurante](restaurant-operations.md) - Sistema de mesas e operações
- [📱 **Comanda Virtual Self-Service - COMPLETO**](VIRTUAL_TAB_COMPLETE.md) - **Sistema completo de pedidos por QR Code**
- [🎨 Guia de Marca](BRAND_GUIDE.md) - Identidade visual e verbal
- [🔒 Segurança](SECURITY.md) - Políticas de segurança




---

<div align="center">
  Feito com 🧡 e Inteligência Artificial pela equipe SUMMO.
</div>
