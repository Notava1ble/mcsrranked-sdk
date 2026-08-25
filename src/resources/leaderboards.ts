import {
  type EloLeaderboard,
  eloLeaderboardSchema,
  type PhaseLeaderboard,
  phaseLeaderboardSchema,
  type RecordLeaderboardEntry,
  recordLeaderboardSchema,
} from "../schemas/leaderboard.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export interface EloLeaderboardOptions {
  readonly country?: string;
  readonly season?: number;
}

export interface PhaseLeaderboardOptions {
  readonly country?: string;
  readonly predicted?: boolean;
  readonly season?: number;
}

export interface RecordLeaderboardOptions {
  readonly distinct?: boolean;
  readonly season?: number;
}

export class LeaderboardsResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async elo(options: EloLeaderboardOptions = {}): Promise<EloLeaderboard> {
    const { data, url } = await this.#request("leaderboard", {
      query: {
        season: options.season,
        country: options.country,
      },
    });

    return this.#validator.validate(eloLeaderboardSchema, data, {
      route: "leaderboards.elo",
      url: url.toString(),
    });
  }

  async phase(
    options: PhaseLeaderboardOptions = {},
  ): Promise<PhaseLeaderboard> {
    const { data, url } = await this.#request("phase-leaderboard", {
      query: {
        season: options.season,
        country: options.country,
        predicted: options.predicted,
      },
    });

    return this.#validator.validate(phaseLeaderboardSchema, data, {
      route: "leaderboards.phase",
      url: url.toString(),
    });
  }

  async records(
    options: RecordLeaderboardOptions = {},
  ): Promise<RecordLeaderboardEntry[]> {
    const { data, url } = await this.#request("record-leaderboard", {
      query: {
        season: options.season,
        distinct: options.distinct,
      },
    });

    return this.#validator.validate(recordLeaderboardSchema, data, {
      route: "leaderboards.records",
      url: url.toString(),
    });
  }
}
