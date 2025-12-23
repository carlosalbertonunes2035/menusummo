// TODO: Uncomment after installing @sentry/react
// import { captureException, captureMessage } from './sentry';

// Temporary stubs until Sentry is installed
const captureException = (error: any) => console.error('[Sentry Stub]', error);
const captureMessage = (message: string, level?: string) => console.warn('[Sentry Stub]', message, level);


/**
 * Production-safe logger that integrates with Sentry
 * Automatically filters out logs in production unless they're errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: any;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }

    info(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.info(this.formatMessage('info', message, context));
        }
    }

    warn(message: string, context?: LogContext): void {
        const formatted = this.formatMessage('warn', message, context);

        if (this.isDevelopment) {
            console.warn(formatted);
        } else {
            // Send warnings to Sentry in production
            captureMessage(formatted, 'warning');
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const formatted = this.formatMessage('error', message, context);

        // Always log errors to console
        console.error(formatted, error);

        // Send to Sentry in production
        if (!this.isDevelopment && error) {
            captureException(error instanceof Error ? error : new Error(String(error)));
        }
    }

    // Utility for performance tracking
    time(label: string): void {
        if (this.isDevelopment) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const { debug, info, warn, error, time, timeEnd } = logger;
