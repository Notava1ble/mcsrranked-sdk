import { type LiveOverview, liveOverviewSchema } from "../schemas/live.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export class LiveResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async get(): Promise<LiveOverview> {
    const { data, url } = await this.#request("live");

    return this.#validator.validate(liveOverviewSchema, data, {
      route: "live.get",
      url: url.toString(),
    });
  }
}
