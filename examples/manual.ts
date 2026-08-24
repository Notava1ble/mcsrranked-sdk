import { mcsrranked, type User } from "../src/index.js";

const identifier = "croissantgamer";

console.log(`Fetching ${identifier}...`);
const user: User = await mcsrranked.users.get(identifier);
console.dir(user, { colors: true, depth: null });
