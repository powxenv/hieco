import type { VNode } from "preact";
import { useErrorBoundary } from "preact/hooks";
import type { ApiError } from "@hiecom/mirror-node";

export interface ApiErrorFallbackProps {
  error: ApiError;
  reset: () => void;
  render: (props: ApiErrorFallbackProps) => VNode;
}

export function ApiErrorFallback({ error, reset, render }: ApiErrorFallbackProps): VNode {
  return render({ error, reset, render });
}

export interface ApiErrorBoundaryProps {
  readonly children: VNode;
  readonly fallback: (props: ApiErrorFallbackProps) => VNode;
}

export function ApiErrorBoundary({ children, fallback }: ApiErrorBoundaryProps): VNode {
  const [error, resetError] = useErrorBoundary();

  if (error) {
    const apiError = toApiError(error);

    const reset = () => {
      resetError();
    };

    return <ApiErrorFallback error={apiError} reset={reset} render={fallback} />;
  }

  return children;
}

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  return {
    _tag: "UnknownError",
    message: error instanceof Error ? error.message : "Unknown error occurred",
  };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" && error !== null && "_tag" in error && typeof error._tag === "string"
  );
}

export function withApiErrorBoundary<P extends object>(
  Component: (props: P) => VNode,
  fallback: (props: ApiErrorFallbackProps) => VNode,
): (props: P) => VNode {
  return (props: P) => (
    <ApiErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ApiErrorBoundary>
  );
}
