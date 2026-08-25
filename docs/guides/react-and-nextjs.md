# Use the SDK with React and Next.js

The SDK returns promises and uses the standard `fetch` APIs. React does not
need a special adapter, but where you start the request still matters.

### You will learn

- Where to load data in a framework application
- When a query library is useful
- When an event handler or Effect is the right place for a request
- How to avoid exposing a private key

## Load data in a Next.js Server Component

Server Components can await the SDK directly:

```tsx
import { mcsrranked } from "mcsrranked-sdk";

export default async function PlayerPage() {
  const user = await mcsrranked.users.get("NotAva1able");

  return (
    <p>
      {user.nickname}: {user.eloRate ?? "Unrated"} Elo
    </p>
  );
}
```

This keeps the request out of the browser and includes the result in the
server-rendered page.

!!! warning "Server rendering and rate limits"

    An uncached SDK request blocks this Server Component until the MCSR Ranked
    API responds. This can increase the route's initial response time, unless handled properly.

    Also, the API currently has a limit of 500 requests per 10 minutes.
    Server-rendered requests mean that this limit can exhaust faster. Avoid
    making the same API call on every render and reuse cached results when
    possible

## Load data with TanStack Query

Use a query library when a client component needs loading state, caching, or
refetching:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { mcsrranked } from "mcsrranked-sdk";

export function Player({ nickname }: { nickname: string }) {
  const query = useQuery({
    queryKey: ["mcsrranked", "user", nickname],
    queryFn: () => mcsrranked.users.get(nickname),
    retry: false,
  });

  if (query.isPending) return <p>Loading...</p>;
  if (query.isError) return <p>Could not load this player.</p>;

  return (
    <p>
      {query.data.nickname}: {query.data.eloRate ?? "Unrated"} Elo
    </p>
  );
}
```

The example disables TanStack Query retries because the SDK already retries
network failures and timeouts. The alternative choice can be made by creating a
`RankedClient` with `retries: 0` and letting the query library own all retry
behavior.

!!! warning "Avoid stacked retries"

    TanStack Query and SWR can retry failed queries. If both the query library
    and the SDK retry, one failed query can cause more requests than you
    expect. Choose one retry option over the other, never both.

## Start a request from an event

If a click starts the request, keep it in the click handler:

```tsx
"use client";

import { mcsrranked } from "mcsrranked-sdk";

export function LatestMatchesButton() {
  async function showLatestMatches() {
    const matches = await mcsrranked.users.matches("NotAva1able", {
      count: 5,
    });

    console.log(matches);
  }

  return <button onClick={showLatestMatches}>Load matches</button>;
}
```

You do not need an Effect for code that runs because of a specific user
action.

## Use an Effect in a small client component

An Effect is reasonable when the component must stay synchronized
with a prop and you are not using a data library:

```tsx
"use client";

import { useEffect, useState } from "react";
import { mcsrranked, type User } from "mcsrranked-sdk";

export function Player({ nickname }: { nickname: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let ignore = false;
    setUser(null);
    setError(null);

    mcsrranked.users.get(nickname).then(
      (result) => {
        if (!ignore) setUser(result);
      },
      (requestError) => {
        if (!ignore) setError(requestError);
      },
    );

    return () => {
      ignore = true;
    };
  }, [nickname]);

  if (error !== null) return <p>Could not load this player.</p>;
  return user === null ? <p>Loading...</p> : <p>{user.nickname}</p>;
}
```

The cleanup prevents an older response from replacing data for a newer
nickname. If a component also needs caching or refetching, a dedicated query
library is usually less work.

!!! danger "Keep private keys on the server"

    Do not create a client with `privateKey` in a Client Component. The browser
    will expose the key to anyone using the page. Make authenticated calls
    in a Server Component, route handler, or another server-only module.

React explains the tradeoffs of Effect-based fetching in
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
Next.js covers both environments in
[Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data).
