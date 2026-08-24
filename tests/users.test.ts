import { describe, expect, it, vi } from "vitest";

import { RankedClient, RankedError } from "../src/index.js";
import { matchFixture } from "./fixtures/matches.js";
import {
  userFixture,
  userLiveFixture,
  userSeasonsFixture,
} from "./fixtures/users.js";

describe("users.get", () => {
  it("requests a user and returns the response data", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: userFixture }),
          { status: 200 },
        );
      },
    });

    const user = await client.users.get("Runner");

    expect(requestedUrl).toBe("https://ranked.example/api/users/Runner");
    expect(user).toEqual(userFixture);
  });

  it("encodes the identifier and serializes the season option", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: userFixture }),
          { status: 200 },
        );
      },
    });

    await client.users.get("Runner Name/Alt", { season: 3 });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name%2FAlt?season=3",
    );
  });
});

describe("users.matches", () => {
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

    const matches = await client.users.matches("Runner Name/Alt", {
      before: 100,
      after: 20,
      sort: "fastest",
      count: 50,
      type: 2,
      season: 11,
      excludeDecay: true,
    });

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name%2FAlt/matches" +
        "?before=100&after=20&sort=fastest&count=50&type=2&season=11" +
        "&excludedecay=true",
    );
    expect(matches).toEqual([matchFixture]);
  });
});

describe("users.seasons", () => {
  it("requests and returns all season results", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: userSeasonsFixture }),
          { status: 200 },
        );
      },
    });

    const seasons = await client.users.seasons("Runner/Alt");

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%2FAlt/seasons",
    );
    expect(seasons).toEqual(userSeasonsFixture);
  });
});

describe("users.live", () => {
  it("sends the configured private key and returns live match data", async () => {
    let requestedUrl: string | undefined;
    let privateKey: string | null = null;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      privateKey: "secret-key",
      fetch: async (input, init) => {
        requestedUrl = String(input);
        privateKey = new Headers(init?.headers).get("Private-Key");
        return new Response(
          JSON.stringify({ status: "success", data: userLiveFixture }),
          { status: 200 },
        );
      },
    });

    const live = await client.users.live("Runner Name");

    expect(requestedUrl).toBe(
      "https://ranked.example/api/users/Runner%20Name/live",
    );
    expect(privateKey).toBe("secret-key");
    expect(live).toEqual(userLiveFixture);
  });

  it("fails before fetching when the client has no private key", async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const client = new RankedClient({ fetch: fetchImplementation });

    const error = await client.users.live("Runner").catch((cause) => cause);

    expect(error).toBeInstanceOf(RankedError);
    expect(error).toMatchObject({ code: "MISSING_PRIVATE_KEY" });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("does not send the private key to public user endpoints", async () => {
    let privateKey: string | null = null;
    const client = new RankedClient({
      privateKey: "secret-key",
      fetch: async (_input, init) => {
        privateKey = new Headers(init?.headers).get("Private-Key");
        return new Response(
          JSON.stringify({ status: "success", data: [matchFixture] }),
          { status: 200 },
        );
      },
    });

    await client.users.matches("Runner");

    expect(privateKey).toBeNull();
  });
});

const invalidResponseCases = [
  ["users.get", (client: RankedClient) => client.users.get("Runner")],
  ["users.matches", (client: RankedClient) => client.users.matches("Runner")],
  ["users.seasons", (client: RankedClient) => client.users.seasons("Runner")],
  ["users.live", (client: RankedClient) => client.users.live("Runner")],
] satisfies ReadonlyArray<
  readonly [string, (client: RankedClient) => Promise<unknown>]
>;

describe("user response schemas", () => {
  it.each(invalidResponseCases)("validates %s", async (route, request) => {
    const onIssue = vi.fn();
    const client = new RankedClient({
      privateKey: "secret-key",
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
