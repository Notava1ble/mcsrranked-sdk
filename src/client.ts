import * as v from "valibot";

import { type User, userSchema } from "./schemas/user.js";

const DEFAULT_BASE_URL = "https://api.mcsrranked.com/";

export interface RankedClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
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

  readonly users: UsersResource;

  constructor(options: RankedClientOptions = {}) {
    this.#baseUrl = new URL(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#fetchImplementation = options.fetch ?? globalThis.fetch;
    this.users = new UsersResource(this);
  }

  fetch(path: string, init?: RequestInit): Promise<Response> {
    return this.#fetchImplementation(new URL(path, this.#baseUrl), init);
  }

  async request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetch(path, init);
    const envelope = (await response.json()) as { data: T };

    return envelope.data;
  }
}
