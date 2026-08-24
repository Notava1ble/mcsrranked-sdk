import type { QueryParameters } from "./url.js";

export interface RankedFetchOptions extends RequestInit {
  readonly query?: QueryParameters;
}

export interface RankedRequestOptions {
  readonly query?: QueryParameters;
  readonly headers?: HeadersInit;
  readonly signal?: AbortSignal;
}

export interface CompletedRequest<T> {
  readonly data: T;
  readonly url: URL;
}

export type RouteRequester = <T>(
  path: string,
  options?: RankedRequestOptions,
) => Promise<CompletedRequest<T>>;

export function fetchInitWithoutQuery(
  options: RankedFetchOptions | undefined,
): RequestInit | undefined {
  if (options === undefined) {
    return undefined;
  }

  const { query: _query, ...init } = options;
  return init;
}
