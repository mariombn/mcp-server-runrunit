// ─── Tool definitions ─────────────────────────────────────────────────────────

export const timeToolDefinitions = [] as const;

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleTimeTool(
  name: string,
  _args: ToolArgs,
): Promise<never> {
  throw new Error(`Unknown time tool: ${name}`);
}
