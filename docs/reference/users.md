# Users

Use `users` to get player profiles, match histories, season results, and
private live state.

## `users.get()`

Gets a player by nickname, UUID, or linked Discord ID.

```ts
users.get(identifier: string, options?: UsersGetOptions): Promise<User>
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `identifier` | `string` | Player nickname, UUID, or linked Discord ID in `discord.{id}` format |
| `options.season` | `number` | Requests one season; the API uses the current season when omitted |

```ts
const user = await mcsrranked.users.get("NotAva1able", { season: 11 });
```

The `User` result includes the profile, achievements, timestamps, statistics,
linked accounts, weekly race results, and season result. `eloRate` and
`eloRank` can be `null`.

## `users.matches()`

Gets matches for one player.

```ts
users.matches(
  identifier: string,
  options?: UsersMatchesOptions,
): Promise<Match[]>
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `identifier` | `string` | Player nickname, UUID, or linked Discord ID in `discord.{id}` format |
| `options.after` | `number` | Gets matches after this match ID |
| `options.before` | `number` | Gets matches before this match ID |
| `options.count` | `number` | Limits the result to 1 through 100 matches; the API default is 20 |
| `options.excludeDecay` | `boolean` | Excludes synthetic rank-decay matches; the API default is `false` |
| `options.season` | `number` | Filters by season; the API default is the current season |
| `options.sort` | `MatchSort` | Sorts by `newest`, `oldest`, `fastest`, or `slowest`; the default is `newest` |
| `options.type` | `number` | Filters by the API's numeric match type |

```ts
const matches = await mcsrranked.users.matches("NotAva1able", {
  count: 10,
  sort: "newest",
  excludeDecay: true,
});
```

The method returns an empty array when the API has no matching entries.

## `users.seasons()`

Gets all recorded season results for a player.

```ts
users.seasons(identifier: string): Promise<UserSeasons>
```

```ts
const history = await mcsrranked.users.seasons("NotAva1able");
console.log(history.seasonResults);
```

`seasonResults` is an object keyed by season number.

## `users.live()`

Gets the player's current private live state.

```ts
users.live(identifier: string): Promise<UserLive>
```

```ts
import { RankedClient } from "mcsrranked-sdk";

const ranked = new RankedClient({
  privateKey: process.env.MCSR_RANKED_PRIVATE_KEY,
});

const live = await ranked.users.live("NotAva1able");
```

This method requires a `RankedClient` configured with `privateKey`. The player
must also host or co-host the private room. The method throws a `RankedError`
with code `MISSING_PRIVATE_KEY` before sending a request when the key is absent.

The result includes the current status, time, players, spectators, timelines,
and completions. See [authentication and private live data](../advanced/authentication.md)
before using this method.

For MCSR Ranked field meanings and numeric values, use the
[official API documentation](https://docs.mcsrranked.com/).
