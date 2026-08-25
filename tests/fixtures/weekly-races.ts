import { userProfileFixture } from "./users.js";

export const weeklyRaceFixture = {
  id: 100,
  seed: {
    overworld: "717088903963296329",
    nether: "717088903963296329",
    theEnd: "717088903963296329",
    rng: "717088903963296329",
    flags: 207,
  },
  endsAt: 1_788_134_400,
  leaderboard: [
    {
      rank: 1,
      player: userProfileFixture,
      time: 279_516,
      replayExist: true,
    },
  ],
};

export const historicalWeeklyRaceFixture = {
  ...weeklyRaceFixture,
  id: 1,
  seed: {
    ...weeklyRaceFixture.seed,
    flags: null,
  },
  leaderboard: [
    {
      ...weeklyRaceFixture.leaderboard[0],
      replayExist: false,
    },
  ],
};
