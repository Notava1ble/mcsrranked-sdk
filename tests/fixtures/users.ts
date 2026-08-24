export const userProfileFixture = {
  uuid: "00000000000000000000000000000001",
  nickname: "Runner",
  roleType: 1,
  eloRate: 1_500,
  eloRank: 25,
  country: "us",
};

export const seasonResultFixture = {
  last: {
    eloRate: 1_500,
    eloRank: 25,
    phasePoint: 8,
    percentile: 1.2,
  },
  highest: 1_550,
  lowest: 1_350,
  phases: [
    {
      phase: 1,
      eloRate: 1_500,
      eloRank: 25,
      point: 8,
    },
  ],
};

export const userFixture = {
  ...userProfileFixture,
  achievements: {
    display: [],
    total: [
      {
        id: "wins",
        date: 1_700_000_000,
        data: [],
        level: 2,
        value: 42,
        goal: 50,
      },
    ],
  },
  timestamp: {
    firstOnline: 1_600_000_000,
    lastOnline: 1_700_000_000,
    lastRanked: 1_699_999_000,
    nextDecay: null,
  },
  statistics: {
    season: {
      bestTime: { ranked: 620_000, casual: null },
      highestWinStreak: { ranked: 4, casual: 0 },
      currentWinStreak: { ranked: 1, casual: 0 },
      playedMatches: { ranked: 80, casual: 0 },
      playtime: { ranked: 60_000_000, casual: 0 },
      completionTime: { ranked: 30_000_000, casual: 0 },
      forfeits: { ranked: 3, casual: 0 },
      completions: { ranked: 45, casual: 0 },
      wins: { ranked: 50, casual: 0 },
      loses: { ranked: 27, casual: 0 },
    },
    total: {
      bestTime: { ranked: 600_000, casual: null },
      highestWinStreak: { ranked: 6, casual: 0 },
      currentWinStreak: { ranked: 1, casual: 0 },
      playedMatches: { ranked: 120, casual: 0 },
      playtime: { ranked: 90_000_000, casual: 0 },
      completionTime: { ranked: 45_000_000, casual: 0 },
      forfeits: { ranked: 5, casual: 0 },
      completions: { ranked: 70, casual: 0 },
      wins: { ranked: 75, casual: 0 },
      loses: { ranked: 40, casual: 0 },
    },
  },
  connections: {
    discord: { id: "100000000000000001", name: "runner" },
    twitch: { id: "runner", name: "Runner" },
  },
  weeklyRaces: [{ id: 10, time: 630_000, rank: 12 }],
  seasonResult: seasonResultFixture,
  futureField: "preserved",
};

export const userSeasonsFixture = {
  ...userProfileFixture,
  seasonResults: {
    "10": seasonResultFixture,
    "11": {
      ...seasonResultFixture,
      last: {
        eloRate: null,
        eloRank: null,
        phasePoint: 0,
        percentile: null,
      },
      highest: null,
      lowest: null,
    },
  },
};

export const userLiveFixture = {
  lastId: 41,
  type: 3,
  status: "running",
  time: 120_000,
  players: [userProfileFixture],
  spectators: [],
  timelines: [
    {
      uuid: userProfileFixture.uuid,
      time: 60_000,
      type: "enter_nether",
    },
  ],
  completions: [],
};
