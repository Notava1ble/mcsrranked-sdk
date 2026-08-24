export type QueryParameterValue = string | number | boolean | undefined;

export type QueryParameters = Readonly<Record<string, QueryParameterValue>>;

function assertRelativePath(path: string): void {
  const trimmedPath = path.trimStart();

  if (
    /^[a-z][a-z\d+.-]*:/i.test(trimmedPath) ||
    trimmedPath.startsWith("/") ||
    trimmedPath.startsWith("\\")
  ) {
    throw new TypeError("MCSR Ranked request paths must be relative URLs");
  }
}

export function buildUrl(
  baseUrl: URL,
  path: string,
  query?: QueryParameters,
): URL {
  assertRelativePath(path);

  const url = new URL(path, baseUrl);

  if (query !== undefined) {
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(name, String(value));
      }
    }
  }

  return url;
}
