# Compare two players

Use the `versus` resource to compare two players and find the matches they
played against each other.

## Get the result summary

Pass a nickname, UUID, or linked Discord ID in `discord.{id}` format for each
player:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const stats = await mcsrranked.versus.get("PlayerOne", "PlayerTwo");

console.log(stats.players);
console.log(stats.results.ranked);
console.log(stats.results.casual);
```

The result separates ranked and casual matches. Each group contains `total`
and the result counts returned by the MCSR Ranked API.

To compare one season, pass its number:

```ts
const stats = await mcsrranked.versus.get("PlayerOne", "PlayerTwo", {
  season: 11,
});
```

## Get their matches

Use `versus.matches()` when you need the individual matches:

```ts
const matches = await mcsrranked.versus.matches("PlayerOne", "PlayerTwo", {
  season: 11,
  count: 20,
});

for (const match of matches) {
  console.log(match.id, match.result);
}
```

You can also filter by match type or a range with `after` and `before`.

See the [versus reference](../reference/versus.md) for the complete method
signatures.
