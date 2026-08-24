import { afterEach, describe, expect, it, vi } from "vitest";

import { RankedClient, RankedError } from "../src/index.js";

describe("request", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("throws a RankedError for an HTTP failure", async () => {
    const errorResponse = {
      status: "error",
      data: {
        params: {
          identifier: ["Invalid user identifier"],
        },
      },
    };
    const fetchImplementation = vi.fn(
      async () =>
        new Response(JSON.stringify(errorResponse), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }),
    );
    const client = new RankedClient({
      fetch: fetchImplementation,
    });

    const error = await client
      .request<never>("users/missing-user")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "HTTP_ERROR",
      status: 400,
      details: errorResponse.data,
    });
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it("keeps the HTTP error when its response body is not JSON", async () => {
    const client = new RankedClient({
      fetch: async () =>
        new Response("gateway unavailable", {
          headers: { "Content-Type": "text/plain" },
          status: 502,
        }),
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "HTTP_ERROR",
      status: 502,
      details: "gateway unavailable",
      cause: expect.any(SyntaxError),
    });
  });

  it("preserves a JSON HTTP error that is not a server envelope", async () => {
    const errorResponse = {
      data: "upstream unavailable",
      proxy: "edge",
    };
    const client = new RankedClient({
      fetch: async () =>
        new Response(JSON.stringify(errorResponse), {
          headers: { "Content-Type": "application/json" },
          status: 502,
        }),
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "HTTP_ERROR",
      status: 502,
      details: errorResponse,
    });
  });

  it("throws INVALID_RESPONSE when the response is not JSON", async () => {
    const fetchImplementation = vi.fn(
      async () =>
        new Response("not JSON", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
    );
    const client = new RankedClient({
      fetch: fetchImplementation,
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "INVALID_RESPONSE",
      cause: expect.any(SyntaxError),
    });
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it("throws INVALID_RESPONSE when the response envelope is invalid", async () => {
    const invalidEnvelope = { status: "success" };
    const client = new RankedClient({
      fetch: async () =>
        new Response(JSON.stringify(invalidEnvelope), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "INVALID_RESPONSE",
      details: invalidEnvelope,
    });
  });

  it("throws NETWORK_ERROR when fetch fails", async () => {
    const cause = new TypeError("fetch failed");
    const fetchImplementation = vi.fn(async () => {
      throw cause;
    });
    const client = new RankedClient({
      retries: 0,
      fetch: fetchImplementation,
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
    expect(error.cause).toBe(cause);
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it("wraps a RankedError thrown by the fetch implementation", async () => {
    const cause = new RankedError("fetch implementation failed", {
      code: "HTTP_ERROR",
      status: 418,
    });
    const client = new RankedClient({
      retries: 0,
      fetch: async () => {
        throw cause;
      },
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).not.toBe(cause);
    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
    expect(error.cause).toBe(cause);
  });

  it("throws TIMEOUT when the configured deadline expires", async () => {
    const fetchAbort = new Error("fetch implementation aborted");
    const client = new RankedClient({
      retries: 0,
      timeout: 1,
      fetch: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          const backup = setTimeout(
            () => reject(new Error("timeout signal was not provided")),
            50,
          );
          init?.signal?.addEventListener(
            "abort",
            () => {
              clearTimeout(backup);
              reject(fetchAbort);
            },
            { once: true },
          );
        }),
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "TIMEOUT" });
    expect(error.cause).toBeInstanceOf(DOMException);
    expect(error.cause).not.toBe(fetchAbort);
  });

  it("keeps the timeout active while reading the response body", async () => {
    const bodyAbort = new Error("response body aborted");
    const client = new RankedClient({
      retries: 0,
      timeout: 1,
      fetch: async (_input, init) => {
        const body = new ReadableStream({
          start(controller) {
            const backup = setTimeout(
              () => controller.error(new Error("body timeout was not active")),
              50,
            );
            init?.signal?.addEventListener(
              "abort",
              () => {
                clearTimeout(backup);
                controller.error(bodyAbort);
              },
              { once: true },
            );
          },
        });

        return new Response(body, {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "TIMEOUT" });
    expect(error.cause).toBeInstanceOf(DOMException);
    expect(error.cause).not.toBe(bodyAbort);
  });

  it("throws ABORTED when the caller cancels the request", async () => {
    const controller = new AbortController();
    const cause = new DOMException("caller cancelled", "AbortError");
    const fetchAbort = new Error("fetch implementation aborted");
    const client = new RankedClient({
      timeout: 50,
      fetch: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(fetchAbort), {
            once: true,
          });
        }),
    });

    const request = client.request<never>("users/Runner", {
      signal: controller.signal,
    });
    controller.abort(cause);
    const error = await request.catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    if (!(error instanceof RankedError)) {
      return;
    }
    expect(error).toMatchObject({ code: "ABORTED" });
    expect(error.cause).toBe(cause);
  });

  it("retries twice by default and returns a later success", async () => {
    const firstFailure = new TypeError("connection reset");
    const secondFailure = new TypeError("DNS lookup failed");
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(firstFailure)
      .mockRejectedValueOnce(secondFailure)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ status: "success", data: { ok: true } }),
          { status: 200 },
        ),
      );
    vi.spyOn(Math, "random").mockReturnValue(0);
    const client = new RankedClient({ fetch: fetchImplementation });

    const result = await client.request<{ ok: boolean }>("status");

    expect(result).toEqual({ ok: true });
    expect(fetchImplementation).toHaveBeenCalledTimes(3);
  });

  it("throws the final error after exhausting retries", async () => {
    const causes = [
      new TypeError("first failure"),
      new TypeError("second failure"),
      new TypeError("final failure"),
    ];
    let attempt = 0;
    const fetchImplementation = vi.fn(async () => {
      const cause = causes[attempt];
      attempt += 1;
      throw cause;
    });
    vi.spyOn(Math, "random").mockReturnValue(0);
    const client = new RankedClient({ fetch: fetchImplementation });

    const error = await client.request("status").catch((cause) => cause);

    expect(error).toBeInstanceOf(RankedError);
    if (!(error instanceof RankedError)) {
      return;
    }
    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
    expect(error.cause).toBe(causes[2]);
    expect(fetchImplementation).toHaveBeenCalledTimes(3);
  });

  it("retries with a fresh timeout", async () => {
    let attempt = 0;
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fetchImplementation = vi.fn(async (_input, init) => {
      attempt += 1;

      if (attempt === 1) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new Error("first attempt aborted")),
            { once: true },
          );
        });
      }

      return new Response(
        JSON.stringify({ status: "success", data: "available" }),
        { status: 200 },
      );
    });
    const client = new RankedClient({
      fetch: fetchImplementation,
      retries: 1,
      timeout: 1,
    });

    const result = await client.request<string>("status");

    expect(result).toBe("available");
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it("doubles full-jitter delay bounds up to five seconds", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const attemptTimes: number[] = [];
    const client = new RankedClient({
      retries: 6,
      fetch: async () => {
        attemptTimes.push(Date.now());
        throw new TypeError("offline");
      },
    });

    const request = client.request("status").catch((error) => error);
    await vi.runAllTimersAsync();
    const error = await request;

    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
    expect(attemptTimes).toEqual([0, 250, 750, 1_750, 3_750, 6_250, 8_750]);
  });

  it("aborts during a retry delay without another fetch call", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const controller = new AbortController();
    const reason = new DOMException("caller cancelled", "AbortError");
    const fetchImplementation = vi.fn(async () => {
      throw new TypeError("offline");
    });
    const client = new RankedClient({ fetch: fetchImplementation });

    const request = client
      .request("status", { signal: controller.signal })
      .catch((error) => error);
    await vi.advanceTimersByTimeAsync(0);
    controller.abort(reason);
    const error = await request;

    expect(error).toBeInstanceOf(RankedError);
    if (!(error instanceof RankedError)) {
      return;
    }
    expect(error).toMatchObject({ code: "ABORTED" });
    expect(error.cause).toBe(reason);
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it("does not call fetch when the caller signal is already aborted", async () => {
    const controller = new AbortController();
    const reason = new DOMException("already cancelled", "AbortError");
    controller.abort(reason);
    const fetchImplementation = vi.fn(async () => new Response());
    const client = new RankedClient({ fetch: fetchImplementation });

    const error = await client
      .request("status", { signal: controller.signal })
      .catch((cause) => cause);

    expect(error).toBeInstanceOf(RankedError);
    if (!(error instanceof RankedError)) {
      return;
    }
    expect(error).toMatchObject({ code: "ABORTED" });
    expect(error.cause).toBe(reason);
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid retry count: %s",
    (retries) => {
      expect(() => new RankedClient({ retries })).toThrow(
        "MCSR Ranked retries must be a finite, non-negative integer",
      );
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid timeout: %s",
    (timeout) => {
      expect(() => new RankedClient({ timeout })).toThrow(
        "MCSR Ranked timeout must be a finite, positive number",
      );
    },
  );
});
