# Response validation

The SDK checks resource responses against the data shape expected by the
installed version. This can reveal an upstream API change before it becomes a
hard-to-find bug in your application.

## Default behavior

The default policy is `warn`. When validation fails, the client writes a
warning and still returns the API data.

## Choose a policy

Pass the policy when you create a client:

```ts
const ignored = new RankedClient({ validation: "ignore" });
const warned = new RankedClient({ validation: "warn" });
const strict = new RankedClient({ validation: "error" });
```

| Policy   | Behavior when data does not match               |
| -------- | ----------------------------------------------- |
| `ignore` | Skips validation and returns the data           |
| `warn`   | Reports the issue and returns the data          |
| `error`  | Reports the issue and throws `INVALID_RESPONSE` |

Use `error` when your application cannot work safely with an unexpected
response. Keep `warn` when showing partial data is better than failing the
whole request.

## Collect issues yourself

Use `onIssue` to send validation problems to your logger:

```ts
import { RankedClient, type ValidationIssue } from "mcsrranked-sdk";

function reportValidationIssue(issue: ValidationIssue) {
  console.warn(issue.route, issue.url, issue.problems);
}

const ranked = new RankedClient({
  validation: {
    policy: "warn",
    onIssue: reportValidationIssue,
  },
});
```

Each issue contains the SDK route, request URL, and a list of problems. A
problem has a property path when one can be identified and a validation
message.

If `onIssue` throws, the SDK logs that callback failure and continues its
normal validation policy.

!!! note "Low-level requests"

    `request<T>()` and `fetch()` do not use the resource response schemas. The
    generic passed to `request<T>()` is a compile-time assertion, not runtime
    validation.
