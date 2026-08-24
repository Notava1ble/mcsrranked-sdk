import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RankedClient,
  RankedError,
  type ValidationIssue,
} from "../src/index.js";
import { userFixture } from "./fixtures/users.js";

describe("response validation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports one issue and preserves invalid data in warn mode", async () => {
    const invalidData = { nickname: 42, futureField: "preserved" };
    const reportedIssues: ValidationIssue[] = [];
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      validation: {
        policy: "warn",
        onIssue: (issue) => reportedIssues.push(issue),
      },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    const result = await client.users.get("Runner", { season: 2 });

    expect(result).toEqual(invalidData);
    expect(reportedIssues).toHaveLength(1);
    expect(reportedIssues[0]).toMatchObject({
      route: "users.get",
      url: "https://ranked.example/api/users/Runner?season=2",
      problems: expect.arrayContaining([
        expect.objectContaining({ path: "uuid" }),
        expect.objectContaining({ path: "nickname" }),
      ]),
    });
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it("logs once and returns invalid data with the default policy", async () => {
    const invalidData = { nickname: "Runner" };
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new RankedClient({
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    const result = await client.users.get("Runner");

    expect(result).toEqual(invalidData);
    expect(consoleWarn).toHaveBeenCalledOnce();
  });

  it("reports and throws INVALID_RESPONSE in error mode", async () => {
    const invalidData = { nickname: "Runner" };
    const reportedIssues: ValidationIssue[] = [];
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const client = new RankedClient({
      validation: {
        policy: "error",
        onIssue: (issue) => reportedIssues.push(issue),
      },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    const error = await client.users.get("Runner").catch((cause) => cause);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({
      code: "INVALID_RESPONSE",
      details: reportedIssues[0],
    });
    expect(reportedIssues).toHaveLength(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("keeps the policy when the issue callback throws", async () => {
    const invalidData = { nickname: "Runner" };
    const callbackError = new Error("reporter unavailable");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const client = new RankedClient({
      validation: {
        onIssue: () => {
          throw callbackError;
        },
      },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    const result = await client.users.get("Runner");

    expect(result).toEqual(invalidData);
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "MCSR Ranked validation onIssue callback failed",
      callbackError,
    );
  });

  it("skips validation and reporting with the ignore policy", async () => {
    const invalidData = { nickname: 42 };
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const client = new RankedClient({
      validation: "ignore",
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    const result = await client.users.get("Runner");

    expect(result).toEqual(invalidData);
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("preserves unknown fields in valid data", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new RankedClient({
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: userFixture }), {
          status: 200,
        }),
    });

    const result = await client.users.get("Runner");

    expect(result).toBeDefined();
    expect(result).toHaveProperty("futureField", "preserved");
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});
