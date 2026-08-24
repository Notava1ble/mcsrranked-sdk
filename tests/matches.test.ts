import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import { matchDetailFixture, matchFixture } from "./fixtures/matches.js";

describe("matches.list", () => {
  it("requests matches with every documented query option", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: [matchFixture] }),
          { status: 200 },
        );
      },
    });

    const matches = await client.matches.list({
      before: 100,
      after: 20,
      count: 50,
      type: 2,
      tag: "event finals",
      season: 11,
      includeDecay: true,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/matches" +
        "?before=100&after=20&count=50&type=2&tag=event+finals&season=11" +
        "&includedecay=true",
    );
    expect(matches).toEqual([matchFixture]);
  });
});

describe("matches.get", () => {
  it("requests and returns detailed match data", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: matchDetailFixture }),
          { status: 200 },
        );
      },
    });

    const match = await client.matches.get(42);

    expect(requestedUrl).toBe("https://ranked.example/api/matches/42");
    expect(match).toEqual(matchDetailFixture);
    expect(match.completions[0]?.time).toBe(620_000);
    expect(match.timelines[0]?.type).toBe("story.enter_the_nether");
    expect(match.replayExist).toBe(true);
  });

  it("requires detail-only fields", async () => {
    const onIssue = vi.fn();
    const client = new RankedClient({
      validation: { onIssue },
      fetch: async () =>
        new Response(
          JSON.stringify({ status: "success", data: matchFixture }),
          { status: 200 },
        ),
    });

    await client.matches.get(42);

    expect(onIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        route: "matches.get",
        problems: expect.arrayContaining([
          expect.objectContaining({ path: "completions" }),
          expect.objectContaining({ path: "timelines" }),
          expect.objectContaining({ path: "replayExist" }),
        ]),
      }),
    );
  });
});

const invalidResponseCases = [
  ["matches.list", (client: RankedClient) => client.matches.list()],
  ["matches.get", (client: RankedClient) => client.matches.get(42)],
] satisfies ReadonlyArray<
  readonly [string, (client: RankedClient) => Promise<unknown>]
>;

describe("match response schemas", () => {
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
