import { RankedClient } from "./client.js";

export {
  RankedClient,
  type RankedClientOptions,
} from "./client.js";
export { RankedError, type RankedErrorCode } from "./errors.js";
export type { MatchesListOptions } from "./resources/matches.js";
export type {
  MatchSort,
  UsersGetOptions,
  UsersMatchesOptions,
} from "./resources/users.js";
export type {
  VersusGetOptions,
  VersusMatchesOptions,
} from "./resources/versus.js";
export type { Match, MatchDetail } from "./schemas/match.js";
export type {
  User,
  UserLive,
  UserProfile,
  UserSeasons,
} from "./schemas/user.js";
export type { VersusStats } from "./schemas/versus.js";
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
