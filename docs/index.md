# MCSR Ranked SDK

MCSR Ranked SDK helps you interact with the Ranked API through a typed interface.

=== "npm"

    ```sh
    npm install mcsrranked-sdk
    ```

=== "pnpm"

    ```sh
    pnpm add mcsrranked-sdk
    ```

=== "Bun"

    ```sh
    bun add mcsrranked-sdk
    ```

!!! warning "Beta"

    The SDK covers every public MCSR Ranked API endpoint. It is still in beta,
    so some TypeScript types, error details, and autocomplete suggestions may
    change before 1.0.

## What you get

<div class="grid cards" markdown>

- **Full API coverage**

  Work with users, matches, comparisons, leaderboards, live data, weekly
  races, and service status.

- **Automatic retries**

  Resource methods retry network failures and timeouts up to two times by
  default.

- **Request timeouts**

  Each request attempt stops after 10 seconds by default.

- **Consistent errors**

  Failed requests throw `RankedError` with a code you can inspect.

- **Response checks**

  Resource methods warn when an API response does not match the expected
  data shape.

- **TypeScript support**

  Resource methods include typed options and return values.

</div>

## Make your first request

Import the shared client and ask for a player by nickname, UUID, or linked
Discord ID:

```ts
import { mcsrranked } from "mcsrranked-sdk";

const user = await mcsrranked.users.get("NotAva1able");

console.log(user.nickname);
console.log(user.eloRate);
```

The method returns the player's data directly. You do not need to unwrap the
API response.

!!! info "Using JavaScript?"

    The same example works in JavaScript. Remove any TypeScript-only type
    annotations from later examples.

## Choose what to do next

- [Get a player and their match history](guides/player-history.md)
- [Browse and filter matches](guides/matches.md)
- [Compare two players](guides/compare-players.md)
- [Read the leaderboards](guides/leaderboards.md)
- [Use the SDK with React and Next.js](guides/react-and-nextjs.md)
- [Browse the API reference](reference/client.md)

The SDK requires Node.js 18 or newer when you run it on the server. It also
works in modern browser projects that provide the standard `fetch` APIs.
