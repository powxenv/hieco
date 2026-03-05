import type { JSX } from "solid-js";
import { ErrorBoundary, resetErrorBoundaries } from "solid-js";
import type { ApiError } from "@hieco/mirror";

export interface ApiErrorFallbackProps {
  error: ApiError;
  reset: () => void;
}

export interface ApiErrorBoundaryProps {
  readonly children: JSX.Element;
  readonly fallback: (props: ApiErrorFallbackProps) => JSX.Element;
}

export function ApiErrorBoundary(props: ApiErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      fallback={(error) => {
        const isApiError = (e: unknown): e is ApiError => {
          return (
            typeof e === "object" &&
            e !== null &&
            "_tag" in e &&
            "message" in e &&
            typeof (e as Record<string, unknown>)._tag === "string" &&
            typeof (e as Record<string, unknown>).message === "string"
          );
        };

        const apiError: ApiError = isApiError(error)
          ? error
          : {
              _tag: "UnknownError",
              message: error instanceof Error ? error.message : "Unknown error occurred",
            };

        return props.fallback({
          error: apiError,
          reset: () => resetErrorBoundaries(),
        });
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}
