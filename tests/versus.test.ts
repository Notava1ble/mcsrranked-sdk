import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import {
  botMatchFixture,
  matchFixture,
  unfilteredMatchFixture,
} from "./fixtures/matches.js";
import { versusStatsFixture } from "./fixtures/versus.js";

describe("versus.get", () => {
  it("requests and returns versus stats", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: versusStatsFixture }),
          { status: 200 },
        );
      },
    });

    const stats = await client.versus.get("Runner Name", "Opponent/Alt", {
      season: 11,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name/versus/" +
        "Opponent%2FAlt?season=11",
    );
    expect(stats).toEqual(versusStatsFixture);
    expect(stats.results.ranked.total).toBe(3);
  });

  it("requires a total for ranked and casual results", async () => {
    const invalidData = structuredClone(versusStatsFixture);
    Reflect.deleteProperty(invalidData.results.ranked, "total");
    const onIssue = vi.fn();
    const client = new RankedClient({
      validation: { onIssue },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: invalidData }), {
          status: 200,
        }),
    });

    await client.versus.get("Runner", "Opponent");

    expect(onIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        route: "versus.get",
        problems: expect.arrayContaining([
          expect.objectContaining({ path: "results.ranked.total" }),
        ]),
      }),
    );
  });
});

describe("versus.matches", () => {
  it("requests matches with every documented query option", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({
            status: "success",
            data: [matchFixture, botMatchFixture, unfilteredMatchFixture],
          }),
          { status: 200 },
        );
      },
    });

    const matches = await client.versus.matches("Runner Name", "Opponent/Alt", {
      before: 100,
      after: 20,
      count: 50,
      type: 2,
      season: 11,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name/versus/" +
        "Opponent%2FAlt/matches?before=100&after=20&count=50&type=2&season=11",
    );
    expect(matches).toEqual([
      matchFixture,
      botMatchFixture,
      unfilteredMatchFixture,
    ]);
    expect(matches[0]?.gameMode).toBe("default");
    expect(matches[1]?.botSource).toBe(7_565_590);
    expect(matches[2]?.seedType).toBeNull();
    expect(matches[2]?.bastionType).toBeNull();
    expect(matches[2]?.seed?.endTowers).toBeNull();
  });

  it("accepts historical matches without gameMode or vod", async () => {
    const historicalMatch = {
      ...matchFixture,
      gameMode: undefined,
      vod: undefined,
    };
    const client = new RankedClient({
      fetch: async () =>
        new Response(
          JSON.stringify({ status: "success", data: [historicalMatch] }),
          { status: 200 },
        ),
    });

    const matches = await client.versus.matches("Runner", "Opponent");

    expect(matches[0]).not.toHaveProperty("gameMode");
    expect(matches[0]).not.toHaveProperty("vod");
  });
});

const invalidResponseCases = [
  [
    "versus.get",
    (client: RankedClient) => client.versus.get("Runner", "Opponent"),
  ],
  [
    "versus.matches",
    (client: RankedClient) => client.versus.matches("Runner", "Opponent"),
  ],
] satisfies ReadonlyArray<
  readonly [string, (client: RankedClient) => Promise<unknown>]
>;

describe("versus response schemas", () => {
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
