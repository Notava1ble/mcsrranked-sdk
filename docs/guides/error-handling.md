# Handle errors

Resource methods and `request()` use `RankedError` for network failures,
timeouts, HTTP errors, invalid responses, aborted requests, and missing private
keys.

## Catch a request error

Check for `RankedError` before reading SDK-specific fields:

```ts
import { mcsrranked, RankedError } from "mcsrranked-sdk";

try {
  const user = await mcsrranked.users.get("NotARealPlayer");
  console.log(user.nickname);
} catch (error) {
  if (error instanceof RankedError) {
    console.error(error.code, error.status, error.details);
  } else {
    throw error;
  }
}
```

`status` is present for HTTP errors. `details` can contain the error response
or response-validation information.

## Handle the cases you needs

You rarely need a branch for every error code. Start with the cases that
change what you show the user:

```ts
try {
  return await mcsrranked.users.get(nickname);
} catch (error) {
  if (!(error instanceof RankedError)) throw error;

  if (error.code === "TIMEOUT" || error.code === "NETWORK_ERROR") {
    showMessage("MCSR Ranked could not be reached. Try again.");
    return;
  }

  if (error.code === "HTTP_ERROR" && error.status === 400) {
    showMessage("That player was not found.");
    return;
  }

  showMessage("The request failed.");
}
```

Use the status codes documented by the
[MCSR Ranked API](https://docs.mcsrranked.com/) when you turn an HTTP response
into a user-facing message.

!!! warning "Outdated MCSR Ranked Docs"

    The [MCSR Ranked API](https://docs.mcsrranked.com/) documentation shows
    outdated error responses. Invalid request options and missing resources
    currently return HTTP 400. The response's `data` field contains the error
    details, but its shape is not consistent for every error. The SDK preserves
    that value in `error.details`.

!!! warning "Temporary error API"

    `RankedError` is the current error model, but we expect it to change before
    1.0, with the hope of making the inconsistencies mentioned above much easier
    to work with.

See the [errors reference](../reference/errors.md) for every code. For retry
and timeout behavior, read
[retries, timeouts, and cancellation](../advanced/reliability.md).
