import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * PanelErrorBoundary
 * 
 * Wraps individual admin panels so that a crash in one panel
 * (e.g. Marketing) does NOT take down the entire POS system.
 * 
 * The user sees a contained error message and can retry without
 * needing to refresh the entire app or losing their current cart.
 */
export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[PanelCrash:${this.props.name}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-white/80">
            {this.props.name} encountered an error
          </h3>
          <p className="text-white/40 text-sm max-w-md">
            This panel crashed but the rest of the system is still running. 
            Your cart and orders are safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all text-sm"
          >
            Retry Panel
          </button>
          {this.state.error && (
            <details className="mt-2 text-xs text-white/20 max-w-md">
              <summary className="cursor-pointer hover:text-white/40">Technical Details</summary>
              <pre className="mt-1 text-left overflow-auto p-2 bg-black/30 rounded">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
