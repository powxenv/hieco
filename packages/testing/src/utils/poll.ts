export interface PollOptions {
  readonly timeoutMs?: number;
  readonly intervalMs?: number;
  readonly signal?: AbortSignal;
}

export class PollTimeoutError extends Error {
  readonly timeoutMs: number;
  readonly attempts: number;

  constructor(timeoutMs: number, attempts: number) {
    super(`Timed out after ${timeoutMs}ms (${attempts} attempts)`);
    this.name = "PollTimeoutError";
    this.timeoutMs = timeoutMs;
    this.attempts = attempts;
  }
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  if (signal?.aborted) throw abortReason(signal);

  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);

    if (!signal) return;

    const onAbort = (): void => {
      clearTimeout(id);
      reject(abortReason(signal));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function abortReason(signal?: AbortSignal): unknown {
  return signal?.reason ?? new Error("Aborted");
}

export type PollAttemptResult<T> =
  | { readonly done: true; readonly value: T }
  | { readonly done: false };

export async function poll<T>(
  attempt: (attemptNumber: number) => Promise<PollAttemptResult<T>>,
  options: PollOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const intervalMs = options.intervalMs ?? 250;

  const startedAt = Date.now();
  let attemptNumber = 0;

  while (Date.now() - startedAt <= timeoutMs) {
    if (options.signal?.aborted) throw abortReason(options.signal);
    attemptNumber += 1;

    const result = await attempt(attemptNumber);
    if (result.done) return result.value;

    await sleep(intervalMs, options.signal);
  }

  throw new PollTimeoutError(timeoutMs, attemptNumber);
}
