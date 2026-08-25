# Versus

Use `versus` to compare two players or list the matches they played against
each other.

## `versus.get()`

Gets the ranked and casual result summary.

```ts
versus.get(
  first: string,
  second: string,
  options?: VersusGetOptions,
): Promise<VersusStats>
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `first` | `string` | First player's nickname, UUID, or linked Discord ID in `discord.{id}` format |
| `second` | `string` | Second player's nickname, UUID, or linked Discord ID in `discord.{id}` format |
| `options.season` | `number` | Filters the comparison by season; the API default is the current season |

```ts
const stats = await mcsrranked.versus.get("PlayerOne", "PlayerTwo", {
  season: 11,
});
```

`VersusStats` includes both profiles, ranked and casual result counts, and the
rating changes returned by the API.

## `versus.matches()`

Gets the matches played between the two players.

```ts
versus.matches(
  first: string,
  second: string,
  options?: VersusMatchesOptions,
): Promise<Match[]>
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `after` | `number` | Gets matches after this match ID |
| `before` | `number` | Gets matches before this match ID |
| `count` | `number` | Limits the result to 1 through 100 matches; the API default is 20 |
| `season` | `number` | Filters by season; the API default is the current season |
| `type` | `number` | Filters by the API's numeric match type |

```ts
const matches = await mcsrranked.versus.matches(
  "PlayerOne",
  "PlayerTwo",
  { count: 10 },
);
```

For a task-based example, read [compare two players](../guides/compare-players.md).
