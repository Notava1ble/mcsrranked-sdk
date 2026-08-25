# mcsrranked-sdk

A TypeScript SDK for the [MCSR Ranked API](https://docs.mcsrranked.com/).
It provides typed methods for users, matches, leaderboards, weekly races, live
data, and the MCSR Ranked status page.

Read the [full documentation](https://notava1ble.github.io/mcsrranked-sdk/).

## Install

```sh
npm install mcsrranked-sdk
```

## Usage

```ts
import { mcsrranked } from "mcsrranked-sdk";

const user = await mcsrranked.users.get("NotAva1able");
console.log(user.nickname, user.eloRate);
```

## Contributing

Fork the repository, create a branch, and install the dependencies:

```sh
pnpm install
```

Run the checks before opening a pull request:

```sh
pnpm check
```

To preview documentation changes, install the docs dependencies and start the
local server:

```sh
pip install --requirement requirements-docs.txt
pnpm docs:dev
```

Build the static documentation with `pnpm docs:build`.
