import { describe, it, expect, vi, afterEach } from "vitest";
import type { RunrunitTimeEntry } from "../../src/client.js";

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

const { simplifyTimeEntry, handleTimeTool } = await import(
  "../../src/tools/time.js"
);
const { runrunitFetch } = await import("../../src/client.js");
const mockFetch = vi.mocked(runrunitFetch);

// ─── simplifyTimeEntry ────────────────────────────────────────────────────────

describe("simplifyTimeEntry", () => {
  const entry: RunrunitTimeEntry = {
    id: 1,
    task_id: 42,
    user_id: "mario-neto",
    amount: 7200,
    date: "2024-03-15",
    description: "Worked on feature X",
    created_at: "2024-03-15T10:00:00Z",
  };

  it("maps all expected fields", () => {
    const result = simplifyTimeEntry(entry);
    expect(result.id).toBe(1);
    expect(result.task_id).toBe(42);
    expect(result.user_id).toBe("mario-neto");
    expect(result.hours).toBe("2.00h");
    expect(result.date).toBe("2024-03-15");
    expect(result.description).toBe("Worked on feature X");
  });

  it("converts amount from seconds to hours string", () => {
    expect(simplifyTimeEntry({ ...entry, amount: 3600 }).hours).toBe("1.00h");
    expect(simplifyTimeEntry({ ...entry, amount: 1800 }).hours).toBe("0.50h");
    expect(simplifyTimeEntry({ ...entry, amount: 5400 }).hours).toBe("1.50h");
  });

  it("handles zero amount", () => {
    expect(simplifyTimeEntry({ ...entry, amount: 0 }).hours).toBe("0.00h");
  });
});

// ─── handleTimeTool ───────────────────────────────────────────────────────────

describe("handleTimeTool", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("create_time_entry", () => {
    it("sends POST with correct body structure", async () => {
      const created: RunrunitTimeEntry = {
        id: 10,
        task_id: 42,
        user_id: "mario-neto",
        amount: 3600,
        date: "2024-03-15",
      };
      mockFetch.mockResolvedValueOnce(created);

      await handleTimeTool("create_time_entry", {
        task_id: 42,
        amount: 3600,
        date: "2024-03-15",
        description: "Done",
      });

      const [endpoint, options] = mockFetch.mock.calls[0]!;
      expect(endpoint).toBe("/time_entries");
      expect((options as RequestInit).method).toBe("POST");
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.time_entry.task_id).toBe(42);
      expect(body.time_entry.amount).toBe(3600);
      expect(body.time_entry.date).toBe("2024-03-15");
      expect(body.time_entry.description).toBe("Done");
    });

    it("returns simplified time entry", async () => {
      mockFetch.mockResolvedValueOnce({
        id: 5, task_id: 1, user_id: "x", amount: 7200, date: "2024-01-01",
      } as RunrunitTimeEntry);

      const result = await handleTimeTool("create_time_entry", {
        task_id: 1, amount: 7200, date: "2024-01-01",
      });
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed.hours).toBe("2.00h");
    });

    it("throws when task_id is missing", async () => {
      await expect(
        handleTimeTool("create_time_entry", { amount: 3600, date: "2024-01-01" }),
      ).rejects.toThrow("task_id is required");
    });

    it("throws when amount is missing", async () => {
      await expect(
        handleTimeTool("create_time_entry", { task_id: 1, date: "2024-01-01" }),
      ).rejects.toThrow("amount (seconds) is required");
    });

    it("throws when date is missing", async () => {
      await expect(
        handleTimeTool("create_time_entry", { task_id: 1, amount: 3600 }),
      ).rejects.toThrow("date is required");
    });
  });

  describe("list_time_entries", () => {
    it("returns list of simplified entries", async () => {
      const entries: RunrunitTimeEntry[] = [
        { id: 1, task_id: 10, user_id: "mario-neto", amount: 3600, date: "2024-03-01" },
        { id: 2, task_id: 10, user_id: "mario-neto", amount: 1800, date: "2024-03-02" },
      ];
      mockFetch.mockResolvedValueOnce(entries);

      const result = await handleTimeTool("list_time_entries", { task_id: 10 });
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      ) as Array<{ id: number; hours: string }>;
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.hours).toBe("1.00h");
      expect(parsed[1]?.hours).toBe("0.50h");
    });

    it("passes all filters as query params", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleTimeTool("list_time_entries", {
        task_id: 42,
        user_id: "mario-neto",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        limit: 50,
      });

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toContain("task_id=42");
      expect(endpoint).toContain("user_id=mario-neto");
      expect(endpoint).toContain("start_date=2024-01-01");
      expect(endpoint).toContain("end_date=2024-01-31");
      expect(endpoint).toContain("limit=50");
    });

    it("returns empty array when API returns null", async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await handleTimeTool("list_time_entries", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed).toEqual([]);
    });
  });

  describe("unknown tool", () => {
    it("throws for unknown tool name", async () => {
      await expect(handleTimeTool("nonexistent_tool", {})).rejects.toThrow(
        "Unknown time tool: nonexistent_tool",
      );
    });
  });
});
