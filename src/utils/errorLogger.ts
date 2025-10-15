// Centralized error logging utility
import * as Sentry from "@sentry/react";

const isDevelopment = import.meta.env.DEV;

export const logError = (error: unknown, context?: string) => {
  if (isDevelopment) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  } else {
    // Send to Sentry in production
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: { context: context || 'unknown' }
      });
    }
  }
};

export const logInfo = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[Info]: ${message}`, data || '');
  }
};

export const logWarning = (message: string, data?: any) => {
  if (isDevelopment) {
    console.warn(`[Warning]: ${message}`, data || '');
  }
};
