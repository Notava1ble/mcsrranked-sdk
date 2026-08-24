import { userProfileFixture } from "./users.js";

export const matchFixture = {
  id: 42,
  type: 2,
  season: 11,
  category: "ANY",
  date: 1_700_000_000,
  players: [userProfileFixture],
  spectators: [],
  seed: {
    id: "seed-id",
    overworld: "BURIED_TREASURE",
    nether: "HOUSING",
    endTowers: [79, 82],
    variations: ["bastion:triple:2"],
  },
  result: {
    uuid: userProfileFixture.uuid,
    time: 620_000,
  },
  forfeited: false,
  decayed: false,
  rank: {
    season: 4,
    allTime: null,
  },
  changes: [
    {
      uuid: userProfileFixture.uuid,
      change: 18,
      eloRate: 1_482,
    },
  ],
  tag: null,
  beginner: false,
  vod: [
    {
      uuid: userProfileFixture.uuid,
      url: "https://example.com/vod",
      startsAt: 1_699_999_000,
    },
  ],
  futureField: "preserved",
};
