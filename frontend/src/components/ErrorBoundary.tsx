'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-hive-bg flex items-center justify-center p-8">
          <div className="glass p-8 rounded-2xl border border-red/50 max-w-2xl text-center">
            <h2 className="text-red text-2xl font-bold mb-4">Application Error</h2>
            <p className="text-hive-textDim mb-4">A client-side exception occurred:</p>
            <pre className="text-left text-xs bg-hive-bg p-4 rounded border border-hive-border overflow-auto text-red max-h-64">
              {this.state.error?.message}
              {this.state.error?.stack && '\n\n' + this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-cyan text-hive-bg font-mono rounded hover:bg-cyan/80 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}