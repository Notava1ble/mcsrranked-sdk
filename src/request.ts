import { RankedError } from "./errors.js";

interface SuccessEnvelope<T> {
  readonly status: "success";
  readonly data: T;
}

interface ErrorEnvelope {
  readonly status: "error";
  readonly data: unknown;
}

function isSuccessEnvelope<T>(value: unknown): value is SuccessEnvelope<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "success" &&
    "data" in value
  );
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "error" &&
    "data" in value
  );
}

function getErrorDetails(value: unknown): unknown {
  if (isErrorEnvelope(value)) {
    return value.data;
  }

  return value;
}

function createHttpError(
  response: Response,
  details: unknown,
  cause?: unknown,
): RankedError {
  return new RankedError(
    `MCSR Ranked request failed with HTTP status ${response.status}`,
    {
      code: "HTTP_ERROR",
      status: response.status,
      ...(details === undefined ? {} : { details }),
      ...(cause === undefined ? {} : { cause }),
    },
  );
}

function createInvalidResponseError(
  message: string,
  details: unknown,
  cause?: unknown,
): RankedError {
  return new RankedError(message, {
    code: "INVALID_RESPONSE",
    ...(details === undefined ? {} : { details }),
    ...(cause === undefined ? {} : { cause }),
  });
}

export interface RequestCancellation {
  readonly signal: AbortSignal;
  cancellationError(): RankedError | undefined;
  dispose(): void;
}

export type ResponseProcessor = <T>(
  response: Response,
  cancellation: RequestCancellation,
) => Promise<T>;

export function createRequestCancellation(
  callerSignal: AbortSignal | undefined,
  timeout: number,
): RequestCancellation {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(callerSignal?.reason);

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  let timeoutReason: DOMException | undefined;
  const timeoutId = setTimeout(() => {
    if (controller.signal.aborted) {
      return;
    }

    timeoutReason = new DOMException(
      "MCSR Ranked request timed out",
      "TimeoutError",
    );
    controller.abort(timeoutReason);
  }, timeout);

  return {
    signal: controller.signal,
    cancellationError() {
      if (timeoutReason !== undefined) {
        return new RankedError("MCSR Ranked request timed out", {
          code: "TIMEOUT",
          cause: timeoutReason,
        });
      }

      if (callerSignal?.aborted) {
        return new RankedError("MCSR Ranked request was aborted", {
          code: "ABORTED",
          cause: callerSignal.reason,
        });
      }

      return undefined;
    },
    dispose() {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    },
  };
}

async function readResponseText(
  response: Response,
  cancellation: RequestCancellation,
): Promise<string> {
  try {
    return await response.text();
  } catch (cause) {
    const cancellationError = cancellation.cancellationError();

    if (cancellationError !== undefined) {
      throw cancellationError;
    }

    if (!response.ok) {
      throw createHttpError(response, undefined, cause);
    }

    throw createInvalidResponseError(
      "MCSR Ranked returned an unreadable response body",
      undefined,
      cause,
    );
  }
}

function parseResponseBody(response: Response, responseText: string): unknown {
  try {
    return JSON.parse(responseText);
  } catch (cause) {
    if (!response.ok) {
      throw createHttpError(response, responseText, cause);
    }

    throw createInvalidResponseError(
      "MCSR Ranked returned an invalid response body",
      responseText,
      cause,
    );
  }
}

function unwrapResponse<T>(response: Response, body: unknown): T {
  if (!response.ok) {
    throw createHttpError(response, getErrorDetails(body));
  }

  if (!isSuccessEnvelope<T>(body)) {
    throw createInvalidResponseError(
      "MCSR Ranked returned an invalid response envelope",
      body,
    );
  }

  return body.data;
}

export async function processResponse<T>(
  response: Response,
  cancellation: RequestCancellation,
): Promise<T> {
  const body = await processRawResponse<unknown>(response, cancellation);

  return unwrapResponse<T>(response, body);
}

export async function processRawResponse<T>(
  response: Response,
  cancellation: RequestCancellation,
): Promise<T> {
  const responseText = await readResponseText(response, cancellation);
  const body = parseResponseBody(response, responseText);

  if (!response.ok) {
    throw createHttpError(response, getErrorDetails(body));
  }

  return body as T;
}
