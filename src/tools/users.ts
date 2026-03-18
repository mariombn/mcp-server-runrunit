import { runrunitFetch, type RunrunitUser } from "../client.js";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const userToolDefinitions = [
  {
    name: "get_me",
    description: "Get information about the current authenticated user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
] as const;

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleUserTool(name: string, _args: ToolArgs) {
  switch (name) {
    case "get_me": {
      const user = (await runrunitFetch("/users/me")) as RunrunitUser;
      return {
        content: [{ type: "text", text: JSON.stringify(user, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown user tool: ${name}`);
  }
}
