import type { JSX } from "solid-js";
import { ErrorBoundary, resetErrorBoundaries } from "solid-js";
import type { ApiError } from "@hiecom/mirror-node";

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
        const apiError: ApiError =
          typeof error === "object" && error !== null && "_tag" in error
            ? (error as ApiError)
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
