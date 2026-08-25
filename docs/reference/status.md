# Status

Use `status` to read public service heartbeats from the MCSR Ranked status
page.

## `status.heartbeats()`

```ts
status.heartbeats(): Promise<StatusHeartbeats>
```

```ts
const status = await mcsrranked.status.heartbeats();

console.log(status.heartbeatList);
console.log(status.uptimeList);
```

`heartbeatList` is keyed by monitor ID. `uptimeList` contains the rolling
24-hour uptime ratios returned by the status page.

The SDK sends this request to the public status service rather than the main
API base URL. A custom `baseUrl` does not change the status URL.

Monitor IDs and heartbeat status numbers can change independently of the SDK.
See the [official API documentation](https://docs.mcsrranked.com/) for their
current meanings.
