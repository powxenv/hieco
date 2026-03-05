import type {
  TransactionContext,
  TransactionMiddleware,
  TransactionReceiptData,
  SdkResult,
  RetryConfig,
} from "../types.ts";
import { DEFAULT_RETRY_CONFIG } from "../types.ts";
import type { SdkError } from "../errors/types.ts";

function computeDelay(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const clampedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  if (!config.jitter) return clampedDelay;

  return clampedDelay * (0.5 + Math.random() * 0.5);
}

function isRetryable(error: SdkError, retryableStatuses: ReadonlyArray<string>): boolean {
  if (error._tag === "TransactionError") {
    return retryableStatuses.includes(error.status);
  }

  return false;
}

function resolveRetryConfig(userConfig: RetryConfig): Required<RetryConfig> {
  return {
    maxRetries: userConfig.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries,
    initialDelayMs: userConfig.initialDelayMs ?? DEFAULT_RETRY_CONFIG.initialDelayMs,
    maxDelayMs: userConfig.maxDelayMs ?? DEFAULT_RETRY_CONFIG.maxDelayMs,
    backoffMultiplier: userConfig.backoffMultiplier ?? DEFAULT_RETRY_CONFIG.backoffMultiplier,
    jitter: userConfig.jitter ?? DEFAULT_RETRY_CONFIG.jitter,
    retryableStatuses: userConfig.retryableStatuses ?? DEFAULT_RETRY_CONFIG.retryableStatuses,
  };
}

export function createRetryMiddleware(userConfig: RetryConfig = {}): TransactionMiddleware {
  const defaultConfig = resolveRetryConfig(userConfig);

  return async (
    context: TransactionContext,
    next: () => Promise<SdkResult<TransactionReceiptData>>,
  ): Promise<SdkResult<TransactionReceiptData>> => {
    if (context.retry === false) return next();

    const config = context.retry ? resolveRetryConfig(context.retry) : defaultConfig;

    let lastResult: SdkResult<TransactionReceiptData> | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      const result = await next();

      if (result.success) return result;

      lastResult = result;

      if (attempt >= config.maxRetries) break;
      if (!isRetryable(result.error, config.retryableStatuses)) break;

      const delayMs = computeDelay(attempt, config);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (!lastResult) {
      return {
        success: false,
        error: {
          _tag: "TransactionError",
          status: "RETRY_EXHAUSTED",
          transactionId: "unknown",
          message: "Retry loop completed without producing a result",
        },
      };
    }

    return lastResult;
  };
}
