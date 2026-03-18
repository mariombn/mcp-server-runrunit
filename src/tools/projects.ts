import { runrunitFetch, type RunrunitProject } from "../client.js";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const projectToolDefinitions = [
  {
    name: "list_projects",
    description: "List available projects in Runrun.it",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of projects to return",
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
      },
    },
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function simplifyProject(project: RunrunitProject) {
  return {
    id: project.id,
    name: project.name,
    client_name: project.client_name ?? "Sem cliente",
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleProjectTool(name: string, args: ToolArgs) {
  switch (name) {
    case "list_projects": {
      const params = new URLSearchParams();
      if (args) {
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const projects =
        (await runrunitFetch(`/projects?${params.toString()}`)) ?? [];
      const projectList = Array.isArray(projects)
        ? (projects as RunrunitProject[])
        : [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projectList.map(simplifyProject), null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown project tool: ${name}`);
  }
}
