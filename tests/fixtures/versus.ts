import { opponentProfileFixture, userProfileFixture } from "./users.js";

export const versusStatsFixture = {
  players: [userProfileFixture, opponentProfileFixture],
  results: {
    ranked: {
      total: 3,
      [userProfileFixture.uuid]: 2,
      [opponentProfileFixture.uuid]: 1,
    },
    casual: {
      total: 1,
      [userProfileFixture.uuid]: 0,
      [opponentProfileFixture.uuid]: 1,
    },
  },
  changes: {
    [userProfileFixture.uuid]: 24,
    [opponentProfileFixture.uuid]: -24,
  },
};
