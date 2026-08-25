import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());

const livePlayerDataSchema = v.object({
  liveUrl: v.nullable(v.string()),
  timeline: v.nullable(
    v.object({
      time: integer,
      type: v.string(),
    }),
  ),
});

export const liveOverviewSchema = v.object({
  players: integer,
  liveMatches: v.array(
    v.object({
      currentTime: integer,
      players: v.array(userProfileSchema),
      data: v.record(v.string(), livePlayerDataSchema),
    }),
  ),
});

export type LiveOverview = v.InferOutput<typeof liveOverviewSchema>;
