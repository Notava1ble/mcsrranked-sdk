import { opponentProfileFixture, userProfileFixture } from "./users.js";

export const matchFixture = {
  id: 42,
  type: 2,
  season: 11,
  category: "ANY",
  gameMode: "default",
  date: 1_700_000_000,
  players: [userProfileFixture, opponentProfileFixture],
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
    {
      uuid: opponentProfileFixture.uuid,
      change: -18,
      eloRate: 1_468,
    },
  ],
  tag: null,
  beginner: false,
  botSource: null,
  seedType: "BURIED_TREASURE",
  bastionType: "HOUSING",
  vod: [
    {
      uuid: userProfileFixture.uuid,
      url: "https://example.com/vod",
      startsAt: 1_699_999_000,
    },
  ],
  futureField: "preserved",
};

export const botMatchFixture = {
  ...matchFixture,
  id: 43,
  botSource: 7_565_590,
};

export const unfilteredMatchFixture = {
  ...matchFixture,
  id: 44,
  seed: {
    id: null,
    overworld: null,
    nether: null,
    endTowers: null,
    variations: [],
  },
  seedType: null,
  bastionType: null,
};

export const matchDetailFixture = {
  ...matchFixture,
  completions: [
    {
      uuid: userProfileFixture.uuid,
      time: 620_000,
    },
  ],
  timelines: [
    {
      uuid: userProfileFixture.uuid,
      time: 300_000,
      type: "story.enter_the_nether",
    },
  ],
  replayExist: true,
};
