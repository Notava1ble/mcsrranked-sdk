import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());
const nullableInteger = v.nullable(integer);

export const matchSeedSchema = v.object({
  id: v.nullable(v.string()),
  overworld: v.nullable(v.string()),
  nether: v.nullable(v.string()),
  endTowers: v.nullable(v.array(integer)),
  variations: v.array(v.string()),
});

export const matchSchema = v.object({
  id: integer,
  type: integer,
  season: integer,
  category: v.nullable(v.string()),
  gameMode: v.optional(v.string()),
  date: integer,
  players: v.array(userProfileSchema),
  spectators: v.array(userProfileSchema),
  seed: v.nullable(matchSeedSchema),
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
  botSource: nullableInteger,
  seedType: v.nullable(v.string()),
  bastionType: v.nullable(v.string()),
  vod: v.optional(
    v.array(
      v.object({
        uuid: v.string(),
        url: v.string(),
        startsAt: integer,
      }),
    ),
  ),
});

export const matchesSchema = v.array(matchSchema);

export const matchDetailSchema = v.object({
  ...matchSchema.entries,
  completions: v.array(
    v.object({
      uuid: v.string(),
      time: integer,
    }),
  ),
  timelines: v.array(
    v.object({
      uuid: v.string(),
      time: integer,
      type: v.string(),
    }),
  ),
  replayExist: v.boolean(),
});

export type Match = v.InferOutput<typeof matchSchema>;
export type MatchDetail = v.InferOutput<typeof matchDetailSchema>;
export type MatchSeed = v.InferOutput<typeof matchSeedSchema>;
