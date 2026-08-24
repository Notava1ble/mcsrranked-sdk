import { RankedError } from "./errors.js";
import { createRequestCancellation, processResponse } from "./request.js";
import { UsersResource } from "./resources/users.js";
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
  readonly retries?: number;
  readonly timeout?: number;
  readonly validation?: ValidationConfiguration;
}

export class RankedClient {
  readonly #baseUrl: URL;
  readonly #fetchImplementation: typeof globalThis.fetch;
  readonly #retries: number;
  readonly #timeout: number;

  readonly users: UsersResource;

  constructor(options: RankedClientOptions = {}) {
    this.#baseUrl = new URL(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#fetchImplementation = options.fetch ?? globalThis.fetch;
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.#retries = options.retries ?? DEFAULT_RETRIES;
    assertTimeout(this.#timeout);
    assertRetries(this.#retries);
    const validator = createResponseValidator(options.validation);

    this.users = new UsersResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
  }

  fetch(path: string, options?: RankedFetchOptions): Promise<Response> {
    const url = buildUrl(this.#baseUrl, path, options?.query);
    return this.#fetchImplementation(url, fetchInitWithoutQuery(options));
  }

  async #requestAttempt<T>(
    url: URL,
    options?: RankedRequestOptions,
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

      let response: Response;

      try {
        response = await this.#fetchImplementation(url, {
          ...(options?.headers === undefined
            ? {}
            : { headers: options.headers }),
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

      return await processResponse<T>(response, cancellation);
    } finally {
      cancellation.dispose();
    }
  }

  async #requestWithMetadata<T = unknown>(
    path: string,
    options?: RankedRequestOptions,
  ): Promise<CompletedRequest<T>> {
    const url = buildUrl(this.#baseUrl, path, options?.query);

    for (let attempt = 0; ; attempt += 1) {
      try {
        const data = await this.#requestAttempt<T>(url, options);
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
