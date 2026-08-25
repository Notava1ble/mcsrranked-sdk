import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import {
  historicalWeeklyRaceFixture,
  weeklyRaceFixture,
} from "./fixtures/weekly-races.js";

describe("weeklyRaces.current", () => {
  it("requests and returns the current weekly race", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: weeklyRaceFixture }),
          { status: 200 },
        );
      },
    });

    const race = await client.weeklyRaces.current();

    expect(requestedUrl).toBe("https://ranked.example/api/weekly-race");
    expect(race).toEqual(weeklyRaceFixture);
  });
});

describe("weeklyRaces.get", () => {
  it("requests and returns a historical weekly race", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({
            status: "success",
            data: historicalWeeklyRaceFixture,
          }),
          { status: 200 },
        );
      },
    });

    const race = await client.weeklyRaces.get(1);

    expect(requestedUrl).toBe("https://ranked.example/api/weekly-race/1");
    expect(race).toEqual(historicalWeeklyRaceFixture);
    expect(race.seed.flags).toBeNull();
    expect(race.leaderboard[0]?.replayExist).toBe(false);
  });
});

const invalidResponseCases = [
  [
    "weeklyRaces.current",
    (client: RankedClient) => client.weeklyRaces.current(),
  ],
  ["weeklyRaces.get", (client: RankedClient) => client.weeklyRaces.get(1)],
] satisfies ReadonlyArray<
  readonly [string, (client: RankedClient) => Promise<unknown>]
>;

describe("weekly race response schemas", () => {
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
