import { runrunitFetch, type RunrunitTimeEntry } from "../client.js";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const timeToolDefinitions = [
  {
    name: "create_time_entry",
    description: "Register worked hours on a task",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "number",
          description: "ID of the task to register time on",
        },
        amount: {
          type: "number",
          description: "Time worked in seconds (e.g. 3600 = 1 hour)",
        },
        date: {
          type: "string",
          description: "Date of the work in YYYY-MM-DD format",
        },
        description: {
          type: "string",
          description: "Optional description of the work done",
        },
      },
      required: ["task_id", "amount", "date"],
    },
  },
  {
    name: "list_time_entries",
    description: "List time entries with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "number",
          description: "Filter by task ID",
        },
        user_id: {
          type: "string",
          description: "Filter by user ID (slug)",
        },
        start_date: {
          type: "string",
          description: "Filter entries from this date (YYYY-MM-DD)",
        },
        end_date: {
          type: "string",
          description: "Filter entries up to this date (YYYY-MM-DD)",
        },
        limit: {
          type: "number",
          description: "Number of entries to return",
        },
      },
    },
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function simplifyTimeEntry(entry: RunrunitTimeEntry) {
  return {
    id: entry.id,
    task_id: entry.task_id,
    user_id: entry.user_id,
    hours: `${(entry.amount / 3600).toFixed(2)}h`,
    date: entry.date,
    description: entry.description,
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown> | undefined;

export async function handleTimeTool(name: string, args: ToolArgs) {
  switch (name) {
    case "create_time_entry": {
      const task_id = args?.["task_id"] as number | undefined;
      const amount = args?.["amount"] as number | undefined;
      const date = args?.["date"] as string | undefined;
      if (!task_id) throw new Error("task_id is required");
      if (!amount) throw new Error("amount (seconds) is required");
      if (!date) throw new Error("date is required");

      const body: Record<string, unknown> = { task_id, amount, date };
      if (args?.["description"] !== undefined) {
        body["description"] = args["description"];
      }

      const entry = await runrunitFetch("/time_entries", {
        method: "POST",
        body: JSON.stringify({ time_entry: body }),
      }) as RunrunitTimeEntry;

      return {
        content: [
          { type: "text", text: JSON.stringify(simplifyTimeEntry(entry), null, 2) },
        ],
      };
    }

    case "list_time_entries": {
      const params = new URLSearchParams();
      if (args) {
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const entries =
        (await runrunitFetch(`/time_entries?${params.toString()}`)) ?? [];
      const entryList = Array.isArray(entries)
        ? (entries as RunrunitTimeEntry[])
        : [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(entryList.map(simplifyTimeEntry), null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown time tool: ${name}`);
  }
}
