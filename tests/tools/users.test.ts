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

  describe("unknown tool", () => {
    it("throws for unknown tool name", async () => {
      await expect(handleUserTool("nonexistent_tool", {})).rejects.toThrow(
        "Unknown user tool: nonexistent_tool",
      );
    });
  });
});
