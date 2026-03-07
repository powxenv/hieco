import type { JSX } from "solid-js";
import { ErrorBoundary, resetErrorBoundaries } from "solid-js";
import type { ApiError } from "@hieco/mirror";
import { toApiError } from "@hieco/utils";

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
        return props.fallback({
          error: toApiError(error),
          reset: () => resetErrorBoundaries(),
        });
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}
