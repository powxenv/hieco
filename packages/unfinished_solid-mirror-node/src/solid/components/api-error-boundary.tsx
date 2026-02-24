import { ErrorBoundary as SolidErrorBoundary, type ParentComponent, type JSX } from "solid-js";
import type { ApiError } from "@hiecom/mirror-node";

export interface ApiErrorFallbackProps {
  error: ApiError;
  reset: () => void;
  render: (props: ApiErrorFallbackProps) => JSX.Element;
}

export function ApiErrorFallback(props: ApiErrorFallbackProps): JSX.Element {
  return props.render(props);
}

export interface ApiErrorBoundaryProps {
  children?: JSX.Element;
  fallback: (props: ApiErrorFallbackProps) => JSX.Element;
}

export interface ApiErrorBoundaryState {
  readonly error: ApiError | null;
}

export function ApiErrorBoundary(props: ApiErrorBoundaryProps): JSX.Element {
  return (
    <SolidErrorBoundary
      fallback={(error) => {
        const apiError = isApiError(error)
          ? error
          : {
              _tag: "UnknownError" as const,
              message: error instanceof Error ? error.message : "Unknown error occurred",
            };
        return props.fallback({
          error: apiError,
          reset: () => window.location.reload(),
          render: props.fallback,
        });
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "_tag" in error && typeof error._tag === "string";
}

export function withApiErrorBoundary<P extends object>(
  Component: (props: P) => JSX.Element,
  fallback: (props: ApiErrorFallbackProps) => JSX.Element,
): (props: P) => JSX.Element {
  return (props: P) => (
    <ApiErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ApiErrorBoundary>
  );
}
