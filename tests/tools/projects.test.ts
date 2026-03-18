import { describe, it, expect, vi, afterEach } from "vitest";
import type { RunrunitProject } from "../../src/client.js";

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

const { simplifyProject, handleProjectTool } = await import(
  "../../src/tools/projects.js"
);
const { runrunitFetch } = await import("../../src/client.js");
const mockFetch = vi.mocked(runrunitFetch);

// ─── simplifyProject ──────────────────────────────────────────────────────────

describe("simplifyProject", () => {
  it("maps all expected fields", () => {
    const project: RunrunitProject = {
      id: 10,
      name: "[TI] WL Factory",
      client_name: "[TI]",
    };
    const result = simplifyProject(project);
    expect(result.id).toBe(10);
    expect(result.name).toBe("[TI] WL Factory");
    expect(result.client_name).toBe("[TI]");
  });

  it("defaults client_name to 'Sem cliente' when absent", () => {
    const project: RunrunitProject = { id: 1, name: "Projeto Interno" };
    expect(simplifyProject(project).client_name).toBe("Sem cliente");
  });
});

// ─── handleProjectTool ────────────────────────────────────────────────────────

describe("handleProjectTool", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("list_projects", () => {
    it("returns list of simplified projects", async () => {
      const projects: RunrunitProject[] = [
        { id: 1, name: "Project A", client_name: "Client A" },
        { id: 2, name: "Project B" },
      ];
      mockFetch.mockResolvedValueOnce(projects);

      const result = await handleProjectTool("list_projects", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      ) as Array<{ id: number; name: string; client_name: string }>;
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.id).toBe(1);
      expect(parsed[1]?.client_name).toBe("Sem cliente");
    });

    it("passes limit and page as query params", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleProjectTool("list_projects", { limit: 20, page: 2 });

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toContain("limit=20");
      expect(endpoint).toContain("page=2");
    });

    it("calls /projects endpoint", async () => {
      mockFetch.mockResolvedValueOnce([]);

      await handleProjectTool("list_projects", {});

      const [endpoint] = mockFetch.mock.calls[0]!;
      expect(endpoint).toMatch(/^\/projects/);
    });

    it("returns empty array when API returns null", async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await handleProjectTool("list_projects", {});
      const parsed = JSON.parse(
        (result.content[0] as { type: string; text: string }).text,
      );
      expect(parsed).toEqual([]);
    });
  });

  describe("unknown tool", () => {
    it("throws for unknown tool name", async () => {
      await expect(
        handleProjectTool("nonexistent_tool", {}),
      ).rejects.toThrow("Unknown project tool: nonexistent_tool");
    });
  });
});
