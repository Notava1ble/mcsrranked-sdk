import {
  type Match,
  type MatchDetail,
  matchDetailSchema,
  matchesSchema,
} from "../schemas/match.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export interface MatchesListOptions {
  readonly after?: number;
  readonly before?: number;
  readonly count?: number;
  readonly includeDecay?: boolean;
  readonly season?: number;
  readonly tag?: string;
  readonly type?: number;
}

export class MatchesResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async list(options: MatchesListOptions = {}): Promise<Match[]> {
    const { data, url } = await this.#request("matches", {
      query: {
        before: options.before,
        after: options.after,
        count: options.count,
        type: options.type,
        tag: options.tag,
        season: options.season,
        includedecay: options.includeDecay,
      },
    });

    return this.#validator.validate(matchesSchema, data, {
      route: "matches.list",
      url: url.toString(),
    });
  }

  async get(matchId: number): Promise<MatchDetail> {
    const { data, url } = await this.#request(`matches/${matchId}`);

    return this.#validator.validate(matchDetailSchema, data, {
      route: "matches.get",
      url: url.toString(),
    });
  }
}
