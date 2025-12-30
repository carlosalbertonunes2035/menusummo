import React from 'react';

/**
 * Loading Skeleton for Table Menu
 */
export const TableMenuSkeleton = () => (
    <div className="min-h-screen bg-gray-50 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="h-8 bg-white/20 rounded w-32 mb-2" />
                <div className="h-4 bg-white/20 rounded w-48" />
            </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="max-w-4xl mx-auto p-4">
            <div className="h-12 bg-gray-200 rounded-lg mb-4" />
        </div>

        {/* Categories Skeleton */}
        <div className="bg-white border-b p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />
                ))}
            </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        <div className="aspect-square bg-gray-200" />
                        <div className="p-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Loading Skeleton for Checkout
 */
export const CheckoutSkeleton = () => (
    <div className="min-h-screen bg-gray-50 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="h-8 bg-white/20 rounded w-48 mb-2" />
                <div className="h-4 bg-white/20 rounded w-24" />
            </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
            {/* Customer Info Skeleton */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="bg-white rounded-xl p-6 mb-4">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                <div className="space-y-3 mb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-40" />
                            <div className="h-4 bg-gray-200 rounded w-16" />
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4">
                    <div className="h-8 bg-gray-200 rounded w-full" />
                </div>
            </div>

            {/* Payment Options Skeleton */}
            <div className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded-xl" />
                    <div className="h-16 bg-gray-200 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

/**
 * Loading Skeleton for QR Code Manager
 */
export const QRCodeManagerSkeleton = () => (
    <div className="max-w-6xl mx-auto p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-96" />
        </div>

        {/* URL Base Skeleton */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="h-4 bg-blue-200 rounded w-full" />
        </div>

        {/* Add Table Skeleton */}
        <div className="bg-white rounded-lg p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
            </div>
        </div>

        {/* Tables Grid Skeleton */}
        <div className="bg-white rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-3" />
                        <div className="bg-gray-100 rounded-lg p-3 mb-3">
                            <div className="aspect-square bg-gray-200 rounded" />
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-3" />
                        <div className="flex gap-2">
                            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Generic Loading Spinner
 */
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div className={`${sizeClasses[size]} border-4 border-orange-500 border-t-transparent rounded-full animate-spin`} />
        </div>
    );
};

/**
 * Full Page Loading
 */
export const FullPageLoading = ({ message = 'Carregando...' }: { message?: string }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">{message}</p>
        </div>
    </div>
);
