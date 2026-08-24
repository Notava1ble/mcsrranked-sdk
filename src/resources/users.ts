import { type Match, matchesSchema } from "../schemas/match.js";
import {
  type User,
  type UserLive,
  type UserSeasons,
  userLiveSchema,
  userSchema,
  userSeasonsSchema,
} from "../schemas/user.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export interface UsersGetOptions {
  readonly season?: number;
}

export type MatchSort = "newest" | "oldest" | "fastest" | "slowest";

export interface UsersMatchesOptions {
  readonly after?: number;
  readonly before?: number;
  readonly count?: number;
  readonly excludeDecay?: boolean;
  readonly season?: number;
  readonly sort?: MatchSort;
  readonly type?: number;
}

export class UsersResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async get(identifier: string, options: UsersGetOptions = {}): Promise<User> {
    const path = `users/${encodeURIComponent(identifier)}`;
    const { data, url } = await this.#request(path, {
      query: { season: options.season },
    });

    return this.#validator.validate(userSchema, data, {
      route: "users.get",
      url: url.toString(),
    });
  }

  async matches(
    identifier: string,
    options: UsersMatchesOptions = {},
  ): Promise<Match[]> {
    const path = `users/${encodeURIComponent(identifier)}/matches`;
    const { data, url } = await this.#request(path, {
      query: {
        before: options.before,
        after: options.after,
        sort: options.sort,
        count: options.count,
        type: options.type,
        season: options.season,
        excludedecay: options.excludeDecay,
      },
    });

    return this.#validator.validate(matchesSchema, data, {
      route: "users.matches",
      url: url.toString(),
    });
  }

  async seasons(identifier: string): Promise<UserSeasons> {
    const path = `users/${encodeURIComponent(identifier)}/seasons`;
    const { data, url } = await this.#request(path);

    return this.#validator.validate(userSeasonsSchema, data, {
      route: "users.seasons",
      url: url.toString(),
    });
  }

  async live(identifier: string): Promise<UserLive> {
    const path = `users/${encodeURIComponent(identifier)}/live`;
    const { data, url } = await this.#request(path, {
      includePrivateKey: true,
    });

    return this.#validator.validate(userLiveSchema, data, {
      route: "users.live",
      url: url.toString(),
    });
  }
}
