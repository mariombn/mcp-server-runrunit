import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { env } from "./env.js";
import { taskToolDefinitions, handleTaskTool } from "./tools/tasks.js";
import { userToolDefinitions, handleUserTool } from "./tools/users.js";
import { projectToolDefinitions, handleProjectTool } from "./tools/projects.js";
import { timeToolDefinitions, handleTimeTool } from "./tools/time.js";

const server = new Server(
  { name: "runrunit-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const allToolDefinitions = [
  ...taskToolDefinitions,
  ...userToolDefinitions,
  ...projectToolDefinitions,
  ...timeToolDefinitions,
];

const taskToolNames: Set<string> = new Set(taskToolDefinitions.map((t) => t.name));
const userToolNames: Set<string> = new Set(userToolDefinitions.map((t) => t.name));
const projectToolNames: Set<string> = new Set(projectToolDefinitions.map((t) => (t as { name: string }).name));
const timeToolNames: Set<string> = new Set(timeToolDefinitions.map((t) => (t as { name: string }).name));

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allToolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = args as Record<string, unknown> | undefined;

  try {
    if (taskToolNames.has(name)) return await handleTaskTool(name, toolArgs);
    if (userToolNames.has(name)) return await handleUserTool(name, toolArgs);
    if (projectToolNames.has(name))
      return await handleProjectTool(name, toolArgs);
    if (timeToolNames.has(name)) return await handleTimeTool(name, toolArgs);
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const appKey = env.RUNRUNIT_APP_KEY;
  const userToken = env.RUNRUNIT_USER_TOKEN;
  console.error("Runrun.it MCP Server running on stdio");
  console.error(
    `Config: AppKey: ${appKey.substring(0, 3)}...${appKey.substring(appKey.length - 3)}`,
  );
  console.error(
    `Config: UserToken: ${userToken.substring(0, 3)}...${userToken.substring(userToken.length - 3)}`,
  );
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
