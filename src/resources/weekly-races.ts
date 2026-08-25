import { type WeeklyRace, weeklyRaceSchema } from "../schemas/weekly-race.js";
import type { RouteRequester } from "../transport.js";
import type { ResponseValidator } from "../validation.js";

export class WeeklyRacesResource {
  readonly #request: RouteRequester;
  readonly #validator: ResponseValidator;

  constructor(request: RouteRequester, validator: ResponseValidator) {
    this.#request = request;
    this.#validator = validator;
  }

  current(): Promise<WeeklyRace> {
    return this.#get("weekly-race", "weeklyRaces.current");
  }

  get(id: number): Promise<WeeklyRace> {
    return this.#get(`weekly-race/${id}`, "weeklyRaces.get");
  }

  async #get(path: string, route: string): Promise<WeeklyRace> {
    const { data, url } = await this.#request(path);

    return this.#validator.validate(weeklyRaceSchema, data, {
      route,
      url: url.toString(),
    });
  }
}
