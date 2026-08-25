import { userProfileFixture } from "./users.js";

export const eloLeaderboardFixture = {
  season: {
    startsAt: 1_704_499_200,
    endsAt: 1_713_657_600,
    number: 4,
  },
  users: [
    {
      ...userProfileFixture,
      seasonResult: {
        eloRate: 1_626.5,
        eloRank: 25,
        phasePoint: 8,
      },
    },
  ],
};

export const phaseLeaderboardFixture = {
  phase: {
    endsAt: null,
    number: null,
    season: 8,
  },
  users: [
    {
      ...userProfileFixture,
      predPhasePoint: 42,
      seasonResult: {
        eloRate: 1_500.5,
        eloRank: null,
        phasePoint: 42,
      },
    },
  ],
};

export const recordLeaderboardFixture = [
  {
    rank: 1,
    season: 1,
    date: 1_685_157_577,
    id: 284_288,
    time: 433_388,
    user: userProfileFixture,
    seed: {
      id: null,
      overworld: "RUINED_PORTAL",
      nether: null,
      endTowers: null,
      variations: [],
    },
  },
];
