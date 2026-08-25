# Errors

Resource methods and `request()` use `RankedError` when a handled request
failure prevents them from returning usable data.

```ts
class RankedError extends Error {
  readonly code: RankedErrorCode;
  readonly status?: number;
  readonly details?: unknown;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `"RankedError"` | Error class name |
| `message` | `string` | Human-readable failure summary |
| `code` | `RankedErrorCode` | Machine-readable failure category |
| `status` | `number \| undefined` | HTTP status when `code` is `HTTP_ERROR` |
| `details` | `unknown` | API error data or validation information when available |
| `cause` | `unknown` | Original failure when available |

## Error codes

| Code | Meaning |
| --- | --- |
| `ABORTED` | The caller's `AbortSignal` stopped a low-level request |
| `HTTP_ERROR` | The server returned a non-success HTTP status |
| `INVALID_RESPONSE` | The response body, envelope, or validated data had an unexpected shape |
| `MISSING_PRIVATE_KEY` | An authenticated request started without a configured private key |
| `NETWORK_ERROR` | Fetch failed before the client received a response |
| `TIMEOUT` | A request attempt exceeded the configured timeout |

```ts
try {
  await mcsrranked.users.get("NotARealPlayer");
} catch (error) {
  if (error instanceof RankedError) {
    console.error(error.code, error.status);
  }
}
```

`NETWORK_ERROR` and `TIMEOUT` are retryable. The SDK throws the final error
after it uses the configured retries. HTTP errors are not retried.

## Raw `fetch()` errors

The low-level `fetch()` method keeps native fetch behavior. A network failure
rejects with the original fetch error, and an HTTP error resolves to a raw
`Response` with `ok` set to `false`.

Two errors can occur before the raw request starts. An invalid or absolute
path throws `TypeError`. Setting `includePrivateKey: true` without a configured
key throws `RankedError` with code `MISSING_PRIVATE_KEY`.

!!! warning "Temporary error API"

    We expect the error model to change before 1.0. Error codes and the shape
    of `details` may change as the SDK moves toward a stable release.

For practical handling patterns, read [handle errors](../guides/error-handling.md).
