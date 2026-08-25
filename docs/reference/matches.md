# Matches

Use `matches` to browse matches across all players or inspect one match in
detail.

## `matches.list()`

Gets a filtered list of matches.

```ts
matches.list(options?: MatchesListOptions): Promise<Match[]>
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `after` | `number` | Gets matches after this match ID |
| `before` | `number` | Gets matches before this match ID |
| `count` | `number` | Limits the result to 1 through 100 matches; the API default is 20 |
| `includeDecay` | `boolean` | Set to `true` to include synthetic rank-decay matches; the API omits them by default |
| `season` | `number` | Filters by season; the API default is the current season |
| `tag` | `string` | Filters by a special match tag |
| `type` | `number` | Filters by the API's numeric match type |

```ts
const matches = await mcsrranked.matches.list({
  season: 11,
  count: 25,
  includeDecay: false,
});
```

The method returns `Promise<Match[]>`. It returns an empty array when the API
has no matching entries.

## `matches.get()`

Gets the detailed form of one match.

```ts
matches.get(matchId: number): Promise<MatchDetail>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `matchId` | `number` | Numeric match ID |

```ts
const match = await mcsrranked.matches.get(42);
console.log(match.timelines);
```

`MatchDetail` includes all `Match` fields plus `completions`, `timelines`, and
`replayExist`.

!!! note "Match fields"

    The SDK returns timestamps, durations, match types, and other domain values
    as the API provides them. See the
    [official API documentation](https://docs.mcsrranked.com/) for their
    meaning.

For a task-based example, read [browse and filter matches](../guides/matches.md).
