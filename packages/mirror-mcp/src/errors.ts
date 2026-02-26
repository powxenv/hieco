import type { ApiResult, ApiError } from "@hiecom/types";
import { isSuccess } from "@hiecom/mirror-shared";

export class MirrorMCPError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly type?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MirrorMCPError";
  }
}

export function handleApiResult<T>(result: ApiResult<T>, context?: string): T {
  if (isSuccess(result)) {
    return result.data;
  }

  const error = result.error ?? { message: "Unknown error", _tag: "UnknownError" };
  const contextPrefix = context ? `[${context}] ` : "";
  const enhancedMessage = buildErrorMessage(error);

  throw new MirrorMCPError(
    `${contextPrefix}${enhancedMessage}`,
    error.code,
    error._tag,
    error.status,
  );
}

function buildErrorMessage(error: ApiError): string {
  const parts: string[] = [];

  if (error._tag) parts.push(`${error._tag}:`);
  parts.push(error.message);

  if (error.status) parts.push(`(HTTP ${error.status})`);
  if (error.code) parts.push(`[code: ${error.code}]`);

  const suggestion = getSuggestionForError(error);
  if (suggestion) parts.push(`Tip: ${suggestion}`);

  return parts.join(" ");
}

function getSuggestionForError(error: ApiError): string | null {
  if (error._tag === "NotFoundError") return "Verify the ID format";
  if (error._tag === "RateLimitError") return "Wait before retry";
  if (error._tag === "ValidationError") return "Check input parameters";
  if (error._tag === "NetworkError") return "Check network connection";
  if (error.message?.includes("invalid")) return "IDs must be '0.0.123' format";
  if (error.message?.includes("timestamp")) return "Use ISO 8601 format";

  return null;
}
