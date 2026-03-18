import { describe, it, expect, vi, afterEach } from "vitest";

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

const { handleUserTool } = await import("../../src/tools/users.js");
const { runrunitFetch } = await import("../../src/client.js");
const mockFetch = vi.mocked(runrunitFetch);

describe("handleUserTool", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("get_me", () => {
    it("returns current user data", async () => {
      const user = { id: 7, name: "Mario", email: "mario@example.com" };
      mockFetch.mockResolvedValueOnce(user);

      const result = await handleUserTool("get_me", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed.id).toBe(7);
      expect(parsed.name).toBe("Mario");
      expect(parsed.email).toBe("mario@example.com");
    });

    it("calls the /users/me endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ id: 1, name: "Test" });

      await handleUserTool("get_me", {});

      expect(mockFetch).toHaveBeenCalledWith("/users/me");
    });
  });

  describe("list_users", () => {
    it("returns simplified list of users", async () => {
      const users = [
        { id: "mario-neto", name: "Mario Neto", email: "mario@hero.com", position: "Dev", is_manager: true, team_ids: [1], on_vacation: false },
        { id: "joao-silva", name: "Joao Silva", email: "joao@hero.com", position: "QA",  is_manager: false, team_ids: [1], on_vacation: false },
      ];
      mockFetch.mockResolvedValueOnce(users);

      const result = await handleUserTool("list_users", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      ) as Array<{ id: string; name: string }>;
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.id).toBe("mario-neto");
      expect(parsed[0]?.name).toBe("Mario Neto");
    });

    it("passes team_id and limit as query params", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleUserTool("list_users", { team_id: 481379, limit: 10 });

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toContain("team_id=481379");
      expect(endpoint).toContain("limit=10");
    });

    it("returns empty array when API returns null", async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await handleUserTool("list_users", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed).toEqual([]);
    });
  });

  describe("unknown tool", () => {
    it("throws for unknown tool name", async () => {
      await expect(handleUserTool("nonexistent_tool", {})).rejects.toThrow(
        "Unknown user tool: nonexistent_tool",
      );
    });
  });
});
