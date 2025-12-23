import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  scope?: string;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 rounded-2xl border border-red-100 text-center animate-fade-in">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            Ocorreu um erro inesperado {this.props.scope ? `no módulo ${this.props.scope}` : 'no sistema'}.
            Tente recarregar a página.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition shadow-sm"
            >
              Tentar Novamente
            </button>
            <button
              onClick={this.handleReload}
              className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Recarregar Página
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-white border border-red-200 rounded-lg text-left w-full max-w-2xl overflow-auto text-xs font-mono text-red-600">
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
