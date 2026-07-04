# Web — Frontend (React + Vite)

Frontend em **React + Vite + TypeScript** que consome a API de gerenciamento de projetos.

## Stack

- **React 18 + Vite + TypeScript**
- **React Router** — navegação entre listagem, formulário e detalhe
- **TanStack Query (React Query)** — estado de servidor, cache e invalidação em mutações
- **CSS puro com design tokens** — badges de status/risco, cards e estados

## Telas

- **Listagem** (`/`): cards com status, risco, orçamento e prazo; estados de loading, erro e lista vazia
- **Novo projeto** (`/projects/new`): formulário validado (status inicial e risco são automáticos)
- **Editar** (`/projects/:id/edit`): mesmo formulário pré-preenchido
- **Detalhe** (`/projects/:id`): dados completos, avançar status / cancelar (conforme a máquina de estados), editar, excluir (bloqueado por status) e **análise com IA** (resumo, pontos de atenção e recomendação executiva, com indicação de origem `IA`/`fallback`)

## Como rodar

Pré-requisito: a API rodando (veja `apps/api`). Por padrão o front consome `http://localhost:3000`.

```bash
# na raiz do monorepo
yarn dev:web        # sobe o Vite em http://localhost:5173
```

Para apontar para outra URL de API, crie um `.env` a partir de `.env.example`:

```bash
VITE_API_URL=http://localhost:3000
```

## Scripts

- `yarn workspace @app/web dev` — servidor de desenvolvimento
- `yarn workspace @app/web build` — typecheck (`tsc`) + build de produção
- `yarn workspace @app/web preview` — pré-visualiza o build
- `yarn workspace @app/web test` — testes (Vitest + Testing Library)
- `yarn workspace @app/web test:cov` — testes com cobertura (thresholds mínimos)

## Testes

**Vitest + Testing Library** (ambiente `jsdom`). Ficam em `tests/`, separados do
código-fonte e espelhando a estrutura de `src/` (imports usam o alias `@`):

```
tests/
  api/          # cliente HTTP e endpoints (fetch mockado)
  components/   # badges, estados, formulário
  pages/        # listagem, criar, editar e detalhe (React Query + Router)
  fixtures.ts   # projeto de exemplo
  utils.tsx     # render com providers
  setup.ts      # matchers do jest-dom
```

Cobrem validação de formulário, camada de API, hooks de dados, render de
badges/estados e o fluxo das páginas (criar, editar, avançar status, análise de
IA e exclusão). Cobertura atual: ~97% de linhas. Os thresholds mínimos são
verificados em `test:cov`.

## Organização

```
src/
  api/         cliente HTTP tipado + endpoints de projetos
  components/  Layout, badges, estados (loading/erro/vazio), formulário
  hooks/       hooks de React Query (queries e mutações)
  lib/         formatação (moeda, datas)
  pages/       listagem, criar, editar e detalhe
  types/       tipos do domínio + espelho da máquina de status e rótulos
```
