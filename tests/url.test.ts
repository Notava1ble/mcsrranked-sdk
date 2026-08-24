import { describe, expect, it, vi } from "vitest";

import { RankedClient, type RankedRequestOptions } from "../src/index.js";

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
      body: "request body",
      headers: { Accept: "application/json" },
      method: "POST",
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
      body: "request body",
      headers: { Accept: "application/json" },
      method: "POST",
    });
  });

  it("limits processed requests to GET options", async () => {
    let requestInit: RequestInit | undefined;
    const client = new RankedClient({
      fetch: async (_input, init) => {
        requestInit = init;
        return new Response(JSON.stringify({ status: "success", data: "ok" }), {
          status: 200,
        });
      },
    });

    await client.request("status", {
      body: "ignored",
      headers: { Accept: "application/json" },
      method: "POST",
    } as unknown as RankedRequestOptions);

    expect(requestInit).toMatchObject({
      headers: { Accept: "application/json" },
    });
    expect(requestInit?.body).toBeUndefined();
    expect(requestInit?.method).toBeUndefined();
  });

  it("does not retry low-level fetch failures", async () => {
    const cause = new TypeError("offline");
    const fetchImplementation = vi.fn(async () => {
      throw cause;
    });
    const client = new RankedClient({ fetch: fetchImplementation });

    await expect(client.fetch("status")).rejects.toBe(cause);
    expect(fetchImplementation).toHaveBeenCalledOnce();
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
