import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class VirtualTabErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Virtual Tab Error:', error, errorInfo);
        // TODO: Log to Sentry or similar service
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Algo deu errado
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || 'Ocorreu um erro inesperado'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Error Fallback Component
export function ErrorFallback({ error }: { error: Error | null }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Erro no Sistema
                </h1>
                <p className="text-gray-600 mb-6">
                    {error?.message || 'Ocorreu um erro inesperado'}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Recarregar
                    </button>
                </div>
            </div>
        </div>
    );
}
