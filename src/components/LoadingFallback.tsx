import React from 'react';

/**
 * Loading fallback component for lazy-loaded routes
 * Provides a smooth loading experience during code splitting
 */
export const LoadingFallback: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50">
            <div className="text-center">
                {/* Animated spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-orange-200 rounded-full opacity-20"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                </div>

                {/* Loading text */}
                <h2 className="text-xl font-semibold text-white mb-2">
                    Carregando...
                </h2>
                <p className="text-orange-700 text-sm">
                    Preparando a interface
                </p>
            </div>
        </div>
    );
};

export default LoadingFallback;
