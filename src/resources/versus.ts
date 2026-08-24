import { type Match, matchesSchema } from "../schemas/match.js";
import { type VersusStats, versusStatsSchema } from "../schemas/versus.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export interface VersusGetOptions {
  readonly season?: number;
}

export interface VersusMatchesOptions {
  readonly after?: number;
  readonly before?: number;
  readonly count?: number;
  readonly season?: number;
  readonly type?: number;
}

export class VersusResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async get(
    first: string,
    second: string,
    options: VersusGetOptions = {},
  ): Promise<VersusStats> {
    const path = this.#path(first, second);
    const { data, url } = await this.#request(path, {
      query: { season: options.season },
    });

    return this.#validator.validate(versusStatsSchema, data, {
      route: "versus.get",
      url: url.toString(),
    });
  }

  async matches(
    first: string,
    second: string,
    options: VersusMatchesOptions = {},
  ): Promise<Match[]> {
    const path = `${this.#path(first, second)}/matches`;
    const { data, url } = await this.#request(path, {
      query: {
        before: options.before,
        after: options.after,
        count: options.count,
        type: options.type,
        season: options.season,
      },
    });

    return this.#validator.validate(matchesSchema, data, {
      route: "versus.matches",
      url: url.toString(),
    });
  }

  #path(first: string, second: string): string {
    return `users/${encodeURIComponent(first)}/versus/${encodeURIComponent(second)}`;
  }
}
