import { RankedClient } from "./client.js";

export { RankedClient, type RankedClientOptions } from "./client.js";
export type { User } from "./schemas/user.js";

export const mcsrranked = Object.freeze(new RankedClient());
