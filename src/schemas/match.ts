import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());
const nullableInteger = v.nullable(integer);

const seedSchema = v.object({
  id: v.nullable(v.string()),
  overworld: v.nullable(v.string()),
  nether: v.nullable(v.string()),
  endTowers: v.array(integer),
  variations: v.array(v.string()),
});

export const matchSchema = v.object({
  id: integer,
  type: integer,
  season: integer,
  category: v.nullable(v.string()),
  date: integer,
  players: v.array(userProfileSchema),
  spectators: v.array(userProfileSchema),
  seed: v.nullable(seedSchema),
  result: v.object({
    uuid: v.nullable(v.string()),
    time: integer,
  }),
  forfeited: v.boolean(),
  decayed: v.boolean(),
  rank: v.object({
    season: nullableInteger,
    allTime: nullableInteger,
  }),
  changes: v.array(
    v.object({
      uuid: v.string(),
      change: nullableInteger,
      eloRate: nullableInteger,
    }),
  ),
  tag: v.nullable(v.string()),
  beginner: v.boolean(),
  vod: v.array(
    v.object({
      uuid: v.string(),
      url: v.string(),
      startsAt: integer,
    }),
  ),
});

export const matchesSchema = v.array(matchSchema);

export type Match = v.InferOutput<typeof matchSchema>;
