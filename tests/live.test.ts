import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import { liveOverviewFixture } from "./fixtures/live.js";

describe("live.get", () => {
  it("requests and returns the live overview", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(
          JSON.stringify({ status: "success", data: liveOverviewFixture }),
          { status: 200 },
        );
      },
    });

    const live = await client.live.get();

    expect(requestedUrl).toBe("https://ranked.example/api/live");
    expect(live).toEqual(liveOverviewFixture);
    expect(live.liveMatches[0]?.data).toEqual(
      liveOverviewFixture.liveMatches[0]?.data,
    );
  });

  it("validates the response", async () => {
    const onIssue = vi.fn();
    const client = new RankedClient({
      validation: { onIssue },
      fetch: async () =>
        new Response(JSON.stringify({ status: "success", data: {} }), {
          status: 200,
        }),
    });

    await client.live.get();

    expect(onIssue).toHaveBeenCalledWith(
      expect.objectContaining({ route: "live.get" }),
    );
  });
});
