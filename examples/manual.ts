import { mcsrranked, type User } from "../src/index.js";

const identifier = "notava1able";

console.log(`Fetching ${identifier}...`);
const user: User = await mcsrranked.users.get(identifier, {
  season: 10,
});
console.dir(user, { colors: true, depth: null });
