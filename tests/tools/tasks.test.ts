import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { RunrunitTask } from "../../src/client.js";

vi.mock("../../src/env.js", () => ({
  env: {
    RUNRUNIT_APP_KEY: "test-app-key",
    RUNRUNIT_USER_TOKEN: "test-user-token",
  },
}));

vi.mock("../../src/client.js", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../src/client.js")>();
  return {
    ...original,
    runrunitFetch: vi.fn(),
  };
});

const { simplifyTask, handleTaskTool } = await import(
  "../../src/tools/tasks.js"
);
const { runrunitFetch } = await import("../../src/client.js");
const mockFetch = vi.mocked(runrunitFetch);

// ─── simplifyTask ─────────────────────────────────────────────────────────────

describe("simplifyTask", () => {
  const fullTask: RunrunitTask = {
    id: 42,
    title: "Fix the bug",
    description: "Detailed description",
    task_status_name: "In Progress",
    board_stage_name: "Doing",
    state: "opened",
    responsible_name: "Mario",
    project_name: "Hero Backend",
    team_name: "Engineering",
    overdue: "on_schedule",
    created_at: "2024-01-01T00:00:00Z",
    estimated_delivery_date: "2024-01-15",
    time_worked: 7200,
    time_total: 14400,
    priority: "high",
    is_closed: false,
  };

  it("maps all expected fields", () => {
    const result = simplifyTask(fullTask);
    expect(result.id).toBe(42);
    expect(result.title).toBe("Fix the bug");
    expect(result.description).toBe("Detailed description");
    expect(result.status).toBe("In Progress");
    expect(result.responsible).toBe("Mario");
    expect(result.project).toBe("Hero Backend");
    expect(result.team).toBe("Engineering");
    expect(result.overdue).toBe("On schedule");
    expect(result.created_at).toBe("2024-01-01T00:00:00Z");
    expect(result.estimated_delivery).toBe("2024-01-15");
    expect(result.time_worked).toBe("2.00h");
    expect(result.time_total).toBe("4.00h");
    expect(result.priority).toBe("high");
    expect(result.is_closed).toBe(false);
    expect(result.link).toBe("https://runrun.it/pt-BR/tasks/42");
  });

  it("uses board_stage_name when task_status_name is absent", () => {
    const task = { ...fullTask, task_status_name: undefined };
    expect(simplifyTask(task).status).toBe("Doing");
  });

  it("uses state when task_status_name and board_stage_name are absent", () => {
    const task = {
      ...fullTask,
      task_status_name: undefined,
      board_stage_name: undefined,
    };
    expect(simplifyTask(task).status).toBe("opened");
  });

  it("defaults description to 'No description' when absent", () => {
    const task = { ...fullTask, description: undefined };
    expect(simplifyTask(task).description).toBe("No description");
  });

  it("defaults project to 'No project' when absent", () => {
    const task = { ...fullTask, project_name: undefined };
    expect(simplifyTask(task).project).toBe("No project");
  });

  it("preserves non-on_schedule overdue value as-is", () => {
    const task = { ...fullTask, overdue: "overdue" };
    expect(simplifyTask(task).overdue).toBe("overdue");
  });

  it("converts time from seconds to hours string", () => {
    const task = { ...fullTask, time_worked: 3600, time_total: 18000 };
    expect(simplifyTask(task).time_worked).toBe("1.00h");
    expect(simplifyTask(task).time_total).toBe("5.00h");
  });

  it("handles zero time values", () => {
    const task = { ...fullTask, time_worked: 0, time_total: 0 };
    expect(simplifyTask(task).time_worked).toBe("0.00h");
    expect(simplifyTask(task).time_total).toBe("0.00h");
  });
});

// ─── handleTaskTool ───────────────────────────────────────────────────────────

describe("handleTaskTool", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("get_task", () => {
    it("returns simplified task merging description", async () => {
      const task: RunrunitTask = {
        id: 1,
        title: "My Task",
        time_worked: 0,
        time_total: 0,
      };
      const desc = { description: "Full description from separate endpoint" };

      mockFetch
        .mockResolvedValueOnce(task)
        .mockResolvedValueOnce(desc);

      const result = await handleTaskTool("get_task", { id: 1 });
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed.id).toBe(1);
      expect(parsed.description).toBe("Full description from separate endpoint");
    });

    it("throws when fetch fails (caller wraps in isError)", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      // handleTaskTool propagates the error — index.ts wraps it in isError: true
      await expect(handleTaskTool("get_task", { id: 999 })).rejects.toThrow(
        "Network error",
      );
    });

    it("throws when id is missing", async () => {
      await expect(handleTaskTool("get_task", {})).rejects.toThrow(
        "Task ID is required",
      );
    });
  });

  describe("get_task_details", () => {
    it("returns raw API response", async () => {
      const rawTask = { id: 5, title: "Raw", custom_field: "value" };
      mockFetch.mockResolvedValueOnce(rawTask);

      const result = await handleTaskTool("get_task_details", { id: 5 });
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed.custom_field).toBe("value");
    });

    it("throws when id is missing", async () => {
      await expect(handleTaskTool("get_task_details", {})).rejects.toThrow(
        "Task ID is required",
      );
    });
  });

  describe("list_tasks", () => {
    it("returns list of simplified tasks", async () => {
      const tasks: RunrunitTask[] = [
        { id: 1, title: "Task A", time_worked: 0, time_total: 0 },
        { id: 2, title: "Task B", time_worked: 3600, time_total: 7200 },
      ];
      mockFetch.mockResolvedValueOnce(tasks);

      const result = await handleTaskTool("list_tasks", { limit: 2 });
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      ) as Array<{ id: number }>;
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.id).toBe(1);
    });

    it("builds correct URLSearchParams from args", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleTaskTool("list_tasks", {
        responsible_id: "123",
        is_closed: false,
        limit: 10,
      });

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toContain("responsible_id=123");
      expect(endpoint).toContain("limit=10");
    });

    it("returns empty array when API returns null", async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await handleTaskTool("list_tasks", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed).toEqual([]);
    });
  });

  describe("unknown tool", () => {
    it("throws for unknown tool name", async () => {
      await expect(handleTaskTool("nonexistent_tool", {})).rejects.toThrow(
        "Unknown task tool: nonexistent_tool",
      );
    });
  });
});
