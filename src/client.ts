import { RankedError } from "./errors.js";
import {
  createRequestCancellation,
  processRawResponse,
  processResponse,
  type ResponseProcessor,
} from "./request.js";
import { LeaderboardsResource } from "./resources/leaderboards.js";
import { LiveResource } from "./resources/live.js";
import { MatchesResource } from "./resources/matches.js";
import { StatusResource } from "./resources/status.js";
import { UsersResource } from "./resources/users.js";
import { VersusResource } from "./resources/versus.js";
import { WeeklyRacesResource } from "./resources/weekly-races.js";
import { isRetryableError, waitForRetry } from "./retry.js";
import {
  type CompletedRequest,
  fetchInitWithoutQuery,
  type RankedFetchOptions,
  type RankedRequestOptions,
} from "./transport.js";
import { buildUrl } from "./url.js";
import {
  createResponseValidator,
  type ValidationConfiguration,
} from "./validation.js";

const DEFAULT_BASE_URL = "https://api.mcsrranked.com/";
const STATUS_HEARTBEATS_URL =
  "https://status.mcsrranked.com/api/status-page/heartbeat/mcsrranked";
const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RETRIES = 2;

function assertTimeout(timeout: number): void {
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new TypeError(
      "MCSR Ranked timeout must be a finite, positive number",
    );
  }
}

function assertRetries(retries: number): void {
  if (!Number.isFinite(retries) || !Number.isInteger(retries) || retries < 0) {
    throw new TypeError(
      "MCSR Ranked retries must be a finite, non-negative integer",
    );
  }
}

export interface RankedClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly privateKey?: string | undefined;
  readonly retries?: number;
  readonly timeout?: number;
  readonly validation?: ValidationConfiguration;
}

export class RankedClient {
  readonly #baseUrl: URL;
  readonly #fetchImplementation: typeof globalThis.fetch;
  readonly #privateKey: string | undefined;
  readonly #retries: number;
  readonly #timeout: number;

  readonly users: UsersResource;
  readonly versus: VersusResource;
  readonly matches: MatchesResource;
  readonly live: LiveResource;
  readonly leaderboards: LeaderboardsResource;
  readonly weeklyRaces: WeeklyRacesResource;
  readonly status: StatusResource;

  constructor(options: RankedClientOptions = {}) {
    const fetchImplementation = options.fetch ?? globalThis.fetch;

    this.#baseUrl = new URL(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#fetchImplementation = fetchImplementation.bind(globalThis);
    this.#privateKey = options.privateKey;
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.#retries = options.retries ?? DEFAULT_RETRIES;
    assertTimeout(this.#timeout);
    assertRetries(this.#retries);
    const validator = createResponseValidator(options.validation);

    this.users = new UsersResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.versus = new VersusResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.matches = new MatchesResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.live = new LiveResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.leaderboards = new LeaderboardsResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.weeklyRaces = new WeeklyRacesResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
    this.status = new StatusResource(
      () =>
        this.#requestUrlWithMetadata(
          new URL(STATUS_HEARTBEATS_URL),
          undefined,
          processRawResponse,
        ),
      validator,
    );
  }

  fetch(path: string, options?: RankedFetchOptions): Promise<Response> {
    const url = buildUrl(this.#baseUrl, path, options?.query);
    const init = fetchInitWithoutQuery(options);

    if (options?.includePrivateKey !== true) {
      return this.#fetchImplementation(url, init);
    }

    return this.#fetchImplementation(url, {
      ...init,
      headers: this.#headersWithPrivateKey(init?.headers),
    });
  }

  #headersWithPrivateKey(headers?: HeadersInit): Headers {
    if (this.#privateKey === undefined) {
      throw new RankedError(
        "MCSR Ranked private key is required for this request",
        { code: "MISSING_PRIVATE_KEY" },
      );
    }

    const authenticatedHeaders = new Headers(headers);
    authenticatedHeaders.set("Private-Key", this.#privateKey);
    return authenticatedHeaders;
  }

  async #requestAttempt<T>(
    url: URL,
    options?: RankedRequestOptions,
    responseProcessor: ResponseProcessor = processResponse,
  ): Promise<T> {
    const cancellation = createRequestCancellation(
      options?.signal ?? undefined,
      this.#timeout,
    );

    try {
      const initialCancellationError = cancellation.cancellationError();

      if (initialCancellationError !== undefined) {
        throw initialCancellationError;
      }

      const headers =
        options?.includePrivateKey === true
          ? this.#headersWithPrivateKey(options.headers)
          : options?.headers;
      let response: Response;

      try {
        response = await this.#fetchImplementation(url, {
          ...(headers === undefined ? {} : { headers }),
          signal: cancellation.signal,
        });
      } catch (cause) {
        const cancellationError = cancellation.cancellationError();

        if (cancellationError !== undefined) {
          throw cancellationError;
        }

        throw new RankedError(
          "MCSR Ranked request failed before receiving a response",
          {
            code: "NETWORK_ERROR",
            cause,
          },
        );
      }

      return await responseProcessor<T>(response, cancellation);
    } finally {
      cancellation.dispose();
    }
  }

  async #requestWithMetadata<T = unknown>(
    path: string,
    options?: RankedRequestOptions,
  ): Promise<CompletedRequest<T>> {
    const url = buildUrl(this.#baseUrl, path, options?.query);

    return this.#requestUrlWithMetadata(url, options);
  }

  async #requestUrlWithMetadata<T = unknown>(
    url: URL,
    options?: RankedRequestOptions,
    responseProcessor: ResponseProcessor = processResponse,
  ): Promise<CompletedRequest<T>> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const data = await this.#requestAttempt<T>(
          url,
          options,
          responseProcessor,
        );
        return { data, url };
      } catch (error) {
        if (!isRetryableError(error) || attempt >= this.#retries) {
          throw error;
        }

        await waitForRetry(attempt + 1, options?.signal);
      }
    }
  }

  async request<T = unknown>(
    path: string,
    options?: RankedRequestOptions,
  ): Promise<T> {
    const { data } = await this.#requestWithMetadata<T>(path, options);
    return data;
  }
}
