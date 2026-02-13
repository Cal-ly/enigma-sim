import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackMessage?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

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
        <div className="p-8 text-center text-foreground" role="alert">
          <h2 className="text-accent mb-2">Something went wrong</h2>
          <p>{this.props.fallbackMessage ?? 'An unexpected error occurred.'}</p>
          <details className="my-4 text-left max-w-[600px] mx-auto">
            <summary>Error details</summary>
            <pre className="bg-surface p-4 rounded-default overflow-x-auto font-mono text-[0.85rem]">
              {this.state.error.message}
            </pre>
          </details>
          <button
            className="mt-4 px-6 py-2 bg-accent text-white border-none rounded-default cursor-pointer font-semibold"
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
