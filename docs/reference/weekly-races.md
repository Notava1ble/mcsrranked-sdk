# Weekly races

Use `weeklyRaces` to get the current weekly race or request one by ID.

## `weeklyRaces.current()`

Gets the current weekly race.

```ts
weeklyRaces.current(): Promise<WeeklyRace>
```

```ts
const race = await mcsrranked.weeklyRaces.current();
console.log(race.leaderboard);
```

## `weeklyRaces.get()`

Gets a weekly race by its numeric ID.

```ts
weeklyRaces.get(id: number): Promise<WeeklyRace>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `number` | Weekly race ID |

```ts
const race = await mcsrranked.weeklyRaces.get(12);
```

`WeeklyRace` contains the race ID, seed settings, end time, and leaderboard.
Each leaderboard entry includes the rank, player, completion time, and whether
a replay exists.

For a task-based example, read
[work with live matches and weekly races](../guides/live-and-weekly-races.md).
