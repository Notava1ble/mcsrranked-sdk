import { describe, expect, it } from "vitest";

import { RankedClient } from "../src/index.js";

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
});
