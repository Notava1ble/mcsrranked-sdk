export type RankedErrorCode =
  | "ABORTED"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "MISSING_PRIVATE_KEY"
  | "NETWORK_ERROR"
  | "TIMEOUT";

interface RankedErrorOptions extends ErrorOptions {
  readonly code: RankedErrorCode;
  readonly status?: number;
  readonly details?: unknown;
}

export class RankedError extends Error {
  readonly code: RankedErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, options: RankedErrorOptions) {
    super(message, options);
    this.name = "RankedError";
    this.code = options.code;

    if (options.status !== undefined) {
      this.status = options.status;
    }

    if (options.details !== undefined) {
      this.details = options.details;
    }
  }
}
