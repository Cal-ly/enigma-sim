import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackMessage?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Catches render errors in child components and shows a recovery UI
 * instead of a blank white screen. Particularly relevant for engine
 * constructor throws on invalid configuration during transitions.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong</h2>
          <p>{this.props.fallbackMessage ?? 'An unexpected error occurred.'}</p>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
          <button onClick={() => this.setState({ error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
