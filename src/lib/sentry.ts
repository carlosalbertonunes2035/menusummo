import * as Sentry from '@sentry/react';

export const initSentry = () => {
    // Only initialize in production
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,

            // Performance Monitoring
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],

            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: 0.1, // 10% of transactions

            // Capture Replay for 10% of all sessions,
            // plus for 100% of sessions with an error
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            // Filter out sensitive data
            beforeSend(event: Sentry.ErrorEvent) {
                // Remove sensitive data from breadcrumbs
                if (event.breadcrumbs) {
                    event.breadcrumbs = event.breadcrumbs.map((breadcrumb: Sentry.Breadcrumb) => {
                        if (breadcrumb.data) {
                            delete breadcrumb.data.apiKey;
                            delete breadcrumb.data.password;
                            delete breadcrumb.data.token;
                        }
                        return breadcrumb;
                    });
                }
                return event;
            },
        });
    }
};

// Custom error boundary
export const ErrorBoundary = Sentry.ErrorBoundary;

// Utility to capture exceptions manually
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
