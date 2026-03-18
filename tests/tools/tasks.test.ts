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

  describe("create_task", () => {
    it("sends POST with correct body", async () => {
      const createdTask: RunrunitTask = {
        id: 99,
        title: "New Task",
        time_worked: 0,
        time_total: 0,
        project_id: 100,
        responsible_id: "mario-neto",
      };
      mockFetch.mockResolvedValueOnce(createdTask);

      const result = await handleTaskTool("create_task", {
        title: "New Task",
        project_id: 100,
        responsible_id: "mario-neto",
      });

      const [endpoint, options] = mockFetch.mock.calls[0]!;
      expect(endpoint).toBe("/tasks");
      expect((options as RequestInit).method).toBe("POST");
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.task.title).toBe("New Task");
      expect(body.task.project_id).toBe(100);
      expect(body.task.responsible_id).toBe("mario-neto");

      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed.id).toBe(99);
    });

    it("sends description in body when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        id: 99, title: "New Task", time_worked: 0, time_total: 0,
      } as RunrunitTask);

      await handleTaskTool("create_task", {
        title: "New Task",
        project_id: 100,
        description: "<p>Lorem ipsum</p>",
      });

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.task.description).toBe("<p>Lorem ipsum</p>");
    });

    it("throws when title is missing", async () => {
      await expect(
        handleTaskTool("create_task", { project_id: 1 }),
      ).rejects.toThrow("Task title is required");
    });

    it("throws when project_id is missing", async () => {
      await expect(
        handleTaskTool("create_task", { title: "Test" }),
      ).rejects.toThrow("project_id is required");
    });
  });

  describe("update_task", () => {
    it("sends PUT to correct endpoint with body", async () => {
      const updatedTask: RunrunitTask = {
        id: 42,
        title: "Updated Title",
        time_worked: 0,
        time_total: 0,
        is_closed: true,
      };
      mockFetch.mockResolvedValueOnce(updatedTask);

      await handleTaskTool("update_task", {
        id: 42,
        title: "Updated Title",
        is_closed: true,
      });

      const [endpoint, options] = mockFetch.mock.calls[0]!;
      expect(endpoint).toBe("/tasks/42");
      expect((options as RequestInit).method).toBe("PUT");
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.task.title).toBe("Updated Title");
      expect(body.task.is_closed).toBe(true);
    });

    it("does not include undefined fields in body", async () => {
      mockFetch.mockResolvedValueOnce({
        id: 1, title: "T", time_worked: 0, time_total: 0,
      } as RunrunitTask);

      await handleTaskTool("update_task", { id: 1, is_urgent: true });

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.task).toEqual({ is_urgent: true });
    });

    it("sends description in body when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        id: 42, title: "T", time_worked: 0, time_total: 0,
      } as RunrunitTask);

      await handleTaskTool("update_task", {
        id: 42,
        description: "<p>Updated description</p>",
      });

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.task.description).toBe("<p>Updated description</p>");
    });

    it("throws when id is missing", async () => {
      await expect(handleTaskTool("update_task", {})).rejects.toThrow(
        "Task ID is required",
      );
    });
  });

  describe("list_tasks with new filters", () => {
    it("includes team_id, sort_by and page in URLSearchParams", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleTaskTool("list_tasks", {
        team_id: 481379,
        sort_by: "created_at",
        page: 2,
      });

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toContain("team_id=481379");
      expect(endpoint).toContain("sort_by=created_at");
      expect(endpoint).toContain("page=2");
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
