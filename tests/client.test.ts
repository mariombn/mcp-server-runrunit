import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock env before importing client
vi.mock("../src/env.js", () => ({
  env: {
    RUNRUNIT_APP_KEY: "test-app-key-abc",
    RUNRUNIT_USER_TOKEN: "test-user-token-xyz",
  },
}));

const { runrunitFetch } = await import("../src/client.js");

describe("runrunitFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends required auth headers", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    } as Response);

    await runrunitFetch("/tasks/1");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, options] = mockFetch.mock.calls[0]!;
    const headers = options?.headers as Record<string, string>;
    expect(headers["App-Key"]).toBe("test-app-key-abc");
    expect(headers["User-Token"]).toBe("test-user-token-xyz");
  });

  it("builds the correct URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await runrunitFetch("/users/me");

    const [url] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("https://runrun.it/api/v1.0/users/me");
  });

  it("adds Content-Type header for POST requests", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await runrunitFetch("/tasks", { method: "POST", body: JSON.stringify({}) });

    const [, options] = vi.mocked(fetch).mock.calls[0]!;
    const headers = options?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("does not add Content-Type header for GET requests", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await runrunitFetch("/tasks");

    const [, options] = vi.mocked(fetch).mock.calls[0]!;
    const headers = options?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 42, title: "Test task" }),
    } as Response);

    const result = await runrunitFetch("/tasks/42");
    expect(result).toEqual({ id: 42, title: "Test task" });
  });

  it("throws on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Task not found",
    } as Response);

    await expect(runrunitFetch("/tasks/999")).rejects.toThrow(
      "Runrun.it API error: 404 Not Found",
    );
  });

  it("throws on 401 unauthorized", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid credentials",
    } as Response);

    await expect(runrunitFetch("/tasks")).rejects.toThrow(
      "Runrun.it API error: 401 Unauthorized",
    );
  });
});
