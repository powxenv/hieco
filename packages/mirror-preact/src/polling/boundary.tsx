import type { VNode } from "preact";
import { useErrorBoundary } from "preact/hooks";
import type { ApiError } from "@hieco/mirror";
import { toApiError } from "@hieco/utils";

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
    const reset = () => {
      resetError();
    };

    return <ApiErrorFallback error={toApiError(error)} reset={reset} render={fallback} />;
  }

  return children;
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
