# Custom fetch and raw requests

Use the resource methods for normal SDK work. The low-level methods are escape
hatches for an endpoint or request shape the installed SDK does not expose.

## Use `request<T>()`

`request<T>()` sends a GET request through the SDK's timeout, retry, response
envelope, and error handling:

```ts
const data = await mcsrranked.request<MyResponse>("some-endpoint", {
  query: {
    season: 11,
    enabled: true,
  },
});
```

```ts
request<T = unknown>(
  path: string,
  options?: RankedRequestOptions,
): Promise<T>
```

| Option | Type | Description |
| --- | --- | --- |
| `query` | `QueryParameters` | Adds query-string values |
| `headers` | `HeadersInit` | Adds request headers |
| `includePrivateKey` | `boolean` | Adds the configured private key header |
| `signal` | `AbortSignal` | Lets the caller cancel the request |

The method unwraps the API's successful response envelope. It does not run a
resource response schema, so `T` is not checked at runtime.

`path` must be relative to the configured API URL. Absolute URLs and paths
that start with `/` are rejected before the client sends a request.

## Use `fetch()`

`fetch()` builds the API URL and returns the raw `Response`:

```ts
const response = await mcsrranked.fetch("some-endpoint", {
  query: { season: 11 },
});

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

const body = await response.json();
```

```ts
fetch(path: string, options?: RankedFetchOptions): Promise<Response>
```

`RankedFetchOptions` includes the standard `RequestInit` options plus `query`
and `includePrivateKey`. This method does not apply the SDK timeout, retries,
response unwrapping, HTTP error conversion, or response validation. Native
fetch failures keep their original error.

The same relative-path restriction applies to `fetch()`, so an invalid path
throws `TypeError`. If `includePrivateKey` is `true` but the client has no key,
the method throws `RankedError` with code `MISSING_PRIVATE_KEY`.

## Replace the fetch implementation

Pass a compatible implementation to the constructor when your runtime does
not use `globalThis.fetch` or when you need request instrumentation:

```ts
const ranked = new RankedClient({
  fetch: async (input, init) => {
    console.log("MCSR Ranked request", input);
    return fetch(input, init);
  },
});
```

The custom function must follow the same contract as `globalThis.fetch`.

!!! warning "Private keys"

    `includePrivateKey: true` sends the configured key to the resolved URL.
    Use it only with trusted MCSR Ranked endpoints and only from server code.
