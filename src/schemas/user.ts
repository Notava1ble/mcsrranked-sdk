import * as v from "valibot";

const integer = v.pipe(v.number(), v.integer());
const nullableInteger = v.nullable(integer);

const achievementSchema = v.object({
  id: v.string(),
  date: integer,
  data: v.array(v.string()),
  level: integer,
  value: nullableInteger,
  goal: nullableInteger,
});

const statisticSchema = v.object({
  ranked: nullableInteger,
  casual: nullableInteger,
});

const statisticsSchema = v.object({
  bestTime: statisticSchema,
  highestWinStreak: statisticSchema,
  currentWinStreak: statisticSchema,
  playedMatches: statisticSchema,
  playtime: statisticSchema,
  completionTime: statisticSchema,
  forfeits: statisticSchema,
  completions: statisticSchema,
  wins: statisticSchema,
  loses: statisticSchema,
});

const connectionSchema = v.object({
  id: v.string(),
  name: v.string(),
});

export const userProfileSchema = v.object({
  uuid: v.string(),
  nickname: v.string(),
  roleType: integer,
  eloRate: nullableInteger,
  eloRank: nullableInteger,
  country: v.nullable(v.string()),
});

export const seasonResultSchema = v.object({
  last: v.nullable(
    v.object({
      eloRate: nullableInteger,
      eloRank: nullableInteger,
      phasePoint: nullableInteger,
      percentile: v.nullable(v.number()),
    }),
  ),
  highest: nullableInteger,
  lowest: nullableInteger,
  phases: v.array(
    v.object({
      phase: integer,
      eloRate: nullableInteger,
      eloRank: nullableInteger,
      point: integer,
    }),
  ),
});

export const userSchema = v.object({
  ...userProfileSchema.entries,
  achievements: v.object({
    display: v.array(achievementSchema),
    total: v.array(achievementSchema),
  }),
  timestamp: v.object({
    firstOnline: integer,
    lastOnline: integer,
    lastRanked: v.nullable(integer),
    nextDecay: v.nullable(integer),
  }),
  statistics: v.object({
    season: statisticsSchema,
    total: statisticsSchema,
  }),
  connections: v.object({
    discord: v.optional(connectionSchema),
    youtube: v.optional(connectionSchema),
    twitch: v.optional(connectionSchema),
  }),
  weeklyRaces: v.array(
    v.object({
      id: integer,
      time: integer,
      rank: integer,
    }),
  ),
  seasonResult: seasonResultSchema,
});

export const userSeasonsSchema = v.object({
  ...userProfileSchema.entries,
  seasonResults: v.record(v.string(), seasonResultSchema),
});

export const userLiveSchema = v.object({
  lastId: nullableInteger,
  type: integer,
  status: v.picklist([
    "idle",
    "counting",
    "generate",
    "ready",
    "running",
    "done",
  ]),
  time: integer,
  players: v.array(userProfileSchema),
  spectators: v.array(userProfileSchema),
  timelines: v.array(
    v.object({
      uuid: v.string(),
      time: integer,
      type: v.string(),
    }),
  ),
  completions: v.array(
    v.object({
      uuid: v.string(),
      time: integer,
    }),
  ),
});

export type User = v.InferOutput<typeof userSchema>;
export type UserLive = v.InferOutput<typeof userLiveSchema>;
export type UserProfile = v.InferOutput<typeof userProfileSchema>;
export type UserSeasons = v.InferOutput<typeof userSeasonsSchema>;
