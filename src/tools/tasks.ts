import {
  runrunitFetch,
  type RunrunitTask,
  type RunrunitTaskDescription,
} from "../client.js";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const taskToolDefinitions = [
  {
    name: "get_task",
    description:
      "Get core information about a specific task (Title and Description). Use this for general context about what needs to be done.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the task to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_task_details",
    description:
      "Get the FULL, raw API response for a task. WARNING: This is very large. Only use if you specifically need technical fields, custom field values, or deep task metadata not available in get_task.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the task to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_tasks",
    description:
      "List tasks with optional filters. Returns simplified task objects. Use this to find tasks by user, project, or status.",
    inputSchema: {
      type: "object",
      properties: {
        responsible_id: {
          type: "string",
          description: "ID of user responsible for the task",
        },
        project_id: {
          type: "number",
          description: "ID of the project the task belongs to",
        },
        is_closed: {
          type: "boolean",
          description: "Filter by closed status",
        },
        limit: {
          type: "number",
          description: "Number of tasks to return (max 100)",
        },
      },
    },
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function simplifyTask(task: RunrunitTask) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "No description",
    status: task.task_status_name ?? task.board_stage_name ?? task.state,
    responsible: task.responsible_name,
    project: task.project_name ?? "No project",
    team: task.team_name,
    overdue: task.overdue === "on_schedule" ? "On schedule" : task.overdue,
    created_at: task.created_at,
    estimated_delivery: task.estimated_delivery_date,
    time_worked: `${(task.time_worked / 3600).toFixed(2)}h`,
    time_total: `${(task.time_total / 3600).toFixed(2)}h`,
    priority: task.priority,
    is_closed: task.is_closed,
    link: `https://runrun.it/pt-BR/tasks/${task.id}`,
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleTaskTool(name: string, args: ToolArgs) {
  switch (name) {
    case "get_task": {
      const id = args?.["id"] as number | undefined;
      if (!id) throw new Error("Task ID is required");

      const [task, descData] = await Promise.all([
        runrunitFetch(`/tasks/${id}`) as Promise<RunrunitTask>,
        (runrunitFetch(`/tasks/${id}/description`) as Promise<RunrunitTaskDescription>).catch(
          (err: unknown) => {
            console.error(`Failed to fetch description for task ${id}:`, err);
            return { description: "Could not fetch description" };
          },
        ),
      ]);

      if (descData.description) {
        task.description = descData.description;
      }

      return {
        content: [
          { type: "text", text: JSON.stringify(simplifyTask(task), null, 2) },
        ],
      };
    }

    case "get_task_details": {
      const id = args?.["id"] as number | undefined;
      if (!id) throw new Error("Task ID is required");
      const task = await runrunitFetch(`/tasks/${id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
      };
    }

    case "list_tasks": {
      const params = new URLSearchParams();
      if (args) {
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const tasks = (await runrunitFetch(`/tasks?${params.toString()}`)) ?? [];
      const taskList = Array.isArray(tasks) ? (tasks as RunrunitTask[]) : [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(taskList.map(simplifyTask), null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown task tool: ${name}`);
  }
}
