# Browse and filter matches

Use `matches.list()` to browse matches across all players. Add filters only
when you need them.

## List matches

This example requests the latest ten matches:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const matches = await mcsrranked.matches.list({ count: 10 });

for (const match of matches) {
  const names = match.players.map((player) => player.nickname).join(" vs ");
  console.log(`#${match.id}: ${names}`);
}
```

An empty result is an empty array. You can render it without treating it as a
request failure.

The API returns dates such as `match.date` as epoch seconds. It returns match
durations such as `match.result.time` in milliseconds.

## Add filters

Pass the filters together in one object:

```ts
const matches = await mcsrranked.matches.list({
  season: 11,
  type: 2,
  count: 25,
});
```

`before` and `after` are match ID cursors. `tag` filters by match tag. The
numeric match type values come from the MCSR Ranked API. The API classifies
1 as Casual Mode, 2 as Ranked, 3 as Private and 4 as Event.

## Get one match

Use the match ID to request the detailed form:

```ts
const match = await mcsrranked.matches.get(42);

console.log(match.completions);
console.log(match.timelines);
console.log(match.replayExist);
```

The detailed response includes `completions`, `timelines`, and `replayExist`.
These fields are not guaranteed on matches returned by list methods.

!!! note "Historical data"

    Some fields do not exist on older matches. The TypeScript types mark those
    fields as optional where the API has returned both shapes.

See the [matches reference](../reference/matches.md) for every filter and
return type.
