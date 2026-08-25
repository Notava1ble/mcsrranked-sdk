# Get a player and their match history

Use the `users` resource when you know a player's nickname, UUID, or linked
Discord ID.

## Get a player

Pass the identifier to `users.get()`:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const user = await mcsrranked.users.get("NotAva1able");

console.log(`${user.nickname}: ${user.eloRate ?? "Unrated"} Elo`);
```

`eloRate` and `eloRank` can be `null` when the player has not finished their
placement matches. Check for `null` before displaying either value.

To request a specific season, pass its number as an option:

```ts
const user = await mcsrranked.users.get("NotAva1able", {
  season: 11,
});
```

For a linked Discord account, use `discord.{id}` as the identifier:

```ts
const user = await mcsrranked.users.get("discord.338669823167037440");
```

## Get recent matches

`users.matches()` returns an array of matches for the same identifier:

```ts
const matches = await mcsrranked.users.matches("NotAva1able", {
  count: 10,
  sort: "newest",
  excludeDecay: true,
});

for (const match of matches) {
  console.log(match.id, match.result.time);
}
```

The available sort orders are `newest`, `oldest`, `fastest`, and `slowest`.
You can also filter by season, match type, or a range with `after` and
`before`.

## Get results from every season

Use `users.seasons()` when you need a player's season-by-season results:

```ts
const history = await mcsrranked.users.seasons("NotAva1able");

for (const [season, result] of Object.entries(history.seasonResults)) {
  console.log(season, result.highest);
}
```

For every option and return type, see the [users reference](../reference/users.md).
To inspect one match in more detail, continue with
[browse and filter matches](matches.md).
