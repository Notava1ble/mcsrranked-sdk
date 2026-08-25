import { opponentProfileFixture, userProfileFixture } from "./users.js";

export const liveOverviewFixture = {
  players: 120,
  liveMatches: [
    {
      currentTime: 640_000,
      players: [userProfileFixture, opponentProfileFixture],
      data: {
        [userProfileFixture.uuid]: {
          liveUrl: "https://twitch.tv/runner",
          timeline: {
            time: 300_000,
            type: "story.enter_the_nether",
          },
        },
        [opponentProfileFixture.uuid]: {
          liveUrl: null,
          timeline: null,
        },
      },
    },
  ],
};
