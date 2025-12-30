import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  scope?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logger.error(`[ErrorBoundary] Uncaught error in scope: ${this.props.scope || 'Global'}`, error, {
      errorInfo,
      scope: this.props.scope
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-center animate-fade-in">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
            <AlertTriangle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Ocorreu um erro inesperado {this.props.scope ? `no módulo ${this.props.scope}` : 'no sistema'}.
            Tente recarregar a página ou relate o problema.
          </p>

          <div className="flex gap-3 flex-wrap justify-center mb-6">
            <button
              onClick={() => this.setState({ hasError: false, showDetails: false })}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition shadow-sm"
            >
              Tentar Novamente
            </button>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Recarregar Página
            </button>
          </div>

          <button
            onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition"
          >
            {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Ver detalhes técnicos
          </button>

          {this.state.showDetails && (
            <div className="p-4 bg-white dark:bg-black/40 border border-red-200 dark:border-red-900/50 rounded-lg text-left w-full max-w-2xl overflow-auto text-[10px] font-mono text-red-600 dark:text-red-400 max-h-48 shadow-inner">
              <p className="font-bold mb-1">Error: {this.state.error?.message}</p>
              <p className="opacity-70 whitespace-pre">{this.state.errorInfo?.componentStack}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
