import type { QueryParameters } from "./url.js";

export interface RankedRequestOptions extends RequestInit {
  readonly query?: QueryParameters;
}

export interface CompletedRequest<T> {
  readonly data: T;
  readonly url: URL;
}

export type RouteRequester = <T>(
  path: string,
  options?: RankedRequestOptions,
) => Promise<CompletedRequest<T>>;

export function requestInitWithoutQuery(
  options: RankedRequestOptions | undefined,
): RequestInit | undefined {
  if (options === undefined) {
    return undefined;
  }

  const { query: _query, ...init } = options;
  return init;
}
