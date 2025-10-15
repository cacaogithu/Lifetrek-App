// Centralized error logging utility
// Only logs errors in development, silent in production to avoid exposing sensitive info

const isDevelopment = import.meta.env.DEV;

export const logError = (error: unknown, context?: string) => {
  if (isDevelopment) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
  // In production, you could send to an error tracking service here
  // Example: Sentry.captureException(error);
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
