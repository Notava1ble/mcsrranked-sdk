# Client

The client holds the SDK configuration and groups methods by resource.

## Shared client

Use `mcsrranked` when the defaults fit your application:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const user = await mcsrranked.users.get("NotAva1able");
```

The shared client uses the public MCSR Ranked API, a 10 second timeout for
each attempt, two retries, and warning-level response validation.

## Create a client

Create `RankedClient` when you need to change a default:

```ts
import { RankedClient } from "mcsrranked-sdk";

const ranked = new RankedClient({
  timeout: 5_000,
  retries: 1,
});
```

```ts
new RankedClient(options?: RankedClientOptions)
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | `https://api.mcsrranked.com/` | Replaces the base URL for API requests |
| `fetch` | `typeof globalThis.fetch` | `globalThis.fetch` | Replaces the fetch implementation |
| `privateKey` | `string` | None | Authenticates endpoints that require a private key |
| `retries` | `number` | `2` | Retries network failures and timeouts |
| `timeout` | `number` | `10000` | Limits each request attempt in milliseconds |
| `validation` | `ValidationConfiguration` | `"warn"` | Controls response-shape validation |

`timeout` must be a finite positive number. `retries` must be a finite,
non-negative integer. The constructor throws `TypeError` when either value is
invalid.

`baseUrl` must be an absolute URL. End it with `/` when it contains a path
prefix, such as `https://ranked.example/api/`. Without the final slash, URL
resolution replaces the last path segment.

## Resources

| Property | What it accesses |
| --- | --- |
| [`users`](users.md) | Player profiles, histories, matches, and private live state |
| [`matches`](matches.md) | Global match lists and match details |
| [`versus`](versus.md) | Results and matches between two players |
| [`leaderboards`](leaderboards.md) | Elo, phase, and record leaderboards |
| [`live`](live.md) | Public live overview |
| [`weeklyRaces`](weekly-races.md) | Current and earlier weekly races |
| [`status`](status.md) | Public service heartbeats and uptime |

## Low-level methods

`request<T>()` sends a request through the normal response and retry pipeline
without resource validation. `fetch()` returns a raw `Response` and leaves
response handling to you.

Most applications should use the resource methods. See
[custom fetch and raw requests](../advanced/custom-requests.md) when the API
adds an endpoint that the installed SDK version does not expose yet.

## Common data formats

The SDK keeps the API's numeric formats unchanged:

- Date values are epoch timestamps in seconds.
- Match and race durations are milliseconds.
- Country filters use lowercase ISO 3166-1 alpha-2 codes such as `us`.

Use the [official API documentation](https://docs.mcsrranked.com/) for current
match types, status values, and other MCSR Ranked domain values.
