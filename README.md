# Project Management Fullstack

Aplicação web para **gerenciamento simplificado de projetos**: cadastro, consulta, edição e remoção de projetos, com controle de status, **cálculo automático de risco** e **análise textual com apoio de Inteligência Artificial**.

> Projeto desenvolvido como desafio técnico para uma vaga de Desenvolvedor(a) Fullstack (React + Node com IA).

## Stack

| Camada | Tecnologias |
| ------ | ----------- |
| Frontend | React + Vite + TypeScript |
| Backend  | Node.js + NestJS + TypeScript (API REST) |
| Persistência | SQLite + TypeORM (repository pattern) |
| IA | Integração real (Claude API) com **fallback** para análise mockada |
| Documentação | Swagger/OpenAPI (`/docs`) |
| Monorepo | Yarn Workspaces |

## Estrutura do monorepo

```
project-management-fullstack/
├── apps/
│   ├── api/        # Backend NestJS (API REST)
│   └── web/        # Frontend React + Vite
├── package.json    # Workspaces + scripts de orquestração
├── README.md       # Este arquivo
└── AI_USAGE.md     # Documentação do uso de IA no desenvolvimento
```

## Principais regras de negócio

- **Status** segue uma máquina de estados: `Em análise → Aprovado → Em andamento → Encerrado`, com `Cancelado` acessível a partir de qualquer status. Não é permitido pular etapas.
- Projetos **Em andamento** ou **Encerrado** não podem ser excluídos.
- **Risco** é calculado automaticamente a partir do orçamento e do prazo (início → término), prevalecendo sempre o maior risco entre as duas dimensões.
- A **análise com IA** fica isolada em uma camada de serviço, com estrutura pronta para integração real e fallback local.

## Pré-requisitos

- Node.js `>= 20` (recomendado `22`, ver `.nvmrc`)
- Yarn `1.x`

## Como executar

> ⚙️ Instruções detalhadas de execução serão adicionadas conforme os apps `api` e `web` forem implementados.

```bash
# Instalar dependências de todo o monorepo
yarn install

# Rodar o backend (porta padrão do NestJS)
yarn dev:api

# Rodar o frontend (Vite)
yarn dev:web
```

Com a API no ar, a **documentação Swagger/OpenAPI** fica em
`http://localhost:3000/docs`.

### Configuração da IA (opcional)

A análise inteligente do projeto funciona **sem nenhuma configuração**: sem
`ANTHROPIC_API_KEY`, o endpoint usa um **fallback local** (análise determinística).
Para ativar a **IA real (Claude)**, copie `apps/api/.env.example` para `apps/api/.env`
e defina `ANTHROPIC_API_KEY`. A chave nunca é versionada.

## Documentação

- [`AI_USAGE.md`](./AI_USAGE.md) — como a IA foi utilizada durante o desenvolvimento
- [`apps/api/README.md`](./apps/api/README.md) — detalhes do backend
- [`apps/web/README.md`](./apps/web/README.md) — detalhes do frontend

## Roadmap de implementação

- [x] Estrutura inicial do monorepo (workspaces + documentação)
- [x] Scaffold do backend NestJS (boot, `GET /health`, CORS, ValidationPipe)
- [x] Modelo, DTOs e validações de projeto + CRUD (`/projects`)
- [x] Cálculo automático de risco (com testes)
- [x] Máquina de estados de status + bloqueio de exclusão (com testes)
- [x] Camada de análise com IA (serviço + client + prompt builder + fallback, com testes)
- [x] Documentação da API (Swagger/OpenAPI em `/docs`) + tratamento global de erros
- [x] Testes das regras principais (risco, status e análise com IA)
- [x] Persistência com SQLite + TypeORM (troca do repositório in-memory)
- [x] Scaffold do frontend React + Vite (Router + React Query + design system)
- [x] Telas: listagem, formulário (criar/editar), detalhe e análise com IA
- [x] Tratamento de loading, erro e estado vazio
