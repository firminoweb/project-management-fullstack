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

## Endpoints previstos

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| POST   | /projects              | Criar projeto |
| GET    | /projects              | Listar projetos |
| GET    | /projects/:id          | Buscar por ID |
| PATCH  | /projects/:id          | Atualizar projeto |
| DELETE | /projects/:id          | Remover projeto |
| PATCH  | /projects/:id/status   | Avançar / cancelar status |
| GET    | /projects/:id/ai-analysis | Análise com apoio de IA |

> Scaffold completo do NestJS será adicionado nos próximos commits.
