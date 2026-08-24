import * as v from "valibot";

import { RankedError } from "./errors.js";
import {
  createRequestCancellation,
  processResponse,
  type RequestCancellation,
} from "./request.js";
import { type User, userSchema } from "./schemas/user.js";

const DEFAULT_BASE_URL = "https://api.mcsrranked.com/";
const DEFAULT_TIMEOUT = 10_000;

export interface RankedClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly timeout?: number;
}

class UsersResource {
  readonly #client: RankedClient;

  constructor(client: RankedClient) {
    this.#client = client;
  }

  async get(identifier: string): Promise<User> {
    const path = `users/${encodeURIComponent(identifier)}`;
    const data = await this.#client.request(path);
    const result = v.safeParse(userSchema, data);

    if (!result.success) {
      console.warn(
        `Invalid response from users.get: ${result.issues.length} issue(s)`,
      );
    }

    return data as User;
  }
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
    this.users = new UsersResource(this);
  }

  fetch(path: string, init?: RequestInit): Promise<Response> {
    return this.#fetchImplementation(new URL(path, this.#baseUrl), init);
  }

  async #fetchResponse(
    path: string,
    init: RequestInit | undefined,
    cancellation: RequestCancellation,
  ): Promise<Response> {
    try {
      return await this.fetch(path, { ...init, signal: cancellation.signal });
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
  }

  async request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const cancellation = createRequestCancellation(
      init?.signal ?? undefined,
      this.#timeout,
    );

    try {
      const response = await this.#fetchResponse(path, init, cancellation);
      return await processResponse<T>(response, cancellation);
    } finally {
      cancellation.dispose();
    }
  }
}
