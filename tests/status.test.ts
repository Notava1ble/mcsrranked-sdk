import { describe, expect, it, vi } from "vitest";

import { RankedClient } from "../src/index.js";
import { statusHeartbeatsFixture } from "./fixtures/status.js";

describe("status.heartbeats", () => {
  it("requests the status host and returns its raw JSON response", async () => {
    let requestedUrl: string | undefined;
    const client = new RankedClient({
      baseUrl: "https://ranked.example/api/",
      fetch: async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify(statusHeartbeatsFixture), {
          status: 200,
        });
      },
    });

    const status = await client.status.heartbeats();

    expect(requestedUrl).toBe(
      "https://status.mcsrranked.com/api/status-page/heartbeat/mcsrranked",
    );
    expect(status).toEqual(statusHeartbeatsFixture);
  });

  it("validates the response", async () => {
    const onIssue = vi.fn();
    const client = new RankedClient({
      validation: { onIssue },
      fetch: async () => new Response(JSON.stringify({}), { status: 200 }),
    });

    await client.status.heartbeats();

    expect(onIssue).toHaveBeenCalledWith(
      expect.objectContaining({ route: "status.heartbeats" }),
    );
  });
});
