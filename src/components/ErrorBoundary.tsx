import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught UI error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[250px] w-full flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-red-500/30 rounded-xl text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            {this.props.fallbackTitle || 'Terjadi Kendala pada Komponen UI'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4 font-mono bg-slate-950 p-3 rounded border border-slate-800 text-left overflow-x-auto">
            {this.state.error?.message || 'Unknown component runtime failure'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-md"
          >
            <RefreshCw size={14} />
            Muat Ulang Komponen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
