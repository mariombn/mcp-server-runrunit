# mcp-server-runrunit

Servidor MCP ([Model Context Protocol](https://modelcontextprotocol.io)) para integração com a API do [Runrun.it](https://runrun.it). Permite que o Claude interaja com tarefas, usuários e projetos do Runrun.it diretamente via ferramentas MCP.

- API docs: https://runrun.it/api/documentation

## Ferramentas disponíveis

| Tool | Descrição |
|------|-----------|
| `get_task` | Busca informações de uma task por ID (título, descrição, status, responsável etc.) |
| `get_task_details` | Retorna a resposta bruta completa da API para uma task (útil para campos técnicos) |
| `list_tasks` | Lista tasks com filtros opcionais |
| `get_me` | Retorna os dados do usuário autenticado |

### Filtros disponíveis em `list_tasks`

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `responsible_id` | string | ID do responsável pela task |
| `project_id` | number | ID do projeto |
| `is_closed` | boolean | Filtrar por tasks fechadas |
| `limit` | number | Quantidade de tasks (máx. 100) |

## Pré-requisitos

- Node.js 18+
- Credenciais da API do Runrun.it: **App Key** e **User Token**
  - Acesse **Configurações → Integrações → API** no Runrun.it para obter suas credenciais

## Instalação

```bash
git clone <repo>
cd mcp-server-runrunit
npm install
```

Crie o arquivo `.env` na raiz:

```env
RUNRUNIT_APP_KEY=sua_app_key
RUNRUNIT_USER_TOKEN=seu_user_token
```

## Uso junto ao Claude Code

### 1. Adicione o servidor ao `settings.json`

Abra as configurações do Claude Code (`/settings` ou edite `~/.claude/settings.json`) e adicione:

```json
{
  "mcpServers": {
    "runrunit": {
      "command": "npx",
      "args": ["tsx", "/caminho/absoluto/para/mcp-server-runrunit/src/index.ts"],
      "env": {
        "RUNRUNIT_APP_KEY": "sua_app_key",
        "RUNRUNIT_USER_TOKEN": "seu_user_token"
      }
    }
  }
}
```

> Substitua `/caminho/absoluto/para/mcp-server-runrunit` pelo caminho real no seu sistema.

### 2. Reinicie o Claude Code

Após salvar as configurações, reinicie o Claude Code para que o servidor MCP seja carregado.

### 3. Verifique se o servidor está ativo

No Claude Code, execute `/mcp` para ver os servidores conectados. O servidor `runrunit` deve aparecer na lista com as ferramentas disponíveis.

### 4. Use as ferramentas em conversas

O Claude pode usar as ferramentas automaticamente conforme necessário. Você também pode solicitá-las diretamente:

```
Liste as tasks abertas do projeto X
```
```
Mostre os detalhes da task 1234
```
```
Quais tasks estão atribuídas a mim?
```

### Alternativa: usar o build compilado

Para melhor performance em produção, compile antes:

```bash
npm run build
```

E configure o `settings.json` usando `node` em vez de `tsx`:

```json
{
  "mcpServers": {
    "runrunit": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp-server-runrunit/build/index.js"],
      "env": {
        "RUNRUNIT_APP_KEY": "sua_app_key",
        "RUNRUNIT_USER_TOKEN": "seu_user_token"
      }
    }
  }
}
```

## Desenvolvimento

```bash
npm run dev          # roda direto com tsx (sem build)
npm run build        # compila para ./build
npm test             # roda os testes
npm run test:watch   # testes em modo watch
npm run test:coverage  # cobertura de código
```

### Estrutura do projeto

```
src/
├── index.ts          # Entry point: instancia o server, agrega tools, conecta transport
├── env.ts            # Validação de variáveis de ambiente (t3-env + zod)
├── client.ts         # runrunitFetch() + interfaces TypeScript da API
└── tools/
    ├── tasks.ts      # get_task, get_task_details, list_tasks
    ├── users.ts      # get_me
    ├── projects.ts   # (planejado: list_projects, get_project)
    └── time.ts       # (planejado: create_time_entry, list_time_entries)

tests/
├── client.test.ts
└── tools/
    ├── tasks.test.ts
    └── users.test.ts
```

### Stack

- **TypeScript** (strict mode, ESNext + NodeNext modules)
- **@modelcontextprotocol/sdk** — SDK oficial do MCP
- **t3-env + zod** — validação de variáveis de ambiente
- **Fetch nativo** do Node.js — sem axios ou node-fetch
- **Vitest** — testes unitários
- **tsx** para dev, `tsc` para build
