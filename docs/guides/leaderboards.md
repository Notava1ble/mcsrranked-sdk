# Read the leaderboards

The SDK has separate methods for Elo, phase points, and completion records.

## Elo leaderboard

Use `leaderboards.elo()` for the ranked Elo table:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const leaderboard = await mcsrranked.leaderboards.elo({ season: 11 });

for (const player of leaderboard.users.slice(0, 10)) {
  console.log(player.nickname, player.seasonResult.eloRate);
}
```

Add `country` to limit the result to a lowercase country code:

```ts
const usLeaderboard = await mcsrranked.leaderboards.elo({
  season: 11,
  country: "us",
});
```

## Phase leaderboard

Use `leaderboards.phase()` for phase points:

```ts
const phase = await mcsrranked.leaderboards.phase({
  season: 11,
  predicted: true,
});

console.log(phase.phase);
console.log(phase.users[0]);
```

`predicted` asks the API for predicted phase results.

## Record leaderboard

Use `leaderboards.records()` for completion records:

```ts
const records = await mcsrranked.leaderboards.records({
  season: 11,
  distinct: true,
});

for (const record of records.slice(0, 10)) {
  console.log(record.rank, record.user.nickname, record.time);
}
```

See the [leaderboards reference](../reference/leaderboards.md) for all options
and return types.
