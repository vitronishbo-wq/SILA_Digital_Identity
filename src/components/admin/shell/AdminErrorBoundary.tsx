import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export interface AdminErrorBoundaryProps {
  children: ReactNode;
}

export interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Ministry Admin Portal Shell:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-[#13151c] border-2 border-rose-500/40 text-center space-y-4 font-mono max-w-xl mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              ERRO DE PROCESSAMENTO INTERNO
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              Ocorreu uma exceção inesperada na camada do portal. Os dados civis permanecem seguros na infraestrutura MJDH.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] text-rose-300 text-left font-mono overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 mx-auto transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REINICIAR INTERFACE DO PORTAL</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
