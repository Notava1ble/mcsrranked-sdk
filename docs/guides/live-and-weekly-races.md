# Work with live matches and weekly races

Use the public live overview to find active matches. Weekly races have their
own current race and leaderboard.

## Get the live overview

`live.get()` does not require a private key:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const live = await mcsrranked.live.get();

console.log(`${live.players} players are online`);

for (const match of live.liveMatches) {
  console.log(match.players.map((player) => player.nickname));
}
```

To inspect one player's private live state, configure authentication first.
See [authentication and private live data](../advanced/authentication.md).

## Get the current weekly race

```ts
const race = await mcsrranked.weeklyRaces.current();

console.log(race.seed);

for (const entry of race.leaderboard) {
  console.log(entry.rank, entry.player.nickname, entry.time);
}
```

Use `weeklyRaces.get()` to request an earlier race by ID:

```ts
const earlierRace = await mcsrranked.weeklyRaces.get(12);
```

## Check service status

The status resource reads the public MCSR Ranked status page:

```ts
const status = await mcsrranked.status.heartbeats();

console.log(status.uptimeList);
```

The monitor IDs and status values belong to the status API. See the
[official API documentation](https://docs.mcsrranked.com/) for their current
meaning.

Continue with the [live](../reference/live.md),
[weekly races](../reference/weekly-races.md), or
[status](../reference/status.md) reference.
