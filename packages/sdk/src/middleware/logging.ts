import type {
  TransactionContext,
  TransactionMiddleware,
  TransactionReceiptData,
  SdkResult,
  LogLevel,
} from "../types.ts";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

function shouldLog(configured: LogLevel, target: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[configured] >= LOG_LEVEL_PRIORITY[target];
}

function formatDuration(startedAt: number): string {
  return `${String(Date.now() - startedAt)}ms`;
}

export function createLoggingMiddleware(level: LogLevel): TransactionMiddleware {
  if (level === "none") {
    return (_context: TransactionContext, next: () => Promise<SdkResult<TransactionReceiptData>>) =>
      next();
  }

  return async (
    context: TransactionContext,
    next: () => Promise<SdkResult<TransactionReceiptData>>,
  ): Promise<SdkResult<TransactionReceiptData>> => {
    if (shouldLog(level, "info")) {
      console.info(`[hieco-sdk] ${context.type} transaction starting`, {
        type: context.type,
        attempt: context.attempt,
      });
    }

    if (shouldLog(level, "debug")) {
      console.debug(`[hieco-sdk] ${context.type} params`, context.params);
    }

    const result = await next();

    if (result.success) {
      if (shouldLog(level, "info")) {
        console.info(`[hieco-sdk] ${context.type} transaction confirmed`, {
          status: result.data.status,
          transactionId: result.data.transactionId,
          duration: formatDuration(context.startedAt),
        });
      }
    } else {
      if (shouldLog(level, "error")) {
        console.error(`[hieco-sdk] ${context.type} transaction failed`, {
          error: result.error._tag,
          message: result.error.message,
          duration: formatDuration(context.startedAt),
        });
      }
    }

    return result;
  };
}
