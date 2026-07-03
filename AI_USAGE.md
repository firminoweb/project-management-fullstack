# Uso de Inteligência Artificial no desenvolvimento

Este documento registra, com transparência, como ferramentas de IA foram
utilizadas na construção deste projeto e como o produto integra IA. Todas as
saídas geradas por IA passaram por **revisão humana** antes de serem incorporadas.

## Ferramenta / modelo utilizado

- **Claude (Anthropic)** como par de programação, via assistente de codificação
  no terminal.
- A própria aplicação também usa **Claude** para a análise inteligente de
  projetos (modelo configurável por `ANTHROPIC_MODEL`; padrão `claude-opus-4-8`,
  usado em demonstração com `claude-haiku-4-5`).

## Onde a IA foi utilizada no desenvolvimento

| Etapa | Uso da IA | Situação |
| ----- | --------- | -------- |
| Mapeamento dos requisitos do desafio | Extração e organização das regras de negócio e do escopo | ✅ |
| Arquitetura (monorepo, camadas, stack) | Discussão de trade-offs e decisão técnica | ✅ |
| Estrutura inicial do repositório | Geração dos arquivos base (workspaces, gitignore, READMEs) | ✅ |
| Backend NestJS (CRUD, risco, status, IA) | Geração de código, DTOs, validações e testes | ✅ |
| Persistência SQLite + TypeORM | Entidade ORM, repositório e wiring, com o domínio preservado | ✅ |
| Frontend React + Vite | Telas, camada de API tipada, React Query e design system | ✅ |
| Documentação (Swagger, READMEs, este arquivo) | Redação e organização | ✅ |

## Como o produto usa IA

- Endpoint `GET /projects/:id/ai-analysis` gera **resumo executivo, pontos de
  atenção e recomendação** a partir dos dados do projeto.
- Arquitetura isolada em camadas próprias:
  - `AiClient` (contrato abstrato) → `AnthropicAiClient` (implementação real);
  - `ProjectAnalysisPromptBuilder` monta o prompt (system + user) e **exige JSON
    estrito** como resposta;
  - `AiAnalysisService` orquestra, faz o parse/validação e decide a origem;
  - `ProjectAnalysisFallback` gera uma análise **local e determinística**.
- **Degradação graciosa:** sem `ANTHROPIC_API_KEY`, ou em qualquer falha/timeout
  da chamada, o serviço cai no fallback sem quebrar a requisição. A resposta
  sempre informa a origem em `source` (`"ai"` ou `"fallback"`), garantindo
  transparência na demonstração.

## Principais prompts utilizados (desenvolvimento)

Registro representativo dos prompts mais relevantes:

- "Leia e faça o mapeamento do documento de requisitos do desafio."
- "Explique as opções de integração de IA e de persistência, com trade-offs."
- "Implemente o CRUD de projetos em NestJS com validação via DTOs e o cálculo
  automático de risco, com testes."
- "Modele a máquina de status como fluxo linear com cancelamento e estados
  terminais, bloqueando exclusão de projetos em andamento/encerrados."
- "Isole a integração de IA em client + prompt builder + serviço, com fallback
  local que mantém o mesmo contrato de saída."
- "Migre a persistência para SQLite + TypeORM mantendo o repositório abstrato e
  o domínio sem acoplamento ao ORM."
- "Construa o frontend React + Vite consumindo a API, com estados de loading,
  erro e vazio, e exibição clara de status e risco."

## O que foi aceito, ajustado ou descartado

- **Aceito:** monorepo com Yarn Workspaces; arquitetura em camadas
  (controller → service → repository); React Query para estado de servidor;
  repository pattern com contrato abstrato.
- **Ajustado:**
  - Na persistência, em vez de decorar a entidade de domínio com anotações do
    TypeORM, optou-se por uma **entidade ORM separada + mapper**, mantendo o
    domínio puro.
  - A integração de IA foi ajustada para **IA real com fallback**, garantindo o
    diferencial sem risco de quebra na avaliação.
  - Timestamps e `id` gerados no repositório (não pelo ORM) para manter idêntico
    o contrato entre as implementações in-memory e SQLite.
- **Descartado:** Postgres + Docker para a persistência principal (fricção
  desnecessária ao avaliador) — adotado **SQLite**; e Tailwind no frontend, em
  favor de **CSS puro com design tokens**, para um build mais previsível.

## Decisões técnicas tomadas pelo desenvolvedor (revisão humana)

- Regra de risco = **max(risco por orçamento, risco por prazo)**, recalculada em
  create/update.
- `monthsBetween` conta **meses de calendário** (decisão de interpretação).
- Status **Encerrado** e **Cancelado** são **terminais** (sem transições de
  saída), coerente com o bloqueio de exclusão.
- Enums canônicos + mapa de rótulos (labels) reutilizados pelo frontend via
  `statusLabel`/`riskLabel`, evitando duplicação.
- Camadas de IA e de persistência **abstratas** para troca fácil de provedor/DB.
- Frontend **espelha** a máquina de status apenas para orientar a UI; a
  validação real permanece no backend.

## Limitações conhecidas

- A análise com IA depende de credencial externa; sem chave, usa-se o fallback
  local (determinístico, sem chamada de rede).
- Persistência em SQLite local com `synchronize: true` (sem migrations), adequado
  ao escopo do desafio, mas não recomendado para produção.
- Sem autenticação/autorização (fora do escopo).
- A análise de IA não é persistida — é gerada sob demanda a cada chamada.
- Testes de frontend (Vitest + Testing Library) cobrem componentes e estados
  críticos (formulário/validação, badges, estados e listagem); fluxos ponta a
  ponta de UI (e2e) não estão cobertos.
