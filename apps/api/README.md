# API — Backend (NestJS)

Backend em **Node.js + NestJS + TypeScript** responsável pela API REST de gerenciamento de projetos.

## Responsabilidades

- CRUD de projetos e alteração de status
- Cálculo automático de risco (orçamento × prazo)
- Validação da máquina de estados de status
- Bloqueio de exclusão conforme status
- Análise textual com apoio de IA (serviço isolado, com fallback)

## Arquitetura em camadas

```
controller → service → repository (TypeORM/SQLite)
                    ↘ ai/ (AiAnalysisService · AiClient · ProjectAnalysisPromptBuilder)
```

## Endpoints

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| POST   | /projects              | Criar projeto |
| GET    | /projects              | Listar projetos |
| GET    | /projects/:id          | Buscar por ID |
| PATCH  | /projects/:id          | Atualizar projeto |
| DELETE | /projects/:id          | Remover projeto |
| PATCH  | /projects/:id/status   | Avançar / cancelar status |
| GET    | /projects/:id/ai-analysis | Análise com apoio de IA |

Documentação interativa (Swagger/OpenAPI) disponível em `/docs`.

## Testes

Os testes ficam em `test/`, separados do código-fonte e espelhando a estrutura
de `src/` (imports usam o alias `@src/*`):

```
test/
  unit/          # testes unitários (Jest)
    common/      #   filtro de erros, interceptor de log
    projects/    #   service, risco, status, IA (fallback, prompt, client)
  e2e/           # fluxo HTTP completo (supertest + SQLite :memory:)
  jest.json      # configuração única do Jest
```

```bash
yarn workspace @app/api test       # unitários
yarn workspace @app/api test:e2e   # e2e
yarn workspace @app/api test:cov   # unit + e2e com cobertura (thresholds mínimos)
```

Cobertura atual: ~96% de linhas/statements. Os thresholds mínimos são
verificados em `test:cov` (falha o comando se a cobertura cair).

## Configuração (variáveis de ambiente)

Copie `.env.example` para `.env`. Principais chaves:

- `PORT` (padrão `3000`), `CORS_ORIGIN`
- `DATABASE_PATH` — caminho do arquivo SQLite (padrão `data/app.sqlite`)
- `ANTHROPIC_API_KEY` — sem ela, a análise usa o fallback local
- `ANTHROPIC_MODEL` — modelo da análise (padrão `claude-opus-4-8`)
