import { RankedError } from "./errors.js";

const FIRST_RETRY_MAX_DELAY = 500;
const MAX_RETRY_DELAY = 5_000;

export function isRetryableError(error: unknown): error is RankedError {
  return (
    error instanceof RankedError &&
    (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT")
  );
}

function createAbortedError(signal: AbortSignal): RankedError {
  return new RankedError("MCSR Ranked request was aborted", {
    code: "ABORTED",
    cause: signal.reason,
  });
}

function retryDelay(retryNumber: number): number {
  const upperBound = Math.min(
    FIRST_RETRY_MAX_DELAY * 2 ** (retryNumber - 1),
    MAX_RETRY_DELAY,
  );

  return Math.random() * upperBound;
}

export function waitForRetry(
  retryNumber: number,
  callerSignal: AbortSignal | undefined,
): Promise<void> {
  if (callerSignal === undefined) {
    return new Promise((resolve) => {
      setTimeout(resolve, retryDelay(retryNumber));
    });
  }

  if (callerSignal.aborted) {
    return Promise.reject(createAbortedError(callerSignal));
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(createAbortedError(callerSignal));
    };
    const timeoutId = setTimeout(() => {
      callerSignal.removeEventListener("abort", onAbort);
      resolve();
    }, retryDelay(retryNumber));

    callerSignal.addEventListener("abort", onAbort, { once: true });
  });
}
