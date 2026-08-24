import { type User, userSchema } from "../schemas/user.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export interface UsersGetOptions {
  readonly season?: number;
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
}
