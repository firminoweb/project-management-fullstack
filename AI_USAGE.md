# Uso de Inteligência Artificial no desenvolvimento

Este documento registra como ferramentas de IA foram utilizadas durante a elaboração deste projeto, conforme exigido pelo desafio técnico. Ele será atualizado ao longo do desenvolvimento.

## Ferramenta / modelo utilizado

- **Claude (Anthropic)**, via assistente de codificação no terminal, como par de programação.

## Em quais partes a IA foi utilizada

| Etapa | Uso da IA | Situação |
| ----- | --------- | -------- |
| Leitura e mapeamento dos requisitos do desafio | Extração e organização das regras de negócio e do escopo | ✅ Concluído |
| Definição da arquitetura (monorepo, camadas, stack) | Discussão de trade-offs e decisão técnica | ✅ Concluído |
| Estrutura inicial do repositório | Geração dos arquivos base (workspaces, READMEs, gitignore) | ✅ Concluído |
| Backend NestJS (regras de negócio, DTOs, IA) | — | ⏳ Em andamento |
| Frontend React | — | ⏳ Em andamento |

## Principais prompts utilizados

> Registro dos prompts mais relevantes (será complementado ao longo do desenvolvimento).

- "Leia e faça o mapeamento do documento de requisitos do desafio."
- "Explique as opções de integração de IA e de persistência, com trade-offs."

## O que foi aceito, ajustado ou descartado

- **Aceito:** organização em monorepo com Yarn Workspaces separando `api` e `web`.
- **Ajustado:** decisão sobre integração de IA — optou-se por **IA real com fallback para mock**, garantindo o diferencial sem risco de quebra na demonstração.
- **Descartado (por ora):** Postgres/Docker para persistência, por adicionar fricção desnecessária ao avaliador; adotado **SQLite**.

## Decisões técnicas tomadas pelo desenvolvedor

- Escolha da stack e da arquitetura em camadas (controller → service → repository).
- Isolamento da camada de IA em serviço próprio, com client e prompt builder separados.
- Persistência em SQLite via TypeORM, mantendo o repository pattern.

## Limitações conhecidas

- A análise com IA depende de credencial externa; sem chave configurada, é usada uma implementação de fallback local.
- Dados persistidos em SQLite local (sem deploy em nuvem, fora do escopo do desafio).

> Seções acima serão detalhadas com senso crítico (revisão humana das saídas da IA) à medida que o projeto avança.
