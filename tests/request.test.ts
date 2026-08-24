import { describe, expect, it } from "vitest";

import { RankedClient, RankedError } from "../src/index.js";

describe("request", () => {
  it("throws a RankedError for an HTTP failure", async () => {
    const errorResponse = {
      status: "error",
      data: {
        params: {
          identifier: ["Invalid user identifier"],
        },
      },
    };
    const client = new RankedClient({
      fetch: async () =>
        new Response(JSON.stringify(errorResponse), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }),
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
    const client = new RankedClient({
      fetch: async () =>
        new Response("not JSON", {
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
      cause: expect.any(SyntaxError),
    });
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
    const client = new RankedClient({
      fetch: async () => {
        throw cause;
      },
    });

    const error = await client
      .request<never>("users/Runner")
      .catch((error) => error);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
    expect(error.cause).toBe(cause);
  });

  it("wraps a RankedError thrown by the fetch implementation", async () => {
    const cause = new RankedError("fetch implementation failed", {
      code: "HTTP_ERROR",
      status: 418,
    });
    const client = new RankedClient({
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
});
