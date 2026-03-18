// ─── Tool definitions ─────────────────────────────────────────────────────────

export const projectToolDefinitions = [] as const;

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleProjectTool(
  name: string,
  _args: ToolArgs,
): Promise<never> {
  throw new Error(`Unknown project tool: ${name}`);
}
