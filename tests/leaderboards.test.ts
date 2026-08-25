import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import {
  eloLeaderboardFixture,
  phaseLeaderboardFixture,
  recordLeaderboardFixture,
} from "./fixtures/leaderboards.js";

describe("leaderboards.elo", () => {
  it("requests and returns an Elo leaderboard", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: eloLeaderboardFixture }),
          { status: 200 },
        );
      },
    });

    const leaderboard = await client.leaderboards.elo({
      season: 4,
      country: "us",
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/leaderboard?season=4&country=us",
    );
    expect(leaderboard).toEqual(eloLeaderboardFixture);
    expect(leaderboard.users[0]?.seasonResult.eloRate).toBe(1_626.5);
  });
});

describe("leaderboards.phase", () => {
  it("requests and returns a phase leaderboard", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: phaseLeaderboardFixture }),
          { status: 200 },
        );
      },
    });

    const leaderboard = await client.leaderboards.phase({
      season: 8,
      country: "ca",
      predicted: false,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/phase-leaderboard" +
        "?season=8&country=ca&predicted=false",
    );
    expect(leaderboard).toEqual(phaseLeaderboardFixture);
    expect(leaderboard.phase.number).toBeNull();
    expect(leaderboard.users[0]?.seasonResult.eloRate).toBe(1_500.5);
    expect(leaderboard.users[0]?.seasonResult.eloRank).toBeNull();
  });
});

describe("leaderboards.records", () => {
  it("requests and returns a record leaderboard", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: recordLeaderboardFixture }),
          { status: 200 },
        );
      },
    });

    const leaderboard = await client.leaderboards.records({
      season: 1,
      distinct: true,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/record-leaderboard?season=1&distinct=true",
    );
    expect(leaderboard).toEqual(recordLeaderboardFixture);
    expect(leaderboard[0]?.seed.endTowers).toBeNull();
  });
});

const invalidResponseCases = [
  ["leaderboards.elo", (client: RankedClient) => client.leaderboards.elo()],
  ["leaderboards.phase", (client: RankedClient) => client.leaderboards.phase()],
  [
    "leaderboards.records",
    (client: RankedClient) => client.leaderboards.records(),
  ],
] satisfies ReadonlyArray<
  readonly [string, (client: RankedClient) => Promise<unknown>]
>;

describe("leaderboard response schemas", () => {
  it.each(invalidResponseCases)("validates %s", async (route, request) => {
    const onIssue = vi.fn();
    const client = new RankedClient({
      validation: { onIssue },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: {} }), {
          status: 200,
        }),
    });

    await request(client);

    expect(onIssue).toHaveBeenCalledWith(expect.objectContaining({ route }));
  });
});
