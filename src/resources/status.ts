import {
  type StatusHeartbeats,
  statusHeartbeatsSchema,
} from "../schemas/status.js";
import type { CompletedRequest } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

type StatusRequester = <T>() => Promise<CompletedRequest<T>>;

export class StatusResource {
  readonly #request: StatusRequester;
  readonly #validator: ResponseValidator;

  constructor(request: StatusRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  async heartbeats(): Promise<StatusHeartbeats> {
    const { data, url } = await this.#request();

    return this.#validator.validate(statusHeartbeatsSchema, data, {
      route: "status.heartbeats",
      url: url.toString(),
    });
  }
}
