import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());
const nullableInteger = v.nullable(integer);

const eloLeaderboardUserSchema = v.object({
  ...userProfileSchema.entries,
  seasonResult: v.object({
    eloRate: v.number(),
    eloRank: integer,
    phasePoint: integer,
  }),
});

export const eloLeaderboardSchema = v.object({
  season: v.object({
    startsAt: nullableInteger,
    endsAt: nullableInteger,
    number: integer,
  }),
  users: v.array(eloLeaderboardUserSchema),
});

const phaseLeaderboardUserSchema = v.object({
  ...userProfileSchema.entries,
  predPhasePoint: integer,
  seasonResult: v.object({
    eloRate: v.number(),
    eloRank: nullableInteger,
    phasePoint: integer,
  }),
});

export const phaseLeaderboardSchema = v.object({
  phase: v.object({
    endsAt: nullableInteger,
    number: nullableInteger,
    season: integer,
  }),
  users: v.array(phaseLeaderboardUserSchema),
});

const recordSeedSchema = v.object({
  id: v.nullable(v.string()),
  overworld: v.string(),
  nether: v.nullable(v.string()),
  endTowers: v.nullable(v.array(integer)),
  variations: v.array(v.string()),
});

const recordLeaderboardEntrySchema = v.object({
  rank: integer,
  season: integer,
  date: integer,
  id: integer,
  time: integer,
  user: userProfileSchema,
  seed: recordSeedSchema,
});

export const recordLeaderboardSchema = v.array(recordLeaderboardEntrySchema);

export type EloLeaderboard = v.InferOutput<typeof eloLeaderboardSchema>;
export type PhaseLeaderboard = v.InferOutput<typeof phaseLeaderboardSchema>;
export type RecordLeaderboardEntry = v.InferOutput<
  typeof recordLeaderboardEntrySchema
>;
