import React from 'react';
import { clearFirestoreCache } from '../lib/firebase/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isClearing: boolean;
}

/**
 * Error Boundary que detecta erros do Firestore e limpa o cache automaticamente
 * Resolve problemas de "INTERNAL ASSERTION FAILED" e cache corrompido
 */
export class FirestoreErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            isClearing: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[FirestoreErrorBoundary] Erro capturado:', error, errorInfo);

        // Detectar erros específicos do Firestore
        const isFirestoreError =
            error.message.includes('FIRESTORE') ||
            error.message.includes('INTERNAL ASSERTION FAILED') ||
            error.message.includes('Unexpected state') ||
            error.message.includes('Missing or insufficient permissions') ||
            (error as any).code === 'permission-denied';

        if (isFirestoreError) {
            console.log('[FirestoreErrorBoundary] Erro do Firestore detectado. Limpando cache...');
            this.setState({ isClearing: true });

            // Tentar limpar cache
            const success = await clearFirestoreCache();

            if (success) {
                // Aguardar 2 segundos e recarregar
                setTimeout(() => {
                    console.log('[FirestoreErrorBoundary] Recarregando página...');
                    window.location.reload();
                }, 2000);
            } else {
                // Se falhar, recarregar mesmo assim
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        }
    }

    handleManualReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Ops! Algo deu errado.
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {this.state.isClearing ? (
                                    <>
                                        Detectamos um problema com o banco de dados.
                                        <br />
                                        <strong>Limpando cache e recarregando...</strong>
                                    </>
                                ) : (
                                    <>
                                        Ocorreu um erro inesperado.
                                        <br />
                                        Por favor, recarregue a página.
                                    </>
                                )}
                            </p>
                        </div>

                        {this.state.isClearing ? (
                            <div className="flex items-center justify-center gap-3 text-summo-primary">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                <span className="font-medium">Aguarde...</span>
                            </div>
                        ) : (
                            <button
                                onClick={this.handleManualReload}
                                className="w-full py-3 bg-summo-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg"
                            >
                                Recarregar Página
                            </button>
                        )}

                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                                    Detalhes técnicos
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-auto max-h-40">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
