import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import * as Sentry from "@sentry/react";

// Initialize Sentry only in production
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "", // Will be set via environment variable
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Don't send events if DSN is not configured
      if (!import.meta.env.VITE_SENTRY_DSN) {
        return null;
      }
      return event;
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
