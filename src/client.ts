import { RankedError } from "./errors.js";
import { createRequestCancellation, processResponse } from "./request.js";
import { UsersResource } from "./resources/users.js";
import {
  type CompletedRequest,
  type RankedRequestOptions,
  requestInitWithoutQuery,
} from "./transport.js";
import { buildUrl } from "./url.js";
import {
  createResponseValidator,
  type ValidationConfiguration,
} from "./validation.js";

const DEFAULT_BASE_URL = "https://api.mcsrranked.com/";
const DEFAULT_TIMEOUT = 10_000;

export interface RankedClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly timeout?: number;
  readonly validation?: ValidationConfiguration;
}

export class RankedClient {
  readonly #baseUrl: URL;
  readonly #fetchImplementation: typeof globalThis.fetch;
  readonly #timeout: number;

  readonly users: UsersResource;

  constructor(options: RankedClientOptions = {}) {
    this.#baseUrl = new URL(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#fetchImplementation = options.fetch ?? globalThis.fetch;
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    const validator = createResponseValidator(options.validation);

    this.users = new UsersResource(
      (path, requestOptions) => this.#requestWithMetadata(path, requestOptions),
      validator,
    );
  }

  fetch(path: string, options?: RankedRequestOptions): Promise<Response> {
    const url = buildUrl(this.#baseUrl, path, options?.query);
    return this.#fetchImplementation(url, requestInitWithoutQuery(options));
  }

  async #requestWithMetadata<T = unknown>(
    path: string,
    options?: RankedRequestOptions,
  ): Promise<CompletedRequest<T>> {
    const url = buildUrl(this.#baseUrl, path, options?.query);
    const cancellation = createRequestCancellation(
      options?.signal ?? undefined,
      this.#timeout,
    );

    try {
      let response: Response;

      try {
        response = await this.#fetchImplementation(url, {
          ...requestInitWithoutQuery(options),
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

      const data = await processResponse<T>(response, cancellation);
      return { data, url };
    } finally {
      cancellation.dispose();
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
