# Leaderboards

Use `leaderboards` to request Elo rankings, phase points, or completion
records.

## `leaderboards.elo()`

Gets the Elo leaderboard.

```ts
leaderboards.elo(options?: EloLeaderboardOptions): Promise<EloLeaderboard>
```

| Option | Type | Description |
| --- | --- | --- |
| `country` | `string` | Filters by a lowercase country code |
| `season` | `number` | Filters by season; the API default is the current season |

```ts
const leaderboard = await mcsrranked.leaderboards.elo({
  season: 11,
  country: "us",
});
```

The result contains `season` metadata and a `users` array. Each user includes
their profile and `seasonResult`.

## `leaderboards.phase()`

Gets the phase-point leaderboard.

```ts
leaderboards.phase(
  options?: PhaseLeaderboardOptions,
): Promise<PhaseLeaderboard>
```

| Option | Type | Description |
| --- | --- | --- |
| `country` | `string` | Filters by a lowercase country code |
| `predicted` | `boolean` | Requests predicted results |
| `season` | `number` | Filters by season; the API default is the current season |

```ts
const leaderboard = await mcsrranked.leaderboards.phase({
  season: 11,
  predicted: true,
});
```

The result contains `phase` metadata and a `users` array.

Predicted results are available only for the current season.

## `leaderboards.records()`

Gets the completion-record leaderboard.

```ts
leaderboards.records(
  options?: RecordLeaderboardOptions,
): Promise<RecordLeaderboardEntry[]>
```

| Option | Type | Description |
| --- | --- | --- |
| `distinct` | `boolean` | Returns only each runner's fastest run when `true` |
| `season` | `number` | Filters by season; omitting it combines all seasons |

```ts
const records = await mcsrranked.leaderboards.records({
  season: 11,
  distinct: true,
});
```

Each entry includes its rank, match ID, time, player, season, date, and seed.
Passing `season: 0` asks the API for the current season.

For examples that display each result, read
[read the leaderboards](../guides/leaderboards.md).
