# CLAUDE.md — mcp-server-runrunit

## Overview

MCP server (Model Context Protocol) para integração com a API do Runrun.it (Runrunit).
Permite que Claude interaja com tarefas, projetos, usuários e registro de horas diretamente via ferramentas MCP.

Forked de: https://github.com/ygor-infotera/runrunit-mcp
API docs: https://runrun.it/api/documentation

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

## Arquitetura atual (o que veio do fork)

Tudo está em `src/index.ts` — um único arquivo com server + tools + fetch helper.
A refatoração para múltiplos módulos é planejada (ver seção abaixo).

**Arquivos existentes:**
- `src/index.ts` — entry point, server MCP, todos os handlers
- `src/env.ts` — validação de env vars
- `direct-test.ts` / `test-server.ts` — arquivos de teste na raiz (legado, devem ser removidos ou movidos)

## Ferramentas implementadas (herdadas do fork)

| Tool | Descrição |
|------|-----------|
| `get_task` | Busca task por ID com descrição separada |
| `get_task_details` | Resposta bruta da API (para debug/campos técnicos) |
| `list_tasks` | Lista tasks com filtros básicos |
| `get_me` | Dados do usuário autenticado |
| `get_config_status` | Debug de env vars — deve ser removido |

## Refatoração planejada

A ideia é manter o `runrunitFetch()` e o padrão `simplifyTask()`, mas reorganizar assim:

```
src/
├── index.ts          # apenas: instancia server, registra tools, inicia transport
├── client.ts         # runrunitFetch(), tipos da API (substituir `any` por interfaces)
└── tools/
    ├── tasks.ts      # get_task, get_task_details, list_tasks, create_task, update_task
    ├── projects.ts   # list_projects, get_project
    ├── users.ts      # get_me, list_users
    └── time.ts       # create_time_entry, list_time_entries
```

## Features a implementar

- [ ] Remover `get_config_status` como tool exposta
- [ ] Adicionar tipos TypeScript para respostas da API (substituir `any`)
- [ ] `create_task` — criar nova task
- [ ] `update_task` — atualizar status, responsável, prazo
- [ ] `list_projects` — listar projetos disponíveis
- [ ] `list_users` — listar usuários do time
- [ ] `create_time_entry` — registrar horas em uma task
- [ ] `list_time_entries` — listar horas registradas
- [ ] Filtros adicionais em `list_tasks`: `team_id`, `board_stage`, paginação

## Convenções de código

- Nunca usar `any` — definir interfaces para respostas da API em `client.ts`
- Cada arquivo em `tools/` exporta: `toolDefinitions` (array de schemas) + `handleTool(name, args)` (handler)
- `index.ts` agrega os `toolDefinitions` de todos os módulos e faz dispatch para os handlers
- Erros da API sempre retornam `{ content, isError: true }` — nunca lançar exceção para fora do handler
- Remover `direct-test.ts` e `test-server.ts` da raiz quando iniciar a refatoração

## Configuração no Claude Code (settings.json)

```json
{
  "mcpServers": {
    "runrunit": {
      "command": "npx",
      "args": ["tsx", "/Users/mario/sandbox/hero/mcp-server-runrunit/src/index.ts"],
      "env": {
        "RUNRUNIT_APP_KEY": "sua_app_key",
        "RUNRUNIT_USER_TOKEN": "seu_user_token"
      }
    }
  }
}
```
