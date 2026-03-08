import type { ComponentType, ReactNode } from "react";
import { Component } from "react";
import type { ApiError } from "@hieco/mirror";
import { toApiError } from "@hieco/utils";

export interface ApiErrorFallbackProps {
  error: ApiError;
  reset: () => void;
  render: (props: ApiErrorFallbackProps) => ReactNode;
}

export function ApiErrorFallback({ error, reset, render }: ApiErrorFallbackProps): ReactNode {
  return render({ error, reset, render });
}

export interface ApiErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback: (props: ApiErrorFallbackProps) => ReactNode;
}

export interface ApiErrorBoundaryState {
  readonly error: ApiError | null;
}

export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): ApiErrorBoundaryState {
    return { error: toApiError(error) };
  }

  reset(): void {
    this.setState({ error: null });
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <ApiErrorFallback
          error={this.state.error}
          reset={() => this.reset()}
          render={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}
export function withApiErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback: (props: ApiErrorFallbackProps) => ReactNode,
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ApiErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ApiErrorBoundary>
  );

  WrappedComponent.displayName = `withApiErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
