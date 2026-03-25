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
          description: "ID (slug) of user responsible for the task, e.g. 'mario-neto'",
        },
        project_id: {
          type: "number",
          description: "ID of the project the task belongs to",
        },
        team_id: {
          type: "number",
          description: "ID of the team",
        },
        is_closed: {
          type: "boolean",
          description: "Filter by closed status",
        },
        sort_by: {
          type: "string",
          description: "Field to sort by, e.g. 'created_at', 'estimated_delivery_date'",
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
        },
        limit: {
          type: "number",
          description: "Number of tasks to return (max 100)",
        },
      },
    },
  },
  {
    name: "create_task",
    description: "Create a new task in Runrun.it",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Task title",
        },
        project_id: {
          type: "number",
          description: "ID of the project to create the task in",
        },
        responsible_id: {
          type: "string",
          description: "ID (slug) of the user responsible for the task",
        },
        team_id: {
          type: "number",
          description: "ID of the team",
        },
        estimated_delivery_date: {
          type: "string",
          description: "Estimated delivery date in YYYY-MM-DD format",
        },
        current_estimate_seconds: {
          type: "number",
          description: "Time estimate in seconds (e.g. 3600 = 1 hour)",
        },
        is_urgent: {
          type: "boolean",
          description: "Mark the task as urgent",
        },
      },
      required: ["title", "project_id"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing task in Runrun.it",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "ID of the task to update",
        },
        title: {
          type: "string",
          description: "New task title",
        },
        responsible_id: {
          type: "string",
          description: "ID (slug) of the new responsible user",
        },
        team_id: {
          type: "number",
          description: "ID of the team",
        },
        board_stage_id: {
          type: "number",
          description: "ID of the board stage to move the task to",
        },
        estimated_delivery_date: {
          type: "string",
          description: "New estimated delivery date in YYYY-MM-DD format",
        },
        current_estimate_seconds: {
          type: "number",
          description: "New time estimate in seconds",
        },
        is_closed: {
          type: "boolean",
          description: "Close or reopen the task",
        },
        is_urgent: {
          type: "boolean",
          description: "Mark or unmark as urgent",
        },
      },
      required: ["id"],
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
    responsible_id: task.responsible_id,
    project: task.project_name ?? "No project",
    project_id: task.project_id,
    team: task.team_name,
    team_id: task.team_id,
    overdue: task.overdue === "on_schedule" ? "On schedule" : task.overdue,
    created_at: task.created_at,
    estimated_delivery: task.estimated_delivery_date,
    time_worked: `${(task.time_worked / 3600).toFixed(2)}h`,
    time_total: `${(task.time_total / 3600).toFixed(2)}h`,
    estimate: task.current_estimate_seconds !== undefined
      ? `${(task.current_estimate_seconds / 3600).toFixed(2)}h`
      : undefined,
    priority: task.priority,
    is_closed: task.is_closed,
    is_urgent: task.is_urgent,
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

    case "create_task": {
      const title = args?.["title"] as string | undefined;
      const project_id = args?.["project_id"] as number | undefined;
      if (!title) throw new Error("Task title is required");
      if (!project_id) throw new Error("project_id is required");

      const body: Record<string, unknown> = { title, project_id };
      const optionalFields = [
        "responsible_id", "team_id", "estimated_delivery_date",
        "current_estimate_seconds", "is_urgent",
      ] as const;
      for (const field of optionalFields) {
        if (args?.[field] !== undefined) body[field] = args[field];
      }

      const task = await runrunitFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ task: body }),
      }) as RunrunitTask;

      return {
        content: [
          { type: "text", text: JSON.stringify(simplifyTask(task), null, 2) },
        ],
      };
    }

    case "update_task": {
      const id = args?.["id"] as number | undefined;
      if (!id) throw new Error("Task ID is required");

      const body: Record<string, unknown> = {};
      const updatableFields = [
        "title", "responsible_id", "team_id", "board_stage_id",
        "estimated_delivery_date", "current_estimate_seconds",
        "is_closed", "is_urgent",
      ] as const;
      for (const field of updatableFields) {
        if (args?.[field] !== undefined) body[field] = args[field];
      }

      const task = await runrunitFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ task: body }),
      }) as RunrunitTask;

      return {
        content: [
          { type: "text", text: JSON.stringify(simplifyTask(task), null, 2) },
        ],
      };
    }

    default:
      throw new Error(`Unknown task tool: ${name}`);
  }
}
