import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RankedClient,
  RankedError,
  type ValidationIssue,
} from "../src/index.js";

const userResponse = {
  status: "success",
  data: {
    uuid: "00000000000000000000000000000001",
    nickname: "Runner",
    roleType: 1,
    eloRate: 1_500,
    eloRank: 25,
    achievements: {
      display: [],
      total: [
        {
          id: "wins",
          date: 1_700_000_000,
          data: [],
          level: 2,
          value: 42,
          goal: 50,
        },
      ],
    },
    timestamp: {
      firstOnline: 1_600_000_000,
      lastOnline: 1_700_000_000,
      lastRanked: 1_699_999_000,
      nextDecay: null,
    },
    statistics: {
      season: {
        bestTime: { ranked: 620_000, casual: null },
        highestWinStreak: { ranked: 4, casual: 0 },
        currentWinStreak: { ranked: 1, casual: 0 },
        playedMatches: { ranked: 80, casual: 0 },
        playtime: { ranked: 60_000_000, casual: 0 },
        completionTime: { ranked: 30_000_000, casual: 0 },
        forfeits: { ranked: 3, casual: 0 },
        completions: { ranked: 45, casual: 0 },
        wins: { ranked: 50, casual: 0 },
        loses: { ranked: 27, casual: 0 },
      },
      total: {
        bestTime: { ranked: 600_000, casual: null },
        highestWinStreak: { ranked: 6, casual: 0 },
        currentWinStreak: { ranked: 1, casual: 0 },
        playedMatches: { ranked: 120, casual: 0 },
        playtime: { ranked: 90_000_000, casual: 0 },
        completionTime: { ranked: 45_000_000, casual: 0 },
        forfeits: { ranked: 5, casual: 0 },
        completions: { ranked: 70, casual: 0 },
        wins: { ranked: 75, casual: 0 },
        loses: { ranked: 40, casual: 0 },
      },
    },
    connections: {
      discord: { id: "100000000000000001", name: "runner" },
      twitch: { id: "runner", name: "Runner" },
    },
    weeklyRaces: [{ id: 10, time: 630_000, rank: 12 }],
    country: "us",
    seasonResult: {
      last: {
        eloRate: 1_500,
        eloRank: 25,
        phasePoint: 8,
        percentile: null,
      },
      highest: 1_550,
      lowest: 1_350,
      phases: [{ phase: 1, eloRate: 1_500, eloRank: 25, point: 8 }],
    },
    futureField: "preserved",
  },
};

describe("users.get", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests a user and returns the response data", async () => {
    const requestedUrls: string[] = [];
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrls.push(String(input));
        return new Response(JSON.stringify(userResponse), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });

    const user = await client.users.get("Runner");

    expect({ requestedUrls, user }).toEqual({
      requestedUrls: ["https://ranked.example/api/users/Runner"],
      user: userResponse.data,
    });
  });

  it("encodes the identifier and serializes the season option", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify(userResponse), { status: 200 });
      },
    });

    await client.users.get("Runner Name/Alt", { season: 3 });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name%2FAlt?season=3",
    );
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

  it("preserves the policy when the issue callback throws", async () => {
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
});
