import { RankedClient } from "./client.js";

export {
  RankedClient,
  type RankedClientOptions,
} from "./client.js";
export { RankedError, type RankedErrorCode } from "./errors.js";
export type {
  MatchSort,
  UsersGetOptions,
  UsersMatchesOptions,
} from "./resources/users.js";
export type { Match } from "./schemas/match.js";
export type {
  User,
  UserLive,
  UserProfile,
  UserSeasons,
} from "./schemas/user.js";
export type {
  RankedFetchOptions,
  RankedRequestOptions,
} from "./transport.js";
export type {
  QueryParameters,
  QueryParameterValue,
} from "./url.js";
export type {
  ValidationConfiguration,
  ValidationIssue,
  ValidationOptions,
  ValidationPolicy,
  ValidationProblem,
} from "./validation.js";

export const mcsrranked = Object.freeze(new RankedClient());
