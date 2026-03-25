# CLAUDE.md — mcp-server-runrunit

## Overview

MCP server (Model Context Protocol) para integração com a API do Runrun.it (Runrunit).
Permite que Claude interaja com tarefas, projetos, usuários e registro de horas diretamente via ferramentas MCP.

github do projeto: https://github.com/mariombn/mcp-server-runrunit
API docs: https://runrun.it/api/documentation
API doc Markdown: `./doc/api.md` (Usar essa de preferencia)

## Stack

- **TypeScript** (strict mode, ESNext + NodeNext modules)
- **@modelcontextprotocol/sdk** — SDK oficial do MCP
- **t3-env + zod** — validação de variáveis de ambiente
- **Native fetch** do Node.js — sem axios ou node-fetch
- **tsx** para dev, `tsc` para build

## Comandos

```bash
npm install
npm run dev      # roda direto com tsx (desenvolvimento)
npm run build    # compila para ./build
npm run start    # roda o build compilado
```

## Autenticação

A API do Runrun.it usa dois headers obrigatórios em todas as requisições:

```
App-Key: <app_key_da_empresa>
User-Token: <token_do_usuario>
```

Configurados via `.env`:
```
RUNRUNIT_APP_KEY=...
RUNRUNIT_USER_TOKEN=...
```

O `src/env.ts` valida essas variáveis com zod via `t3-env`. Nunca acessar `process.env` diretamente — sempre importar de `./env.js`.

## Arquitetura

```
src/
├── index.ts          # Entry point: instancia server, agrega tools, conecta transport
├── env.ts            # Validação de env vars (t3-env + zod)
├── client.ts         # runrunitFetch() + interfaces TypeScript da API
└── tools/
    ├── tasks.ts      # get_task, get_task_details, list_tasks, create_task, update_task
    ├── projects.ts   # list_projects
    ├── users.ts      # get_me, list_users
    └── time.ts       # create_time_entry, list_time_entries

tests/
├── client.test.ts
└── tools/
    ├── tasks.test.ts
    ├── projects.test.ts
    ├── users.test.ts
    └── time.test.ts
```

## Ferramentas implementadas

| Tool | Módulo | Descrição |
|------|--------|-----------|
| `get_task` | tasks | Busca task por ID com descrição separada |
| `get_task_details` | tasks | Resposta bruta da API (para debug/campos técnicos) |
| `list_tasks` | tasks | Lista tasks com filtros: responsible_id, project_id, team_id, is_closed, sort_by, page, limit |
| `create_task` | tasks | Cria nova task (obrig: title, project_id) |
| `update_task` | tasks | Atualiza task existente (obrig: id) |
| `list_projects` | projects | Lista projetos disponíveis |
| `get_me` | users | Dados do usuário autenticado |
| `list_users` | users | Lista usuários do time (filtros: team_id, limit) |
| `create_time_entry` | time | Registra horas em uma task (obrig: task_id, amount, date) |
| `list_time_entries` | time | Lista horas registradas (filtros: task_id, user_id, start_date, end_date, limit) |

### Observações sobre a API

- `responsible_id` / `user_id` são **string slugs** (ex: `"mario-neto"`), não inteiros
- `project_id`, `team_id`, `board_stage_id` são **numéricos**
- `amount` em time entries é em **segundos** (ex: 3600 = 1h)
- `current_estimate_seconds` é o campo de estimativa de tasks

## Convenções de código

- Nunca usar `any` — definir interfaces para respostas da API em `client.ts`
- Cada arquivo em `tools/` exporta: `toolDefinitions` (array de schemas) + `handleTool(name, args)` (handler)
- `index.ts` agrega os `toolDefinitions` de todos os módulos e faz dispatch para os handlers
- Handlers lançam exceção em caso de erro — `index.ts` captura e retorna `{ content, isError: true }`
- Helpers `simplify*()` transformam respostas brutas da API em formato legível pelo modelo

## Configuração no Claude Code (settings.json)

```json
{
  "mcpServers": {
    "runrunit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:mariombn/mcp-server-runrunit"],
      "env": {
        "RUNRUNIT_APP_KEY": "${RUNRUNIT_APP_KEY}",
        "RUNRUNIT_USER_TOKEN": "${RUNRUNIT_USER_TOKEN}"
      }
    }
  }
}
```
