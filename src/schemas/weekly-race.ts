import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());

export const weeklyRaceSchema = v.object({
  id: integer,
  seed: v.object({
    overworld: v.string(),
    nether: v.string(),
    theEnd: v.string(),
    rng: v.string(),
    flags: v.nullable(integer),
  }),
  endsAt: integer,
  leaderboard: v.array(
    v.object({
      rank: integer,
      player: userProfileSchema,
      time: integer,
      replayExist: v.boolean(),
    }),
  ),
});

export type WeeklyRace = v.InferOutput<typeof weeklyRaceSchema>;
