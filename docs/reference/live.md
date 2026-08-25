# Live

Use `live` to get the public overview of active MCSR Ranked matches.

## `live.get()`

```ts
live.get(): Promise<LiveOverview>
```

```ts
const live = await mcsrranked.live.get();

console.log(live.players);
console.log(live.liveMatches);
```

`players` is the number of online players. `liveMatches` contains each active
match's current time, player profiles, stream URLs, and timeline data provided
by the public endpoint.

This method does not require authentication. To request one player's private
live state, use [`users.live()`](users.md#userslive) with an authenticated
client.

For a task-based example, read
[work with live matches and weekly races](../guides/live-and-weekly-races.md).
