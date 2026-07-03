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

## Testes

- **Vitest + Testing Library** (ambiente `jsdom`)
- Cobrem: validação do formulário, render de badges de status/risco, estados de
  loading/erro/vazio e a listagem (com a API mockada)

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
