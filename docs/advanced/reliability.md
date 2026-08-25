# Retries, timeouts, and cancellation

Resource methods and `request()` retry temporary connection failures and limit
how long each request attempt can run. The low-level `fetch()` method does not
use these behaviors.

## Retry behavior

By default, the client retries a `NETWORK_ERROR` or `TIMEOUT` up to two times.
The first call plus two retries means a request can make three attempts.

HTTP errors are not retried. This includes rate limits and server error status
codes.

The client waits for a randomized delay before each retry. The first delay is
at most 500 milliseconds. The upper limit doubles for later retries and stops
growing at 5 seconds.

You can change the retry count when you create a client:

```ts
import { RankedClient } from "mcsrranked-sdk";

const noRetries = new RankedClient({ retries: 0 });
const moreRetries = new RankedClient({ retries: 4 });
```

`retries` must be a finite, non-negative integer.

!!! note "Query libraries"

    TanStack Query and SWR can also retry. Disable retries in one or the other,
    so failures don't stack retries.

## Timeouts

Each attempt has a 10 second timeout by default:

```ts
const ranked = new RankedClient({ timeout: 5_000 });
```

The timeout is measured in milliseconds and must be a finite positive number.
When an attempt times out, the client can retry it. If no retries remain, the
request throws `RankedError` with code `TIMEOUT`.

## Cancellation

The low-level `request()` method accepts an `AbortSignal`:

```ts
const controller = new AbortController();

const pending = ranked.request("users/NotAva1able", {
  signal: controller.signal,
});

controller.abort();

await pending;
```

An aborted request throws `RankedError` with code `ABORTED`. Cancellation also
stops a pending retry delay.

!!! warning "Resource-method limitation"

    Resource methods such as `users.get()` do not accept an `AbortSignal` in
    the current beta. Use the low-level `request()` method when cancellation is
    required.

See the [errors reference](../reference/errors.md) for the error properties.
