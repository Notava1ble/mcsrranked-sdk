import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";

describe("request URLs", () => {
  it("serializes query parameters and omits undefined values", async () => {
    let requestedUrl: string | undefined;
    let requestInit: RequestInit | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input, init) => {
        requestedUrl = String(input);
        requestInit = init;
        return new Response();
      },
    });

    await client.fetch("matches?existing=kept", {
      headers: { Accept: "application/json" },
      query: {
        count: 25,
        distinct: false,
        search: "two words",
        season: undefined,
      },
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/matches?existing=kept&count=25&distinct=false&search=two+words",
    );
    expect(requestInit).toEqual({
      headers: { Accept: "application/json" },
    });
  });

  it.each([
    "https://unrelated.example/users/Runner",
    "//unrelated.example/users/Runner",
    "/users/Runner",
    "data:text/plain,credentials",
  ])("rejects a non-relative URL: %s", (path) => {
    const client = new RankedClient({
      fetch: async () => new Response(),
    });

    expect(() => client.fetch(path)).toThrow(
      "MCSR Ranked request paths must be relative URLs",
    );
  });

  it("applies the same URL restriction to processed requests", async () => {
    const fetchImplementation = vi.fn(async () => new Response());
    const client = new RankedClient({ fetch: fetchImplementation });

    await expect(
      client.request("https://unrelated.example/users/Runner"),
    ).rejects.toThrow("MCSR Ranked request paths must be relative URLs");
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});
